import type { APIRoute } from 'astro';

const getRobotsTxt = (sitemapURL: URL) =>
  `
User-agent: *
Allow: /

# Main sitemap
Sitemap: ${sitemapURL.href}

# Crawl-delay for respectful crawling
Crawl-delay: 1

# Allow search bots to access important resources
Allow: /favicon.svg
Allow: /manifest.json

# Block crawling of admin/private areas if they exist
Disallow: /admin/
Disallow: /private/
Disallow: /.env
`.trim();

export const GET: APIRoute = ({ site }) => {
  if (!site) {
    return new Response('Site configuration is required for robots.txt', { status: 500 });
  }
  
  const sitemapURL = new URL('sitemap-index.xml', site);
  
  return new Response(getRobotsTxt(sitemapURL), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
