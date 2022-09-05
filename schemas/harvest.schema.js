const mongoose = require('mongoose');
const ProduceSchema = require('./produce.schema');

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
    type: ProduceSchema,
    required: true,
  },
});

module.exports = HarvestSchema;
