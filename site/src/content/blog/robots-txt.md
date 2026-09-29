---
title: "Robots.txt"
metaTitle: "¿Qué es el archivo Robots.txt y para que sirve? - Webfriends"
description: "Qué es el archivo robots.txt, para qué sirve, cómo usar la instrucción Disallow y qué cuidados tener para no bloquear páginas importantes en Google."
excerpt: "Qué es el robots.txt, para qué sirve Disallow y cómo evitar bloquear por error páginas importantes."
category: seo
previousSlugs:
  - /robots-txt/
date: 2023-06-01
readingTime: "2 min de lectura"
coverIcon: chart-bars
relatedService: page-seo
---

## ¿Qué es el robots.txt?

El robots.txt es un archivo de texto que todo webmaster debe crear y subir a su servidor para indicarles a los motores de búsqueda qué contenido quiere que rastreen. Es un archivo público que entrega instrucciones de rastreo.

## ¿Para qué sirve?

Gestiona el tráfico de los rastreadores y evita que Google rastree determinadas páginas o directorios del sitio, lo que además ahorra tiempo a los crawlers.

Con el robots.txt puedes:

- Controlar el acceso a imágenes.
- Controlar el acceso a páginas o directorios.
- Controlar el acceso a archivos de recursos.
- Indicar la URL de tu sitemap.xml.

## ¿Qué es Disallow?

La instrucción **Disallow** sirve para denegar el acceso a una página o directorio del sitio. Impide que los rastreadores de los buscadores recorran contenidos que no quieres que indexen. Por ejemplo:

```txt
User-agent: *
Disallow: /admin/
Sitemap: https://www.webfriends.cl/sitemap.xml
```

## Ojo al configurarlo

Es clave configurarlo bien: un error puede excluir sin querer secciones importantes del sitio que sí deberían rastrearse y aparecer en Google.
