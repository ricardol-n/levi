const express = require('express');
const cors = require('cors');
const app = express();
const port = 4000;
const mongoose = require('mongoose');
require('dotenv').config();
require('./cron/depositchecker'); // cron job
const verifyToken = require('./middleware/auth');
// ✅ Middlewares
const allowedOrigins = [
  'http://localhost:5175',
  'http://localhost:5185',
  ...process.env.ALLOW_ALL_VERCEL === 'true'
    ? [/^https:\/\/levi-6m1v-.*\.vercel\.app$/]
    : ['https://levi-6m1v-7i8qcej2h-levis-projects-e13e0406.vercel.app']
];


app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log(`[CORS] Incoming request from: ${origin}`);
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200); // 👈 Preflight response
  }

  next();
});

app.use(express.json());


// ✅ Import routes here
const { authRouter } = require('./routes/auth');
const rateRoutes = require('./routes/rates');
const userRoutes = require('./routes/users');
const investmentRoutes = require('./routes/investments');
const transactionRoutes = require('./routes/transactions');
const withdrawalRoutes = require('./routes/withdrawals');
const depositRoutes = require('./routes/deposit');  // this is your /api/deposit routes


// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB Connected ✅'))
.catch(err => console.error(err));

// ✅ Register routes
app.use('/api/auth', authRouter);
app.use('/api/rates', rateRoutes);
app.use('/api', require('./routes/users')); // ✅ Adjust path if needed
app.use('/api', depositRoutes);
app.use('/api/webhook', require('./routes/webhook'));
app.use('/api', userRoutes);
app.use('/investments', verifyToken, investmentRoutes);
app.use('/transactions', verifyToken, transactionRoutes);
app.use('/withdrawals', verifyToken, withdrawalRoutes); // ✅ This line

// ✅ Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
