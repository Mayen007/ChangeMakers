const http = require('node:http');
const { config } = require('./src/config');
const { MpesaClient } = require('./src/mpesa/client');
const { DonationService } = require('./src/donations/service');
const { InMemoryTransactionRepository } = require('./src/donations/repository');
const { createApiHandler } = require('./src/http/routes');
const { serveStatic } = require('./src/http/static-files');

const donationService = new DonationService({
  mpesaClient: new MpesaClient(config.mpesa),
  transactionRepository: new InMemoryTransactionRepository()
});
const handleApi = createApiHandler({ donationService });

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
  if (await handleApi(request, response, url)) return;
  if (request.method === 'GET') return serveStatic(response, url, config.staticRoot);
  response.writeHead(405);
  response.end('Method not allowed');
});

server.listen(config.port, () => {
  console.log(`ChangeMakers server listening on http://localhost:${config.port}`);
});

module.exports = { server };