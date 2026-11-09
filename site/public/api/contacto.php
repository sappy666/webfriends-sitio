<?php
// Recibe los formularios del sitio (Contacto y footer) y los envía por correo a contacto@webfriends.cl.
// Lo llama el navegador con fetch (src/components/SiteScripts.astro y Footer.astro) y responde JSON.
//
// Protecciones: solo POST desde el propio sitio, campo trampa para bots, tiempo mínimo de llenado,
// límite de envíos por IP, largo máximo por campo y sin saltos de línea en los encabezados del correo
// (evita inyección de encabezados). Nada de lo que escribe el visitante se devuelve en la respuesta.
declare(strict_types=1);

const TO = 'contacto@webfriends.cl';
const FROM = 'contacto@webfriends.cl';
const ALLOWED_HOSTS = ['webfriends.cl', 'www.webfriends.cl'];
const MAX_PER_HOUR = 5;
const MIN_FILL_MS = 3000;
const INTERESES = [
  'general' => 'Asesoría general', 'ads' => 'Google Ads', 'seo' => 'Posicionamiento SEO',
  'web' => 'Sitio o tienda web', 'salud' => 'Plataforma para salud', 'uxui' => 'Diseño UX/UI',
];

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

function reply(int $code, string $error = ''): never {
  http_response_code($code);
  echo json_encode($error === '' ? ['ok' => true] : ['ok' => false, 'error' => $error]);
  exit;
}

/** Campo de texto del POST, recortado y con largo máximo. */
function field(string $key, int $max): string {
  $v = $_POST[$key] ?? '';
  if (!is_string($v)) return '';
  $v = trim(str_replace("\0", '', $v));
  return function_exists('mb_substr') ? mb_substr($v, 0, $max, 'UTF-8') : substr($v, 0, $max);
}

/** Una sola línea: para todo lo que va en encabezados o asunto. Trabaja por bytes, así no falla
 *  con texto en otra codificación (el patrón /u devolvería null y dejaría el campo vacío). */
function oneLine(string $v): string {
  return trim(preg_replace('/(?:[\r\n\t]|\xE2\x80[\xA8\xA9])+/', ' ', $v) ?? '');
}

/** Celular chileno normalizado a 569XXXXXXXX, o '' si no cuadra. Misma regla que el chat en
 *  src/components/WhatsAppLead.astro: se guarda listo para armar un wa.me valido. */
function telChile(string $v): string {
  $d = preg_replace('/\D/', '', $v) ?? '';
  if (strlen($d) === 9 && $d[0] === '9') return '56' . $d;
  if (strlen($d) === 11 && str_starts_with($d, '569')) return $d;
  return '';
}

/** 569XXXXXXXX -> +56 9 XXXX XXXX, solo para mostrarlo en el correo. */
function bonitoTel(string $t): string {
  return '+56 9 ' . substr($t, 3, 4) . ' ' . substr($t, 7);
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  header('Allow: POST');
  reply(405, 'method');
}

// Solo desde el propio sitio (Origin; si el navegador no lo manda, Referer).
$source = $_SERVER['HTTP_ORIGIN'] ?? ($_SERVER['HTTP_REFERER'] ?? '');
if (!in_array(parse_url($source, PHP_URL_HOST), ALLOWED_HOSTS, true)) reply(403, 'origin');

// Campo trampa: invisible para personas; si viene lleno es un bot. Se responde "ok" para no darle pistas.
if (field('website', 200) !== '') reply(200);

// Tiempo de llenado medido en el navegador: un envío en menos de 3 s no es de una persona.
$elapsed = (int) field('e', 12);
if ($elapsed < MIN_FILL_MS) reply(400, 'fast');

$formRaw = field('form', 20);
$form = in_array($formRaw, ['footer', 'whatsapp'], true) ? $formRaw : 'contacto';
$email = oneLine(field('email', 254));
$nombre = oneLine(field('nombre', 100));
$tel = oneLine(field('tel', 40));
$empresa = oneLine(field('empresa', 120));
$interesKey = field('interes', 20);
$interes = INTERESES[$interesKey] ?? '';
$msg = field('msg', 3000);
$pagina = oneLine(field('pagina', 200));

// El boton flotante de WhatsApp pide solo nombre y celular: ahi el correo no aplica, pero el
// celular y el tema (lista cerrada INTERESES) son obligatorios.
if ($form === 'whatsapp') {
  if ($nombre === '') reply(422, 'nombre');
  $tel = telChile($tel);
  if ($tel === '') reply(422, 'tel');
  if ($interes === '') reply(422, 'interes');
} else {
  if (filter_var($email, FILTER_VALIDATE_EMAIL) === false) reply(422, 'email');
  if ($form === 'contacto' && $nombre === '') reply(422, 'nombre');
}

// Límite por IP: MAX_PER_HOUR envíos por hora (archivo temporal, fuera de public_html).
$ip = $_SERVER['REMOTE_ADDR'] ?? 'desconocida';
$rlFile = sys_get_temp_dir() . '/wf-contacto-' . hash('sha256', $ip);
$now = time();
$hits = array_filter(
  array_map('intval', is_file($rlFile) ? (array) @file($rlFile, FILE_IGNORE_NEW_LINES) : []),
  fn ($t) => $t > $now - 3600,
);
if (count($hits) >= MAX_PER_HOUR) reply(429, 'limit');
$hits[] = $now;
@file_put_contents($rlFile, implode("\n", $hits), LOCK_EX);

