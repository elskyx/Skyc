import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pw from 'playwright-core';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = fs.existsSync(path.resolve(__dirname, '../../About-Skyc-Downloader'))
  ? path.resolve(__dirname, '../../About-Skyc-Downloader')
  : path.resolve(__dirname, '../../About-Skyc');

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
    '.png': 'image/png',
    '.json': 'application/json'
  };
  res.writeHead(200, { 'Content-Type': types[ext] || 'text/plain' });
  res.end(fs.readFileSync(filePath));
});

server.listen(4893, async () => {
  try {
    const browser = await pw.chromium.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: true
    });

    for (const width of [1280, 768, 375]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const consoleErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('http://localhost:4893');
      await page.waitForTimeout(800);

      const audit = await page.evaluate((w) => {
        const issues = [];
        const docW = document.documentElement.scrollWidth;
        const winW = window.innerWidth;
        if (docW > winW + 1) {
          issues.push({ type: 'OVERFLOW', detail: `Horizontal overflow: scrollWidth ${docW} > innerWidth ${winW}` });
        }

        const buttons = document.querySelectorAll('button, a[role="button"]');
        buttons.forEach((btn, i) => {
          const text = btn.innerText ? btn.innerText.trim() : '';
          const aria = btn.getAttribute('aria-label') || btn.getAttribute('title');
          if (!text && !aria) {
            issues.push({ type: 'A11Y_EMPTY_BUTTON', id: btn.id || 'none', className: btn.className });
          }
        });

        return { issues, docW, winW };
      }, width);

      console.log(`\n=== About-Skyc Viewport ${width}px Audit ===`);
      console.log('Console Errors:', consoleErrors);
      console.log('Audit issues count:', audit.issues.length);
      if (audit.issues.length > 0) {
        console.log('Audit issues details:', audit.issues);
      }
      await page.close();
    }

    await browser.close();
  } catch (err) {
    console.error(err);
  } finally {
    server.close();
  }
});
