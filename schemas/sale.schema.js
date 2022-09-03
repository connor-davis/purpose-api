const mongoose = require('mongoose');

const SaleSchema = new mongoose.Schema({
  owner: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  product: {
    type: String,
    required: true,
  },
  numberSold: {
    type: Number,
    required: true,
  },
  profit: {
    type: Number,
    required: true,
  },
});

module.exports = SaleSchema;
