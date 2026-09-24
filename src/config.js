const fs = require('node:fs');
const path = require('node:path');

function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return;

  fs.readFileSync(envPath, 'utf8').split(/\r?\n/).forEach(line => {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2');
    }
  });
}

loadEnvFile();

const config = Object.freeze({
  port: Number(process.env.PORT || 3000),
  staticRoot: path.join(__dirname, '..'),
  mpesa: Object.freeze({
    environment: process.env.MPESA_ENVIRONMENT || 'sandbox',
    consumerKey: process.env.MPESA_CONSUMER_KEY,
    consumerSecret: process.env.MPESA_CONSUMER_SECRET,
    shortcode: process.env.MPESA_SHORTCODE,
    passkey: process.env.MPESA_PASSKEY,
    callbackUrl: process.env.MPESA_CALLBACK_URL
  })
});

function missingMpesaSettings() {
  return Object.entries(config.mpesa)
    .filter(([key, value]) => key !== 'environment' && !value)
    .map(([key]) => key);
}

module.exports = { config, missingMpesaSettings };
