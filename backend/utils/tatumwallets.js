const axios = require('axios');
const API_KEY = process.env.TATUM_API_KEY;
const axiosRetry = require('axios-retry');

const headers = {
  'x-api-key': API_KEY,
};

// Map to Tatum-supported chains
const chainMap = {
  BTC: 'bitcoin'
};

// ✅ Generate wallets for each chain
async function generateWallets() {
  try {
    const btcWalletRes = await axios.get('https://api.tatum.io/v3/bitcoin/wallet', { headers });

    return {
      BTC: {
        xpub: btcWalletRes.data.xpub,
      },
    };
  } catch (error) {
    console.error('❌ Error generating BTC wallet:', error?.response?.data || error.message);
    throw error;
  }
}

// ✅ Get deposit address from xpub
async function getDepositAddress(chain, xpub, index = 0) {
  try {
    const url = `https://api.tatum.io/v3/${chain}/address/${xpub}/${index}`;
    const res = await axios.get(url, { headers });
    return res.data.address;
  } catch (error) {
    console.error('❌ Error getting deposit address:', error?.response?.data || error.message);
    throw error;
  }
}

axiosRetry(axios, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
});


module.exports = {
  generateWallets,
  getDepositAddress,
};
