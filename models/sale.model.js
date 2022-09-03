const mongoose = require('mongoose');
const SaleSchema = require('../schemas/sale.schema');

module.exports = mongoose.model('Sale', SaleSchema);
