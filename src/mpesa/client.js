const baseUrls = {
  sandbox: 'https://sandbox.safaricom.co.ke',
  production: 'https://api.safaricom.co.ke'
};

function createTimestamp(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Nairobi',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(date).reduce((result, part) => {
    result[part.type] = part.value;
    return result;
  }, {});

  return `${parts.year}${parts.month}${parts.day}${parts.hour}${parts.minute}${parts.second}`;
}

function normalizePhoneNumber(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (digits.startsWith('0')) return `254${digits.slice(1)}`;
  if (digits.startsWith('7') || digits.startsWith('1')) return `254${digits}`;
  return digits;
}

class MpesaClient {
  constructor(settings, fetchImpl = fetch) {
    this.settings = settings;
    this.fetch = fetchImpl;
    this.baseUrl = baseUrls[settings.environment] || baseUrls.sandbox;
  }

  async getAccessToken() {
    const credentials = Buffer.from(
      `${this.settings.consumerKey}:${this.settings.consumerSecret}`
    ).toString('base64');
    const response = await this.fetch(
      `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
      { headers: { Authorization: `Basic ${credentials}` } }
    );

    if (!response.ok) throw new Error('M-Pesa authentication failed.');
    const body = await response.json();
    if (!body.access_token) throw new Error('M-Pesa did not return an access token.');
    return body.access_token;
  }

  async startStkPush({ amount, phoneNumber, frequency }) {
    const requestTimestamp = createTimestamp();
    const password = Buffer.from(
      `${this.settings.shortcode}${this.settings.passkey}${requestTimestamp}`
    ).toString('base64');
    const token = await this.getAccessToken();
    const response = await this.fetch(`${this.baseUrl}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        BusinessShortCode: this.settings.shortcode,
        Password: password,
        Timestamp: requestTimestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: phoneNumber,
        PartyB: this.settings.shortcode,
        PhoneNumber: phoneNumber,
        CallBackURL: this.settings.callbackUrl,
        AccountReference: 'ChangeMakers',
        TransactionDesc: `Donation ${frequency || 'one-time'}`
      })
    });

    const body = await response.json();
    if (!response.ok || body.ResponseCode !== '0') {
      throw new Error(body.errorMessage || body.ResponseDescription || 'M-Pesa rejected the payment request.');
    }
    return body;
  }
}

module.exports = { MpesaClient, createTimestamp, normalizePhoneNumber };
