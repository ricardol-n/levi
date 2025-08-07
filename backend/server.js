const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const bodyParser = require('body-parser');

require('./cron/depositchecker'); // cron job
const verifyToken = require('./middleware/auth');

const app = express();
const port = process.env.PORT || 4000;

// ✅ Add all allowed frontend origins here
const allowedOrigins = [
  'http://localhost:5175',
  'http://localhost:5185',
  'https://levi-6m1v-pjrz6a4rv-levis-projects-e13e0406.vercel.app',
  'https://levi-6m1v-git-main-levis-projects-e13e0406.vercel.app'
];

// ✅ Custom CORS middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

// ✅ Parse incoming JSON
app.use(express.json());

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected ✅'))
  .catch(err => console.error(err));

// ✅ Import routes

const authRouter  = require('./routes/auth');
const rateRoutes = require('./routes/rates');
const userRoutes = require('./routes/users');
const investmentRoutes = require('./routes/investments');
const transactionRoutes = require('./routes/transactions');
const withdrawalRoutes = require('./routes/withdrawals');
const depositRoutes = require('./routes/deposit');
const webhookRoutes = require('./routes/webhook');

// ✅ Register routes

app.use('/api/auth', authRouter);
app.use('/api/rates', rateRoutes);
app.use('/api', userRoutes);
app.use('/api', depositRoutes);
app.use('/api/webhook', webhookRoutes);
app.use('/investments', verifyToken, investmentRoutes);
app.use('/transactions', verifyToken, transactionRoutes);
app.use('/withdrawals', verifyToken, withdrawalRoutes);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
