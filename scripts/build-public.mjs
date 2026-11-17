// Publish only website pages and assets; repository notes are not web content.
import { readdir, copyFile, mkdir, rm, lstat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'public-site');
const types = {
  css: ['.css'], js: ['.js'], fonts: ['.woff2', '.woff', '.ttf', '.otf'],
  images: ['.jpg', '.jpeg', '.png', '.svg', '.webp', '.avif', '.gif', '.ico'],
  vendor: ['.css', '.js', '.jpg', '.jpeg', '.png', '.svg', '.gif', '.woff2', '.woff'],
};
const files = [];
for (const item of await readdir(root, { withFileTypes: true })) {
  if (item.isFile() && (item.name.endsWith('.html') || ['robots.txt', 'sitemap.xml', 'site.webmanifest', 'favicon.ico'].includes(item.name))) files.push(item.name);
}
async function collect(directory, extensions) {
  for (const item of await readdir(path.join(root, directory), { withFileTypes: true })) {
    const relative = path.join(directory, item.name);
    if (item.isSymbolicLink()) throw new Error(`Symbolic links cannot be published: ${relative}`);
    if (item.name.startsWith('.')) continue;
    if (item.isDirectory()) await collect(relative, extensions);
    else if (item.isFile() && extensions.includes(path.extname(item.name).toLowerCase())) files.push(relative);
  }
}
for (const [directory, extensions] of Object.entries(types)) await collect(directory, extensions);
// This generated directory is fixed under the checkout and never contains source.
await rm(output, { recursive: true, force: true });
for (const relative of files) {
  if ((await lstat(path.join(root, relative))).isSymbolicLink()) throw new Error(`Invalid asset: ${relative}`);
  await mkdir(path.dirname(path.join(output, relative)), { recursive: true });
  await copyFile(path.join(root, relative), path.join(output, relative));
}
console.log(`Prepared ${files.length} public website files`);
