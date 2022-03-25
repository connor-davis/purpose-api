let { Router } = require('express');
let router = Router();

let authenticationRoutes = require('./authentication');

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
 */
router.use('/auth', authenticationRoutes);

module.exports = router;
