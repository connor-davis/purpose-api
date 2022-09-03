const mongoose = require("mongoose");
const ProduceSchema = require("../schemas/produce.schema");

module.exports = mongoose.model("Produce", ProduceSchema);