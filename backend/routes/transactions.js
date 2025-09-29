const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

const verifyToken = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");

router.get("/", verifyToken, async (req, res) => {
  try {
    const query = req.user.role === "admin"
      ? {}
      : { userId: req.user._id };

    const transactions = await Transaction.find(query).populate("userId", "email");
    res.json(transactions.map(t => ({ ...t.toObject(), id: t._id })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



router.post('/', async (req, res) => {
  const newItem = new Transaction(req.body);
  await newItem.save();
  res.json(newItem);
});

router.put('/:id', async (req, res) => {
  const updated = await Transaction.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  await Transaction.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;