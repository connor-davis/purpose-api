let {Router} = require('express');
let router = Router();

let authenticationRoutes = require('./authentication');
let usersRoutes = require('./users');
let productsRoutes = require("./products");

/**
 * @openapi
 * components:
 *   securitySchemes:
 *     Bearer:
 *       type: apiKey
 *       name: Authorization
 *       in: header
 */

/**
 * @openapi
 * tags:
 *   - name: Authentication
 *     description: Api authentication routes.
 *   - name: Users
 *     description: Api users routes.
 *   - name: Products
 *     description: Api products routes.
 */
router.use('/auth', authenticationRoutes);
router.use('/users', usersRoutes);
router.use('/products', productsRoutes)

module.exports = router;
