const cron = require('node-cron');
const Deposit = require('../models/Deposit');
const User = require('../models/user');
const verifyBlockchainDeposit = require('../utils/verifyBlockchainDeposit'); // <-- function you'll write

// Run every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  console.log("🔁 Running deposit check...");

  const pendingDeposits = await Deposit.find({ status: 'pending' });

  for (let deposit of pendingDeposits) {
    const isConfirmed = await verifyBlockchainDeposit(deposit.address, deposit.amount, deposit.currency);

    if (isConfirmed) {
      // Update deposit
      deposit.status = 'confirmed';
      await deposit.save();

      // Update user balance
      await User.findByIdAndUpdate(deposit.userId, {
        $inc: { balance: deposit.amount }
      });

      console.log(`✅ Deposit confirmed for user ${deposit.userId}`);
    }
  }
});
