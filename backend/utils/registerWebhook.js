const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.TATUM_API_KEY;
const NGROK_WEBHOOK_URL = process.env.NGROK_WEBHOOK_URL;

if (!NGROK_WEBHOOK_URL) {
  console.warn("⚠️ Missing NGROK_WEBHOOK_URL in .env! Webhook registration will fail.");
}


const registerWebhook = async (chain, address) => {
  if (!address || address.length < 27) {
    console.warn(`⚠️ Skipping webhook registration for ${chain} due to invalid or missing address:`, address);
    return;
  }

  const payload = {
    type: 'ADDRESS_TRANSACTION',
    attr: {
      address,
      chain ,
    },
    url: 'https://d0454e28227c.ngrok-free.app/api/webhook/deposit',
  };

  try {
    const res = await axios.post('https://api.tatum.io/v3/subscription', payload, {
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json',
      },
    });

    console.log("🔗 Final webhook URL:", `${NGROK_WEBHOOK_URL}/api/webhook/deposit`);
    console.log("📦 Payload being sent:", JSON.stringify(payload, null, 2));
    console.log(`✅ Registered webhook for ${chain}:`, res.data);
  } catch (err) {
    console.error(`❌ Failed to register webhook for ${chain}:`, err?.response?.data || err.message);
    throw err;
  }
};

module.exports = registerWebhook;
