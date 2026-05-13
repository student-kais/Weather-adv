const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
    name: String,
    country: String,
    lat: Number,
    lon: Number,
    searchDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('History', historySchema);
