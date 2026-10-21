import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pw from 'playwright-core';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.resolve(__dirname, '../public');

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

server.listen(4891, async () => {
  try {
    const browser = await pw.chromium.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: true
    });

    for (const width of [1280, 768, 375]) {
      const page = await browser.newPage({ viewport: { width, height: 800 } });
      const consoleErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('http://localhost:4891');
      await page.waitForTimeout(800);

      const audit = await page.evaluate((w) => {
        const issues = [];
        const docW = document.documentElement.scrollWidth;
        const winW = window.innerWidth;
        if (docW > winW + 1) {
          issues.push({ type: 'OVERFLOW', detail: `Horizontal overflow: scrollWidth ${docW} > innerWidth ${winW}` });
        }

        // Check icon buttons without aria-label or text
        const buttons = document.querySelectorAll('button, a[role="button"]');
        buttons.forEach((btn, i) => {
          const text = btn.innerText ? btn.innerText.trim() : '';
          const aria = btn.getAttribute('aria-label') || btn.getAttribute('title');
          if (!text && !aria) {
            issues.push({ type: 'A11Y_EMPTY_BUTTON', id: btn.id || 'none', className: btn.className, html: btn.outerHTML.slice(0, 100) });
          }
        });

        // Check touch target sizes on interactive elements (at 375px)
        if (w <= 480) {
          buttons.forEach(btn => {
            const rect = btn.getBoundingClientRect();
            // Visible elements only
            if (rect.width > 0 && rect.height > 0 && rect.top < 800) {
              if (rect.height < 32 || rect.width < 32) {
                issues.push({ type: 'TOUCH_TARGET_SMALL', id: btn.id || 'none', className: btn.className, size: `${Math.round(rect.width)}x${Math.round(rect.height)}` });
              }
            }
          });
        }

        // Check contrast / colors on common text
        const sampleTexts = [];
        document.querySelectorAll('h1, h2, h3, p, span.platform-card-name, .nav-item').forEach(el => {
          const style = window.getComputedStyle(el);
          sampleTexts.push({
            tag: el.tagName,
            class: el.className,
            color: style.color,
            fontFamily: style.fontFamily,
            fontSize: style.fontSize
          });
        });

        return { issues, docW, winW, sampleCount: sampleTexts.length };
      }, width);

      console.log(`\n=== Viewport ${width}px Audit ===`);
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
