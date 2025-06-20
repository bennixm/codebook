import { config } from 'dotenv';
import { SitemapStream, streamToPromise } from 'sitemap';
import { createWriteStream } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { routes } from './src/router/routes-only.js';

config({ path: '.env.local' });


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const BASE_URL = process.env.VITE_SITE_URL;

if (!BASE_URL) {
  console.error('❌ VITE_SITE_URL is not defined in .env.local');
  process.exit(1);
}

const flattenRoutes = (routes, basePath = '') => {
  let result = [];

  routes.forEach(route => {
    const fullPath = basePath + route.path.replace(/\/$/, '');

    if (route.meta?.public) {
      result.push(fullPath || '/');
    }

    if (route.children) {
      const childBase = fullPath.endsWith('/') ? fullPath : fullPath + '/';
      result = result.concat(flattenRoutes(route.children, childBase));
    }
  });

  return result;
};

const publicRoutes = flattenRoutes(routes).filter(path => !path.includes(':'));

const sitemapStream = new SitemapStream({ hostname: BASE_URL });

streamToPromise(sitemapStream)
  .then(data => {
    const filePath = resolve(__dirname, 'public', 'sitemap.xml');
    const writeStream = createWriteStream(filePath);
    writeStream.write(data.toString());
    writeStream.end();
    console.log(`✅ Sitemap successfully written to ${filePath}`);
  })
  .catch(console.error);

publicRoutes.forEach(url =>
  sitemapStream.write({ url, changefreq: 'weekly', priority: 0.8 })
);

sitemapStream.end();
