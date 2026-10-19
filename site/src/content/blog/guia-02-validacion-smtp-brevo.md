---
title: "Guía 02 - Validación SMTP Brevo"
metaTitle: "Guía 02 - Validación SMTP Brevo - Webfriends"
description: "Cómo conectar tu sitio WordPress con Brevo usando WP Mail SMTP y autenticar tu dominio (DKIM/DMARC) para que tus correos no caigan en spam."
excerpt: "Brevo, WP Mail SMTP y autenticación DNS: cómo lograr que los correos de tu sitio lleguen a la bandeja de entrada."
category: web
previousSlugs:
  - /guia-02-validacion-smtp-brevo/
date: 2023-06-01
dateModified: 2026-10-19
readingTime: "2 min de lectura"
coverIcon: monitor
relatedService: page-sitios-web
---

Un sistema de correos profesional y seguro para tu sitio web se apoya en tres pilares:

- **Pasarela Brevo:** el servicio externo que procesa, distribuye y envía tus correos con alta velocidad.
- **Plugin WP Mail SMTP:** el puente dentro de tu sitio que intercepta los correos nativos de WordPress y los redirige de forma segura hacia Brevo.
- **Autenticación DNS:** las firmas digitales (DKIM y DMARC) configuradas en tu dominio para validar tu identidad y evitar la carpeta de spam.

En esta guía verás cómo vincular y autorizar estas partes para mejorar la autenticación y comprobar el envío de los correos de tu sitio. La configuración no garantiza que todos los mensajes lleguen a la bandeja de entrada.

## Paso a paso

1. Crea tu cuenta en Brevo con los datos reales del dominio: el correo del dominio y la URL del sitio.
2. Completa el formulario de registro y valida tu correo electrónico.
3. En la configuración de Brevo, busca **SMTP y API**; la ubicación puede variar según la interfaz.
4. Abre la sección de claves API y genera una para la integración; no la confundas con una clave SMTP.
5. En WordPress, ve a **WP Mail SMTP > Ajustes** y conecta Brevo con la clave API que generaste.

## Autentica el dominio y comprueba el envío

Verifica el remitente y configura en tu proveedor DNS los registros que muestra tu cuenta de Brevo. Copia sus valores exactos, espera su validación y envía un correo de prueba desde WP Mail SMTP. Después prueba el formulario real y comprueba tanto la recepción como la dirección de respuesta.

Si un mensaje falla, revisa el error del plugin y el registro de envío de Brevo antes de cambiar credenciales. No publiques claves API en capturas ni las incluyas en el código del sitio. La [guía oficial del conector Brevo en WP Mail SMTP](https://wpmailsmtp.com/docs/how-to-set-up-the-sendinblue-mailer-in-wp-mail-smtp/) detalla la configuración.
