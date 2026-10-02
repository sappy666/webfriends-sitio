import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';


export const GET: APIRoute = async () => {
  const [entry] = await getCollection('llmsTxt');

  return new Response(entry.data.content.trim() + '\n', {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
