const { readJson, sendJson } = require('./body');

function createApiHandler({ donationService }) {
  return async function handleApi(request, response, url) {
    if (request.method === 'POST' && url.pathname === '/api/mpesa/stkpush') {
      try {
        const data = await readJson(request);
        const result = await donationService.startMpesaDonation(data);
        sendJson(response, 200, {
          message: 'M-Pesa prompt sent. Check your phone and enter your PIN to complete the donation.',
          checkoutRequestId: result.CheckoutRequestID
        });
      } catch (error) {
        sendJson(response, 400, { error: error.message });
      }
      return true;
    }

    if (request.method === 'POST' && url.pathname === '/api/mpesa/callback') {
      try {
        const data = await readJson(request);
        donationService.recordMpesaCallback(data);
        sendJson(response, 200, { ResultCode: 0, ResultDesc: 'Accepted' });
      } catch (error) {
        sendJson(response, 400, { ResultCode: 1, ResultDesc: error.message });
      }
      return true;
    }

    return false;
  };
}

module.exports = { createApiHandler };
