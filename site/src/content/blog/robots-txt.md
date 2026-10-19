---
title: "Robots.txt"
metaTitle: "¿Qué es el archivo Robots.txt y para que sirve? - Webfriends"
description: "Qué es el archivo robots.txt, para qué sirve, cómo usar la instrucción Disallow y qué cuidados tener para no bloquear páginas importantes en Google."
excerpt: "Qué es el robots.txt, para qué sirve Disallow y cómo evitar bloquear por error páginas importantes."
category: seo
previousSlugs:
  - /robots-txt/
date: 2023-06-01
dateModified: 2026-10-19
readingTime: "2 min de lectura"
coverIcon: chart-bars
relatedService: page-seo
---

## Qué es robots.txt

Es un archivo de texto público que indica a los rastreadores compatibles qué rutas pueden solicitar. Se publica en la raíz del dominio, como [robots.txt](/robots.txt), y regula el rastreo; no protege información privada.

## Disallow controla el rastreo, no la indexación

Una regla `Disallow` solicita que el rastreador no acceda a una ruta. Una URL bloqueada todavía puede aparecer en los resultados si Google la conoce por enlaces externos.

Para excluir una página de los resultados, usa `noindex` en su HTML o en una cabecera HTTP y permite el rastreo para que Google pueda leer esa instrucción. Para proteger un área privada, exige autenticación.

## Ejemplo básico

```txt
User-agent: *
Disallow: /admin/
Sitemap: https://webfriends.cl/sitemap.xml
```

Este ejemplo restringe el rastreo de `/admin/` e indica el sitemap. No convierte esa carpeta en privada. No copies la regla si esa ruta no corresponde a tu sitio.

## Qué revisar antes de publicarlo

- Comprueba que el archivo esté en la raíz y responda correctamente.
- Evita bloquear hojas de estilo y scripts necesarios para renderizar páginas públicas.
- Verifica que ninguna regla bloquee las páginas que quieres posicionar.
- Indica el sitemap con su URL absoluta y dominio canónico.
- Revisa el efecto de los cambios con las herramientas de inspección de Search Console.

Google detalla estas diferencias en su [introducción a robots.txt](https://developers.google.com/search/docs/crawling-indexing/robots/intro).
