//
// Copyright 2026 unjal <unjal29@outlook.com>
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// MDC-Web Live Dev Server on 127.0.0.1:2929
// Crafted by unjal <unjal29@outlook.com>
//

import http from 'http';
import fs from 'fs';
import path from 'path';

const PORT = process.env.PORT || 2929;
const HOST = '0.0.0.0';
const ROOT_DIR = path.resolve();

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf'
};

const server = http.createServer((req, res) => {
  let reqUrl = req.url.split('?')[0];
  if (reqUrl === '/' || reqUrl === '/demo' || reqUrl === '/demo.html') {
    reqUrl = '/demos/index.html';
  }

  let filePath = path.join(ROOT_DIR, reqUrl);

  // Fallback aliases for assets and bundles
  if (!fs.existsSync(filePath)) {
    if (reqUrl.startsWith('/assets/')) {
      const assetRel = reqUrl.replace('/assets/', '');
      const tryPaths = [
        path.join(ROOT_DIR, 'demos', assetRel),
        path.join(ROOT_DIR, 'dist', assetRel),
        path.join(ROOT_DIR, 'build', assetRel)
      ];
      for (const tp of tryPaths) {
        if (fs.existsSync(tp)) {
          filePath = tp;
          break;
        }
      }
    } else if (reqUrl.startsWith('/build/')) {
      const buildRel = reqUrl.replace('/build/', '');
      const tryPaths = [
        path.join(ROOT_DIR, 'dist', buildRel),
        path.join(ROOT_DIR, 'demos', buildRel)
      ];
      for (const tp of tryPaths) {
        if (fs.existsSync(tp)) {
          filePath = tp;
          break;
        }
      }
    }
  }

  if (!fs.existsSync(filePath) || (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory())) {
    const indexPath = path.join(filePath, 'index.html');
    if (fs.existsSync(indexPath)) {
      filePath = indexPath;
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`404 Not Found: ${reqUrl}`);
      return;
    }
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', contentType);

  const stream = fs.createReadStream(filePath);
  stream.on('error', (err) => {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`500 Internal Server Error: ${err.message}`);
  });
  stream.pipe(res);
});

server.listen(PORT, HOST, () => {
  console.log(`=======================================================`);
  console.log(`MDC-Web Live Server is running at:`);
  console.log(`  > http://127.0.0.1:${PORT}`);
  console.log(`  > http://localhost:${PORT}`);
  console.log(`  > http://${HOST}:${PORT}`);
  console.log(`Deployed & Crafted by unjal <unjal29@outlook.com>`);
  console.log(`=======================================================`);
});
