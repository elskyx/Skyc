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

server.listen(4899, async () => {
  try {
    const browser = await pw.chromium.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: true
    });
    const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });

    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('http://localhost:4899');
    await page.waitForTimeout(1500);

    const hasWrapper = await page.evaluate(() => !!document.querySelector('.hero-tilted-stage-wrapper'));
    const tileCount = await page.evaluate(() => document.querySelectorAll('.tgh-tile-hero').length);
    const sliceCount = await page.evaluate(() => document.querySelectorAll('.tgh-slice').length);

    console.log('Hero wrapper exists:', hasWrapper);
    console.log('Tile count rendered:', tileCount);
    console.log('Total slices rendered:', sliceCount);
    console.log('Console errors:', errors);

    const screenshotPath = path.join(dir, 'test-hero-render.png');
    await page.screenshot({ path: screenshotPath });
    console.log('Saved screenshot to:', screenshotPath);

    await browser.close();
  } catch (err) {
    console.error(err);
  } finally {
    server.close();
  }
});
