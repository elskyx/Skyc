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

server.listen(4935, async () => {
  try {
    const browser = await pw.chromium.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: true
    });
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

    await page.goto('http://localhost:4935');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1500);

    const stats = await page.evaluate(() => {
      const root = document.getElementById('halftone-footer');
      const rule = document.querySelector('.hwf-rule');
      const canvas = document.getElementById('hwf-canvas');
      const rootRect = root.getBoundingClientRect();
      const ruleRect = rule.getBoundingClientRect();

      // Find highest pixel with dots in canvas
      const ctx = canvas.getContext('2d');
      const w = canvas.width;
      const h = canvas.height;
      const imgData = ctx.getImageData(0, 0, w, h).data;
      let minDotY = h;
      for (let y = 0; y < h; y += 2) {
        for (let x = 0; x < w; x += 2) {
          const idx = (y * w + x) * 4;
          // check if not background (#0c0c0b -> ~12,12,11)
          const r = imgData[idx];
          const g = imgData[idx + 1];
          const b = imgData[idx + 2];
          if (r > 60 || g > 60 || b > 60) {
            minDotY = y;
            break;
          }
        }
        if (minDotY < h) break;
      }

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const highestDotCssY = minDotY / dpr;
      const ruleBottomCssY = ruleRect.bottom - rootRect.top;
      const ruleLineCssY = ruleRect.top - rootRect.top;

      return {
        rootHeight: rootRect.height,
        ruleLineY: ruleLineCssY,
        ruleBottomY: ruleBottomCssY,
        highestDotY: highestDotCssY,
        gapBetweenRuleAndDots: highestDotCssY - ruleLineCssY
      };
    });

    console.log('Halftone footer dot measurements:', stats);

    // Take screenshot of the footer
    const footerEl = await page.$('#halftone-footer');
    if (footerEl) {
      await footerEl.screenshot({ path: path.join(dir, 'test-footer-after.png') });
      console.log('Saved test-footer-after.png');
    }

    await browser.close();
  } catch (err) {
    console.error(err);
  } finally {
    server.close();
  }
});
