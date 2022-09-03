const mongoose = require('mongoose');
const HarvestSchema = require('../schemas/harvest.schema');

module.exports = mongoose.model('Harvest', HarvestSchema);
