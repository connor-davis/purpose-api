const mongoose = require('mongoose');
const ProductSchema = require('./product.schema');

const SaleSchema = new mongoose.Schema({
  owner: {
    type: String,
    required: true,
  },
  date: {
    type: Number,
    required: true,
  },
  product: {
    type: ProductSchema,
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
