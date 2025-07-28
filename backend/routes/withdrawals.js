const express = require('express');
const router = express.Router();
const Withdrawal = require('../models/Withdrawal');

router.get('/', async (req, res) => {
  const data = await Withdrawal.find();
  res.json(data);
});

router.post('/', async (req, res) => {
  const newItem = new Withdrawal(req.body);
  await newItem.save();
  res.json(newItem);
});

router.put('/:id', async (req, res) => {
  const updated = await Withdrawal.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  await Withdrawal.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;