import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let val = match[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  });
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8',
};

const PORT = process.env.PORT || 3005;

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = parsedUrl.pathname;

  // Polyfill Vercel-like res helpers
  res.status = function(code) {
    this.statusCode = code;
    return this;
  };
  res.json = function(data) {
    this.setHeader('Content-Type', 'application/json');
    this.end(JSON.stringify(data));
    return this;
  };

  // API Route Handling
  if (pathname.startsWith('/api/')) {
    const routeName = pathname.replace('/api/', '').split('?')[0];
    const apiFile = path.join(__dirname, 'api', `${routeName}.js`);

    if (fs.existsSync(apiFile)) {
      try {
        let bodyStr = '';
        for await (const chunk of req) {
          bodyStr += chunk;
        }
        if (bodyStr) {
          try {
            req.body = JSON.parse(bodyStr);
          } catch {
            req.body = bodyStr;
          }
        }
        const handlerModule = await import(`file://${apiFile}?t=${Date.now()}`);
        const handler = handlerModule.default;
        await handler(req, res);
        return;
      } catch (err) {
        console.error('API Error:', err);
        return res.status(500).json({ error: 'Server error: ' + err.message });
      }
    } else {
      return res.status(404).json({ error: 'API route not found' });
    }
  }

  // Static File Handling
  if (pathname === '/') pathname = '/index.html';
  const filePath = path.join(__dirname, pathname);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const mime = MIME_TYPES[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', mime);
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain');
    res.end('404 Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`ApplyReady dev server running at: http://localhost:${PORT}`);
});
