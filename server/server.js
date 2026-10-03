
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const Transaction = require('./Transaction');

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/expenseTracker')
  .then(() => console.log('MongoDB connected successfully'))
  .catch((error) =>
    console.log('MongoDB connection error:', error)
  );


app.get('/', (req, res) => {
  res.send('Expense Tracker Backend is running!');
});


app.get('/transactions', async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ _id: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


app.post('/transactions', async (req, res) => {
  try {
    const transaction = new Transaction(req.body);
    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


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

app.put('/test', (req, res) => {
  res.send('PUT route is working!');
});
app.listen(5000, () => {
  console.log('Server running on port 5000');
});

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

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.log('Delete error:', error);
    res.status(400).json({ message: error.message });
  }
});