// Texto plano para los formularios de Contacto y del pie; HTML solo para el chat de WhatsApp
// (mas abajo). En ambos casos lo escrito por el visitante va solo en el cuerpo, nunca en los
// encabezados: el asunto pasa por oneLine() y se codifica con mb_encode_mimeheader.
$who = $nombre !== '' ? $nombre : $email;
$subject = match ($form) {
  'footer' => 'Asesoría gratuita: ' . $who,
  'whatsapp' => 'Contacto por WhatsApp (' . $interes . '): ' . $who,
  default => 'Nueva solicitud de contacto: ' . $who,
};
$lines = [
  $form === 'footer' ? 'Solicitud de asesoría gratuita (formulario del pie de página).' : 'Nueva solicitud desde el formulario de contacto.',
  '',
  'Nombre: ' . ($nombre !== '' ? $nombre : '—'),
  'Correo: ' . $email,
];
if ($tel !== '') $lines[] = 'Teléfono: ' . $tel;
if ($empresa !== '') $lines[] = 'Empresa: ' . $empresa;
if ($interes !== '') $lines[] = 'Le interesa: ' . $interes;
if ($msg !== '') { $lines[] = ''; $lines[] = 'Mensaje:'; $lines[] = $msg; }
$lines[] = '';
$lines[] = '—';
$lines[] = 'Enviado desde: ' . ($pagina !== '' ? $pagina : 'webfriends.cl');
$lines[] = 'Fecha: ' . (new DateTimeImmutable('now', new DateTimeZone('America/Santiago')))->format('d-m-Y H:i');
$lines[] = 'Responde a este correo para contestarle directamente.';

// El chat de WhatsApp llega como HTML para poder incluir el boton de respuesta. El telefono ya
// viene normalizado (telChile), asi que el wa.me del boton siempre es valido. Todo lo que escribe
// la persona se escapa con htmlspecialchars; el texto de la respuesta va con rawurlencode.
$isHtml = $form === 'whatsapp';
if ($isHtml) {
  $esc = fn (string $v) => htmlspecialchars($v, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
  $respuesta = 'Hola ' . $nombre . ', gracias por escribirnos a Webfriends. Vimos que te interesa '
    . $interes . '. Cuentanos un poco mas y te orientamos.';
  $waReply = 'https://wa.me/' . $tel . '?text=' . rawurlencode($respuesta);
  $row = fn (string $k, string $v) => '<tr>'
    . '<td style="padding:8px 14px 8px 0;color:#6B655C;font-size:14px;white-space:nowrap">' . $esc($k) . '</td>'
    . '<td style="padding:8px 0;color:#171717;font-size:15px;font-weight:600">' . $v . '</td></tr>';
  $fecha = (new DateTimeImmutable('now', new DateTimeZone('America/Santiago')))->format('d-m-Y H:i');
  $body = '<!doctype html><html lang="es"><body style="margin:0;padding:24px;background:#F3F0E9;'
    . 'font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">'
    . '<table role="presentation" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;'
    . 'background:#F8F6F1;border:1px solid rgba(23,20,15,.13);border-radius:18px;padding:26px"><tr><td>'
    . '<p style="margin:0 0 4px;color:#9A5600;font-size:12px;font-weight:700;letter-spacing:.08em;'
    . 'text-transform:uppercase">Boton flotante de WhatsApp</p>'
    . '<h1 style="margin:0 0 18px;color:#171717;font-size:21px">Nuevo contacto</h1>'
    . '<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%">'
    . $row('Nombre', $esc($nombre))
    . $row('Telefono', '<a href="tel:+' . $esc($tel) . '" style="color:#171717">' . $esc(bonitoTel($tel)) . '</a>')
    . $row('Le interesa', $esc($interes))
    . '</table>'
    . '<p style="margin:22px 0 0"><a href="' . $esc($waReply) . '" style="display:inline-block;'
    . 'background:#FFB020;color:#231600;text-decoration:none;font-weight:700;font-size:15px;'
    . 'padding:13px 22px;border-radius:12px">Responder por WhatsApp</a></p>'
    . '<p style="margin:20px 0 0;padding-top:14px;border-top:1px solid rgba(23,20,15,.08);'
    . 'color:#6B655C;font-size:12px;line-height:1.5">Enviado desde: ' . $esc($pagina !== '' ? $pagina : 'webfriends.cl')
    . '<br>Fecha: ' . $fecha . '</p></td></tr></table></body></html>';
} else {
  $body = implode("\r\n", $lines);
}

$encode = fn (string $s) => function_exists('mb_encode_mimeheader') ? mb_encode_mimeheader($s, 'UTF-8', 'B', "\r\n") : '=?UTF-8?B?' . base64_encode($s) . '?=';
$head = ['From: ' . $encode('Sitio web Webfriends') . ' <' . FROM . '>'];
// Sin correo (chat de WhatsApp) no se manda Reply-To: un encabezado vacio invalida el mensaje.
if ($email !== '' && filter_var($email, FILTER_VALIDATE_EMAIL) !== false) {
  $head[] = 'Reply-To: ' . $email;
}
$head[] = 'MIME-Version: 1.0';
$head[] = 'Content-Type: text/' . ($isHtml ? 'html' : 'plain') . '; charset=UTF-8';
$head[] = 'Content-Transfer-Encoding: 8bit';
$headers = implode("\r\n", $head);

$sent = @mail(TO, $encode(oneLine($subject)), $body, $headers, '-f' . FROM);
$sent ? reply(200) : reply(500, 'mail');
