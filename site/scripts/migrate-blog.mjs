// One-off migration: converts the legacy blog-*.html articles into
// Markdown files for the Astro content collection / Keystatic.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../..'); // webfriends/
const outDir = path.resolve(__dirname, '../src/content/blog');
fs.mkdirSync(outDir, { recursive: true });

const CATEGORY_MAP = {
  'SEO': 'seo',
  'Google Ads': 'ads',
  'Desarrollo web': 'web',
  'UX/UI': 'uxui',
  'Salud': 'salud',
};

const SERVICE_MAP = {
  seo: '/seo',
  ads: '/google-ads',
  web: '/sitios-web',
  uxui: '/ux-ui',
  salud: '/salud',
};

function decode(s) {
  return s
    .replace(/&aacute;/g, 'á').replace(/&eacute;/g, 'é').replace(/&iacute;/g, 'í')
    .replace(/&oacute;/g, 'ó').replace(/&uacute;/g, 'ú').replace(/&ntilde;/g, 'ñ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

function stripTags(s) {
  return decode(s.replace(/<svg[\s\S]*?<\/svg>/g, '').replace(/<[^>]+>/g, '')).trim();
}

function htmlToMarkdown(html) {
  const lines = [];
  // Split into top-level block elements in document order.
  const blockRe = /<(h2|p|ul|blockquote)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/g;
  let m;
  while ((m = blockRe.exec(html))) {
    const [, tag, inner] = m;
    if (tag === 'h2') {
      lines.push(`## ${stripTags(inner)}`);
    } else if (tag === 'p') {
      lines.push(stripTags(inner));
    } else if (tag === 'blockquote') {
      lines.push(`> ${stripTags(inner)}`);
    } else if (tag === 'ul') {
      const items = [...inner.matchAll(/<li(?:\s[^>]*)?>([\s\S]*?)<\/li>/g)].map(
        (li) => `- ${stripTags(li[1])}`
      );
      lines.push(items.join('\n'));
    }
    lines.push('');
  }
  return lines.join('\n').trim() + '\n';
}

const files = fs.readdirSync(rootDir).filter((f) => /^blog-.*\.html$/.test(f) || f === 'blog-post.html');

for (const file of files) {
  const html = fs.readFileSync(path.join(rootDir, file), 'utf8');

  const title = decode((html.match(/<h1>([\s\S]*?)<\/h1>/) || [, ''])[1]).trim();
  const description = decode(
    (html.match(/<meta name="description" content="([\s\S]*?)">/) || [, ''])[1]
  ).trim();
  const excerpt = decode(
    stripTags((html.match(/<p class="lede">([\s\S]*?)<\/p>/) || [, ''])[1])
  ).trim();
  const catLabel = stripTags((html.match(/<span class="post-tag">([\s\S]*?)<\/span>/) || [, ''])[1]);
  const category = CATEGORY_MAP[catLabel] || 'seo';
  const dateText = (html.match(/<span class="post-date"[^>]*>([\s\S]*?)<\/span>/) || [, ''])[1];
  const [dateRaw, readingRaw] = stripTags(dateText).split('·').map((s) => s.trim());
  const monthMap = { ene: '01', feb: '02', mar: '03', abr: '04', may: '05', jun: '06', jul: '07', ago: '08', sep: '09', oct: '10', nov: '11', dic: '12' };
  const dm = dateRaw && dateRaw.match(/(\d{1,2})\s+(\w{3})\w*\s+(\d{4})/);
  const isoDate = dm ? `${dm[3]}-${monthMap[dm[2].toLowerCase().slice(0, 3)] || '01'}-${dm[1].padStart(2, '0')}` : '2026-01-01';
  const coverIcon = (html.match(/<div class="post-cover"[\s\S]*?href="#i-([a-z-]+)"/) || [, 'search'])[1];
  const relatedService = SERVICE_MAP[category];

  const bodyHtml = (html.match(/<div class="post-body" data-reveal>([\s\S]*?)<div class="post-foot">/) || [, ''])[1];
  const body = htmlToMarkdown(bodyHtml);

  const slug = file.replace(/^blog-/, '').replace(/\.html$/, '').replace(/^post$/, 'guia-seo-local');

  const frontmatter = `---
title: ${JSON.stringify(title)}
description: ${JSON.stringify(description)}
excerpt: ${JSON.stringify(excerpt)}
category: ${category}
date: ${isoDate}
readingTime: ${JSON.stringify(readingRaw || '5 min')}
coverIcon: ${coverIcon}
relatedService: ${relatedService}
---

`;

  fs.writeFileSync(path.join(outDir, `${slug}.md`), frontmatter + body);
  console.log('wrote', slug, '←', file);
}
