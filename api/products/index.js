let { Router } = require('express');
let router = Router();
let passport = require('passport');

let createProductRoutes = require("./createProduct.routes");

router.use("/", passport.authenticate("jwt", { session: false }), createProductRoutes);

module.exports = router;
