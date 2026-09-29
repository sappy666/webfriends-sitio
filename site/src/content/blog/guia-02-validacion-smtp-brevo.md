---
title: "Guía 02 - Validación SMTP Brevo"
metaTitle: "Guía 02 - Validación SMTP Brevo - Webfriends"
description: "Cómo conectar tu sitio WordPress con Brevo usando WP Mail SMTP y autenticar tu dominio (DKIM/DMARC) para que tus correos no caigan en spam."
excerpt: "Brevo, WP Mail SMTP y autenticación DNS: cómo lograr que los correos de tu sitio lleguen a la bandeja de entrada."
category: web
previousSlugs:
  - /guia-02-validacion-smtp-brevo/
date: 2023-06-01
readingTime: "2 min de lectura"
coverIcon: monitor
relatedService: page-sitios-web
---

Un sistema de correos profesional y seguro para tu sitio web se apoya en tres pilares:

- **Pasarela Brevo:** el servicio externo que procesa, distribuye y envía tus correos con alta velocidad.
- **Plugin WP Mail SMTP:** el puente dentro de tu sitio que intercepta los correos nativos de WordPress y los redirige de forma segura hacia Brevo.
- **Autenticación DNS:** las firmas digitales (DKIM y DMARC) configuradas en tu dominio para validar tu identidad y evitar la carpeta de spam.

En esta guía verás cómo vincular y autorizar estas partes para que los correos de tu sitio lleguen siempre a la bandeja de entrada.

## Paso a paso

1. Crea tu cuenta en Brevo con los datos reales del dominio: el correo del dominio y la URL del sitio.
2. Completa el formulario de registro y valida tu correo electrónico.
3. En el panel izquierdo de Brevo, entra a **SMTP y API**.
4. En **Claves API y MCP**, activa y genera una clave API.
5. En WordPress, ve a **WP Mail SMTP > Ajustes** y conecta Brevo con la clave API que generaste.
