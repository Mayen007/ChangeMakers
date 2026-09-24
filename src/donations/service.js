const { missingMpesaSettings } = require('../config');
const { normalizePhoneNumber } = require('../mpesa/client');

class DonationService {
  constructor({ mpesaClient, transactionRepository }) {
    this.mpesaClient = mpesaClient;
    this.transactionRepository = transactionRepository;
  }

  async startMpesaDonation(data) {
    const amount = Number(data.amount);
    const phoneNumber = normalizePhoneNumber(data.phoneNumber);

    if (!Number.isInteger(amount) || amount < 1 || amount > 10000) {
      throw new Error('Donation amount must be a whole number between 1 and 10,000.');
    }
    if (!/^254[17]\d{8}$/.test(phoneNumber)) {
      throw new Error('Enter a valid Safaricom phone number.');
    }
    if (missingMpesaSettings().length) {
      throw new Error('M-Pesa is not configured on the server.');
    }

    const result = await this.mpesaClient.startStkPush({
      amount,
      phoneNumber,
      frequency: data.frequency
    });

    this.transactionRepository.add(result.CheckoutRequestID, {
      amount,
      phoneNumber,
      createdAt: new Date().toISOString(),
      status: 'pending'
    });

    return result;
  }

  recordMpesaCallback(data) {
    return this.transactionRepository.updateFromCallback(data?.Body?.stkCallback);
  }
}

module.exports = { DonationService };
