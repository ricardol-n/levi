const axios = require('axios');
const TATUM_API_KEY = process.env.TATUM_API_KEY; // replace securely

module.exports = async function verify(address, amount, currency) {
  try {
    const url = `https://api.tatum.io/v3/${currency}/address/balance/${address}`;
    const res = await axios.get(url, {
      headers: { 'x-api-key': TATUM_API_KEY }
    });

    const balance = parseFloat(res.data?.balance || 0);
    return balance >= amount;
  } catch (err) {
    console.error("Verification failed:", err.message);
    return false;
  }
};
