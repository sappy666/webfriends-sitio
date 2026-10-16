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

$form = field('form', 20) === 'footer' ? 'footer' : 'contacto';
$email = oneLine(field('email', 254));
$nombre = oneLine(field('nombre', 100));
$tel = oneLine(field('tel', 40));
$empresa = oneLine(field('empresa', 120));
$interesKey = field('interes', 20);
$interes = INTERESES[$interesKey] ?? '';
$msg = field('msg', 3000);
$pagina = oneLine(field('pagina', 200));

if (filter_var($email, FILTER_VALIDATE_EMAIL) === false) reply(422, 'email');
if ($form === 'contacto' && $nombre === '') reply(422, 'nombre');

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

// Correo en texto plano: lo escrito por el visitante va solo en el cuerpo.
$who = $nombre !== '' ? $nombre : $email;
$subject = $form === 'footer'
  ? 'Asesoría gratuita: ' . $who
  : 'Nueva solicitud de contacto: ' . $who;
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

$encode = fn (string $s) => function_exists('mb_encode_mimeheader') ? mb_encode_mimeheader($s, 'UTF-8', 'B', "\r\n") : '=?UTF-8?B?' . base64_encode($s) . '?=';
$headers = implode("\r\n", [
  'From: ' . $encode('Sitio web Webfriends') . ' <' . FROM . '>',
  'Reply-To: ' . $email,
  'MIME-Version: 1.0',
  'Content-Type: text/plain; charset=UTF-8',
  'Content-Transfer-Encoding: 8bit',
]);

$sent = @mail(TO, $encode(oneLine($subject)), implode("\r\n", $lines), $headers, '-f' . FROM);
$sent ? reply(200) : reply(500, 'mail');
