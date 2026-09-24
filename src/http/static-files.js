const fs = require('node:fs');
const path = require('node:path');

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

function serveStatic(response, url, staticRoot) {
  const requestedPath = url.pathname === '/' ? '/index.html' : url.pathname;
  if (requestedPath.split('/').some(part => part.startsWith('.'))) {
    response.writeHead(404);
    response.end('Not found');
    return;
  }

  const filePath = path.resolve(staticRoot, `.${requestedPath}`);
  if (!filePath.startsWith(staticRoot) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    response.writeHead(404);
    response.end('Not found');
    return;
  }

  response.writeHead(200, { 'Content-Type': contentTypes[path.extname(filePath)] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(response);
}

module.exports = { serveStatic };
