const mongoose = require('mongoose');

const HarvestSchema = new mongoose.Schema({
  owner: {
    type: String,
    required: true,
  },
  yield: {
    type: Number,
    required: true,
  },
  weight: {
    type: Number,
    required: true,
  },
  date: {
    type: Number,
    required: true,
  },
  produce: {
    type: String,
    required: true,
  },
});

module.exports = HarvestSchema;
