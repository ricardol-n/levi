const axios = require('axios');

const createBTCPayInvoice = async ({ amount, currency, userId, webhookUrl, redirectUrl }) => {
  const host = process.env.BTCPAY_HOST;
  const storeId = process.env.BTCPAY_STORE_ID;
  const apiKey = process.env.BTCPAY_API_KEY;

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `token ${apiKey}`,
  };

  const data = {
    amount,
    currency,
    metadata: {
      userId,
    },
    checkout: {
      redirectURL: redirectUrl,
      defaultPaymentMethod: 'BTC',
    },
    notificationURL: webhookUrl
  };

  const response = await axios.post(`${host}/api/v1/stores/${storeId}/invoices`, data, { headers });
  return response.data;
};

module.exports = {
  createBTCPayInvoice,
};
