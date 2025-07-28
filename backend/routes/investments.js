const express = require('express');
const router = express.Router();
const Investment = require('../models/Investment');

router.get('/', async (req, res) => {
  const data = await Investment.find();
  res.json(data);
});

router.post('/', async (req, res) => {
  const newItem = new Investment(req.body);
  await newItem.save();
  res.json(newItem);
});

router.put('/:id', async (req, res) => {
  const updated = await Investment.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  await Investment.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;