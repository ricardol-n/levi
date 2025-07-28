const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

router.get('/', async (req, res) => {
  const data = await Transaction.find();
  res.json(data);
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