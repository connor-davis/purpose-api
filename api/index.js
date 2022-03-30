let { Router } = require('express');
let router = Router();

let authenticationRoutes = require('./authentication');
let usersRoutes = require('./users');

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
 */
router.use('/auth', authenticationRoutes);
router.use('/users', usersRoutes);

module.exports = router;
