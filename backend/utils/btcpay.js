// backend/utils/btcpay.js  (replace file)
const axios = require("axios");

const TEST_MODE = process.env.TEST_MODE === "true";
const BTCPAY_HOST = process.env.BTCPAY_HOST;         // must include https://
const BTCPAY_STORE_ID = process.env.BTCPAY_STORE_ID;
const BTCPAY_API_KEY = process.env.BTCPAY_API_KEY;
const BACKEND_URL = process.env.BACKEND_URL;
const FRONTEND_URLS = process.env.FRONTEND_URLS ? process.env.FRONTEND_URLS.split(",") : [];
const FRONTEND_URL = process.env.FRONTEND_URL || FRONTEND_URLS[0];

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
    console.error("⚠️ Missing BTCPAY env. BTCPAY_HOST:", !!BTCPAY_HOST, "STORE:", !!BTCPAY_STORE_ID, "APIKEY:", !!BTCPAY_API_KEY, "BACKEND_URL:", !!BACKEND_URL);
    throw new Error("Missing BTCPay environment variables");
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `token ${BTCPAY_API_KEY}`,
  };

  const payload = {
    amount,
    currency: "USD",
    metadata: {
      userId,
      amount,
      type: "deposit",
    },
    checkout: {
      redirectAutomatically: true,
      redirectURL: redirectUrl || `${FRONTEND_URL}/depositconfirmationpage`,
      defaultPaymentMethod: "BTC",
    },
    notificationURL: `${BACKEND_URL}/api/webhook/btcpay`,
  };

  try {
    console.log("➡️ Creating BTCPay invoice payload:", JSON.stringify(payload));
    console.log("🔍 Using BTCPAY vars:", { BTCPAY_HOST, BTCPAY_STORE_ID, BTCPAY_API_KEY: !!BTCPAY_API_KEY, BACKEND_URL});

    const resp = await axios.post(
      `${BTCPAY_HOST}/api/v1/stores/${BTCPAY_STORE_ID}/invoices`,
      payload,
      { headers, timeout: 15000 }
    );

    // log full response body for debugging
    console.log("✅ BTCPay response body:", JSON.stringify(resp.data));

    // BTCPay returns invoice object — try common property names
    const invoice = resp.data || {};
    // checkout link might be invoice.checkoutLink or invoice.data.checkoutLink depending on wrapper
    const checkoutLink = invoice.checkoutLink || invoice.data?.checkoutLink || invoice.hostedCheckoutLink || invoice.url;

    // normalize return
    return {
      id: invoice.id || invoice.data?.id || null,
      checkoutLink: checkoutLink || null,
      raw: invoice,
      status: invoice.status || invoice.data?.status || "unknown",
    };
  } catch (err) {
    // print any body returned by BTCPay server for debugging
    console.error("❌ BTCPay invoice creation failed. err.response?.status:", err.response?.status, "data:", err.response?.data);
    // include err.message too
    console.error(err.message);
    throw new Error("Failed to create BTCPay invoice: " + (err.response?.data?.message || err.message));
  }
};

const getBTCPayInvoice = async (invoiceId) => {
  if (TEST_MODE) {
    return { id: invoiceId, status: "Settled" };
  }
  if (!BTCPAY_HOST || !BTCPAY_STORE_ID || !BTCPAY_API_KEY) {
    throw new Error("Missing BTCPay environment variables");
  }
  try {
    const headers = { Authorization: `token ${BTCPAY_API_KEY}` };
    const resp = await axios.get(`${BTCPAY_HOST}/api/v1/stores/${BTCPAY_STORE_ID}/invoices/${invoiceId}`, { headers, timeout: 10000 });
    console.log("✅ BTCPay get invoice response:", JSON.stringify(resp.data));
    return resp.data;
  } catch (err) {
    console.error("❌ BTCPay fetch invoice failed:", err.response?.data || err.message);
    throw new Error("Failed to fetch BTCPay invoice");
  }
};

module.exports = { createBTCPayInvoice, getBTCPayInvoice };
