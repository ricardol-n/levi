const axios = require("axios");
const TEST_MODE = process.env.TEST_MODE === "true"; 
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
      checkoutLink: redirectUrl || "http://localhost:5175/depositconfirmationpage",
      status: "New",
    };
  }

  const host = process.env.BTCPAY_HOST;
  const storeId = process.env.BTCPAY_STORE_ID;
  const apiKey = process.env.BTCPAY_API_KEY;

  if (!host || !storeId || !apiKey) {
    throw new Error("⚠️ Missing BTCPAY environment variables.");
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `token ${apiKey}`,
  };

  const data = {
    amount,
    currency: "USD", 
    metadata: { userId },
    checkout: {
      redirectURL: redirectUrl || `${process.env.APP_BASE_URL}/dashboard`,
      defaultPaymentMethod: "BTC",
    },
    notificationURL: `${process.env.APP_BASE_URL}/api/webhook/btcpay`, // webhook.js
  };

  try {
    const response = await axios.post(
      `${host}/api/v1/stores/${storeId}/invoices`,
      data,
      { headers }
    );
    return response.data;
  } catch (err) {
    console.error("❌ BTCPay invoice creation failed:", err.response?.data || err.message);
    throw new Error("Failed to create BTCPay invoice");
  }
};

// ✅ New: fetch invoice status from BTCPay
const getBTCPayInvoice = async (invoiceId) => {
  
    if (TEST_MODE) {
    console.log("⚡ TEST_MODE enabled: Auto-confirming invoice", invoiceId);

    return {
      id: invoiceId,
      status: "Settled", // ✅ Pretend payment was successful
    };
  }
  const host = process.env.BTCPAY_HOST;
  const storeId = process.env.BTCPAY_STORE_ID;
  const apiKey = process.env.BTCPAY_API_KEY;

  if (!host || !storeId || !apiKey) {
    throw new Error("Missing BTCPAY environment variables");
  }

  const headers = { Authorization: `token ${apiKey}` };

  try {
    const response = await axios.get(
      `${host}/api/v1/stores/${storeId}/invoices/${invoiceId}`,
      { headers }
    );
    return response.data;
  } catch (err) {
    console.error("❌ BTCPay fetch invoice failed:", err.response?.data || err.message);
    throw new Error("Failed to fetch BTCPay invoice");
  }
};
module.exports = { createBTCPayInvoice , getBTCPayInvoice };
