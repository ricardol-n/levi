const axios = require("axios");

// Load env vars
const TEST_MODE = process.env.TEST_MODE === "true";
const BTCPAY_HOST = process.env.BTCPAY_HOST;
const BTCPAY_STORE_ID = process.env.BTCPAY_STORE_ID;
const BTCPAY_API_KEY = process.env.BTCPAY_API_KEY;

// ⚡ Split frontend URLs into an array (take the first one for redirects)
const FRONTEND_URLS = process.env.FRONTEND_URLS
  ? process.env.FRONTEND_URLS.split(",")
  : [];
const FRONTEND_URL = process.env.FRONTEND_URL || FRONTEND_URLS[0];

// ✅ Backend must be explicit (for webhooks!)
const BACKEND_URL = process.env.BACKEND_URL;
/**
 * Create a BTC-only invoice in BTCPay Server
 * @param {Object} params
 * @param {number} params.amount - Deposit amount in USD
 * @param {string} params.userId - MongoDB userId
 * @param {string} [params.redirectUrl] - Optional redirect after payment
 */
const createBTCPayInvoice = async ({ amount, userId, redirectUrl }) => {
  if (TEST_MODE) {
    console.log("⚡ TEST_MODE enabled: Returning fake invoice");

    return {
      id: "mock-invoice-" + Date.now(),
      checkoutLink: redirectUrl || `${FRONTEND_URL}/depositconfirmationpage`,
      status: "New",
    };
  }

  if (!BTCPAY_HOST || !BTCPAY_STORE_ID || !BTCPAY_API_KEY || !BACKEND_URL) {
    throw new Error("⚠️ Missing BTCPAY environment variables.");
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `token ${BTCPAY_API_KEY}`,
  };

  const data = {
    amount,
    currency: "USD",
    metadata: { userId,amount },
    checkout: {
      redirectURL: redirectUrl || `${FRONTEND_URL}/dashboard`,
      defaultPaymentMethod: "BTC",
    },
    notificationURL: `${BACKEND_URL}/api/webhook/btcpay`,
  };

  try {
    const response = await axios.post(
      `${BTCPAY_HOST}/api/v1/stores/${BTCPAY_STORE_ID}/invoices`,
      data,
      { headers }
    );
    return response.data;
  } catch (err) {
    console.error("❌ BTCPay invoice creation failed:", err.response?.data || err.message);
    throw new Error("Failed to create BTCPay invoice");
  }
};

// ✅ Fetch invoice status from BTCPay
const getBTCPayInvoice = async (invoiceId) => {
  if (TEST_MODE) {
    console.log("⚡ TEST_MODE enabled: Auto-confirming invoice", invoiceId);

    return {
      id: invoiceId,
      status: "Settled", // Pretend payment was successful
    };
  }

  if (!BTCPAY_HOST || !BTCPAY_STORE_ID || !BTCPAY_API_KEY) {
    throw new Error("⚠️ Missing BTCPAY environment variables.");
  }

  const headers = { Authorization: `token ${BTCPAY_API_KEY}` };

  try {
    const response = await axios.get(
      `${BTCPAY_HOST}/api/v1/stores/${BTCPAY_STORE_ID}/invoices/${invoiceId}`,
      { headers }
    );
    return response.data;
  } catch (err) {
    console.error("❌ BTCPay fetch invoice failed:", err.response?.data || err.message);
    throw new Error("Failed to fetch BTCPay invoice");
  }
};

module.exports = { createBTCPayInvoice, getBTCPayInvoice };
