const axios = require('axios');
const TATUM_API_KEY = process.env.TATUM_API_KEY;

const sweepToMasterWallet = async ({ chain, fromAddress, toAddress, amount }) => {
  try {
    const res = await axios.post(`https://api.tatum.io/v3/blockchain/transaction`, {
      fromAddress,
      to: toAddress,
      amount: amount.toString(),
      currency: chain,
    }, {
      headers: { 'x-api-key': TATUM_API_KEY }
    });

    return res.data;

  } catch (error) {
    console.error("❌ Sweep failed:", error.response?.data || error.message);
    throw new Error("Sweep to master wallet failed");
  }
};

module.exports = { sweepToMasterWallet };
