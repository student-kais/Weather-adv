const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/weather-app';
mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));

// Models
const History = require('./models/History');

// Routes
app.post('/api/history', async (req, res) => {
    try {
        const newHistory = new History(req.body);
        await newHistory.save();
        res.status(201).json(newHistory);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.get('/api/history', async (req, res) => {
    try {
        const history = await History.find().sort({ searchDate: -1 }).limit(10);
        res.json(history);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
