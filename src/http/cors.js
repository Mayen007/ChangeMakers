const allowedOrigins = new Set([
  'http://localhost:5500',
  'http://127.0.0.1:5500'
]);

function applyCors(request, response) {
  const origin = request.headers.origin;
  if (!allowedOrigins.has(origin)) return false;

  response.setHeader('Access-Control-Allow-Origin', origin);
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.setHeader('Vary', 'Origin');
  return true;
}

module.exports = { applyCors };
