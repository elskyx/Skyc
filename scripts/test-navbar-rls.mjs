import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pw from 'playwright-core';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.resolve(__dirname, '../../About-Skyc');

const server = http.createServer((req, res) => {
  let filePath = path.join(dir, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
  if (!fs.existsSync(filePath)) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }
  const ext = path.extname(filePath);
  const types = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.svg': 'image/svg+xml',
    '.png': 'image/png'
  };
  res.writeHead(200, { 'Content-Type': types[ext] || 'text/plain' });
  res.end(fs.readFileSync(filePath));
});

server.listen(4912, async () => {
  try {
    const browser = await pw.chromium.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: true
    });
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('http://localhost:4912');
    await page.waitForTimeout(1000);

    const rlsWords = await page.evaluate(() => document.querySelectorAll('.rls-word').length);
    const rlsChars = await page.evaluate(() => document.querySelectorAll('.rls-char').length);

    console.log('RLS Words count:', rlsWords);
    console.log('RLS Chars count:', rlsChars);
    console.log('Console errors:', errors);

    const trigger = await page.$('.nav-menu-item.has-dropdown .nav-menu-trigger');
    if (trigger) {
      await trigger.hover();
      await page.waitForTimeout(400);
      console.log('Hover on trigger succeeded!');
    }

    await browser.close();
  } catch (err) {
    console.error(err);
  } finally {
    server.close();
  }
});
