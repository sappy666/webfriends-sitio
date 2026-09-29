import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const prerender = true;

export const GET: APIRoute = async ({ site }) => {
  const [entry] = await getCollection('robotsTxt');
  const sitemapUrl = new URL('sitemap-index.xml', site).toString();
  const body = `${entry.data.rules.trim()}\n\nSitemap: ${sitemapUrl}\n`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
