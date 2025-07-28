router.post('/sweep', async (req, res) => {
  const { chain, fromAddress, toAddress, amount } = req.body;

  try {
    const result = await sweepToMasterWallet({ chain, fromAddress, toAddress, amount });
    res.json({ success: true, txId: result.txId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
