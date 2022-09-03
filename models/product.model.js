const mongoose = require('mongoose');
const ProductSchema = require('../schemas/product.schema');

module.exports = mongoose.model('Product', ProductSchema);
