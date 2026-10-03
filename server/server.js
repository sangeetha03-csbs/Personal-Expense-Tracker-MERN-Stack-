require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const Transaction = require('./Transaction');

app.use(cors());
app.use(express.json());

// Check whether Render receives the MongoDB URI.
// This does NOT print your password.

console.log('MONGODB_URI loaded:', Boolean(process.env.MONGODB_URI));

// Connect to MongoDB
const mongoURI =
  process.env.MONGODB_URI ||
  'mongodb://127.0.0.1:27017/expenseTracker';

mongoose
  .connect(mongoURI)
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

// Home route
app.get('/', (req, res) => {
  res.send('Expense Tracker Backend is running!');
});

// Get all transactions
app.get('/transactions', async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ _id: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a transaction
app.post('/transactions', async (req, res) => {
  try {
    const transaction = new Transaction(req.body);
    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a transaction
app.put('/transactions/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      {
        amount: req.body.amount,
        description: req.body.description
      },
      { new: true, runValidators: true }
    );

    if (!transaction) {
      return res.status(404).json({
        message: 'Transaction not found'
      });
    }

    res.json(transaction);
  } catch (error) {
    console.log('Edit error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Test route
app.put('/test', (req, res) => {
  res.send('PUT route is working!');
});

// Delete a transaction
app.delete('/transactions/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndDelete(
      req.params.id
    );

    if (!transaction) {
      return res.status(404).json({
        message: 'Transaction not found'
      });
    }

    res.json({
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    console.log('Delete error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```
