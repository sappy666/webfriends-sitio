---
title: "¿Qué es un sitemap?"
metaTitle: "¿Qué es un sitemap? - Webfriends"
description: "Qué es un sitemap o mapa del sitio, por qué es importante para usuarios, buscadores y desarrolladores, y cómo ayuda al SEO."
excerpt: "Qué es el mapa del sitio y por qué ayuda a Google a rastrear e indexar tus páginas."
category: seo
previousSlugs:
  - /que-es-un-sitemap/
date: 2023-06-01
dateModified: 2026-10-19
readingTime: "2 min de lectura"
coverIcon: chart-bars
relatedService: page-seo
---

Un **sitemap XML** es un archivo que informa a los buscadores de las URLs importantes de un sitio y puede indicar cuándo cambió su contenido. Es distinto de un mapa HTML, que ofrece enlaces para que las personas naveguen.

## Qué aporta y qué no garantiza

El sitemap ayuda a descubrir páginas, especialmente si el sitio es grande o tiene poco enlazado. No sustituye los enlaces internos ni garantiza rastreo, indexación o posiciones. En un sitio pequeño y bien enlazado, los buscadores pueden encontrar las páginas sin depender de él.

## Qué URLs incluir

Incluye las URLs canónicas de las páginas que quieres indexar, con su protocolo, dominio y barra final definitivos. Cada destino debe responder 200. Excluye redirecciones, errores 404 y páginas con `noindex`.

En Webfriends el archivo está en [sitemap.xml](/sitemap.xml). La referencia a ese archivo también puede publicarse en [robots.txt](/robots.txt).

## Cómo mantenerlo

Actualiza `lastmod` cuando el contenido de una página cambie de forma significativa; no uses la fecha de cada compilación para aparentar que todos los artículos son nuevos. Comprueba que las URLs del sitemap coincidan con las etiquetas canonical.

Puedes enviar el sitemap en Search Console y revisar los problemas detectados. Para entender sus límites, consulta la [documentación de Google sobre sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview).
