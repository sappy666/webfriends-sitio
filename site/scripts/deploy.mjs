// Sube dist/ al hosting cPanel por FTPS (puerto 21, TLS explícito).
// Uso: npm run deploy  (compila y sube). Requiere curl y la variable de entorno FTP_PASS.
// Opcionales: FTP_USER (por defecto mramdohr@webfriends.cl) y FTP_HOST (ftp.webfriends.cl).
// No sube .htaccess: el del servidor incluye la configuración de PHP que agrega cPanel.
import { readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { spawnSync } from 'node:child_process';

const user = process.env.FTP_USER || 'mramdohr@webfriends.cl';
const host = process.env.FTP_HOST || 'ftp.webfriends.cl';
const pass = process.env.FTP_PASS;
if (!pass) {
  console.error('Falta FTP_PASS. Defínela como variable de entorno antes de subir.');
  process.exit(1);
}

const root = 'dist';
const skip = new Set(['.htaccess']);
const files = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (!skip.has(name)) files.push(p);
  }
};
walk(root);

let fail = 0;
for (const [i, file] of files.entries()) {
  const rel = relative(root, file).split(sep).join('/');
  // --tls-max 1.2: el servidor corta las transferencias de datos con TLS 1.3.
  const r = spawnSync('curl', ['-s', '-S', '--ssl-reqd', '-k', '--tls-max', '1.2', '--ftp-create-dirs',
    '--user', `${user}:${pass}`, '-T', file, `ftp://${host}:21/${encodeURI(rel)}`], { stdio: ['ignore', 'ignore', 'pipe'] });
  // 67 = login rechazado: se corta de inmediato para no acumular intentos (el servidor bloquea la IP).
  if (r.status === 67) { console.error(`\n✗ El servidor rechazó el usuario o la contraseña (FTP_PASS). No se subió nada más.`); process.exit(1); }
  if (r.status !== 0) { fail++; console.error(`✗ ${rel}: ${String(r.stderr).trim()}`); }
  process.stdout.write(`\r${i + 1}/${files.length}`);
}
console.log(`\n${files.length - fail} archivos subidos${fail ? `, ${fail} con error` : ''}.`);
process.exit(fail ? 1 : 0);
