---
title: "Guía 01 - Respaldo sitio web"
description: "Paso a paso para respaldar un sitio web dinámico desde cPanel: comprimir los archivos de public_html y exportar la base de datos con phpMyAdmin."
excerpt: "Cómo respaldar los archivos y la base de datos de tu sitio desde cPanel, paso a paso."
category: web
previousSlugs:
  - /guia-01-respaldo-sitio-web/
date: 2023-06-01
readingTime: "2 min de lectura"
coverIcon: monitor
relatedService: page-sitios-web
---

## Estructura de un sitio web dinámico

Un sitio web dinámico tiene dos partes fundamentales:

- **Archivos físicos:** el código fuente, las imágenes cargadas, las plantillas (themes), los plugins instalados y los archivos del sitio.
- **Base de datos SQL:** donde se guardan los textos, contraseñas, configuraciones, artículos publicados y la estructura del contenido.

Para tener un respaldo completo necesitas ambas.

## Respaldo de archivos físicos

1. Ingresa a WHM y selecciona **List accounts**.
2. Entra al cPanel del sitio que quieres respaldar.
3. Ve a **Archivos > Administrador de archivos**.
4. Selecciona la carpeta **public_html** en el panel derecho.
5. En la barra superior, usa **Select all**.
6. Haz clic derecho y elige **Compress**.
7. Selecciona **Zip Archive** como tipo de compresión.
8. Espera a que termine la compresión y cierra la ventana emergente.
9. Haz clic derecho sobre el archivo .zip resultante y descárgalo. Ese es el respaldo de la estructura del sitio.

## Respaldo de la base de datos SQL

10. En cPanel, ve a **Databases > phpMyAdmin**.
11. Identifica la base de datos que quieres respaldar.
12. En el panel superior, selecciona **Exportar**.
13. Como método de exportación, elige **Personalizado**.
14. En **Salida**, selecciona compresión **Comprimido con zip**.
15. Baja hasta el final y haz clic en **Exportar**.
16. Revisa tu carpeta de descargas: ahí estará tu archivo SQL.zip.

## Conclusión

Con el .zip de archivos y el SQL.zip de la base de datos ya tienes todo lo necesario para respaldar o migrar tu sitio web.
