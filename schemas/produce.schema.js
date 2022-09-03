const mongoose = require('mongoose');

const ProduceSchema = new mongoose.Schema({
  owner: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
});

module.exports = ProduceSchema;
