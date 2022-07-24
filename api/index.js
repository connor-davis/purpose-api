let { Router } = require('express');
let router = Router();

let authenticationRoutes = require('./authentication');
let usersRoutes = require('./users');
let productsRoutes = require('./products');
let salesRoutes = require('./sales');
let adminRoutes = require('./admin');
let findCoordsRoutes = require('./findCoords.routes');
let documentsRoutes = require('./documents');
let announcementsRoutes = require('./announcements.routes');
let archiveRoutes = require('./archive');
let produceRoutes = require('./produce');
let harvestedRoutes = require("./harvested");

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
router.use('/products', productsRoutes);
router.use('/sales', salesRoutes);
router.use('/admin', adminRoutes);
router.use('/findCoords', findCoordsRoutes);
router.use('/documents', documentsRoutes);
router.use('/announcements', announcementsRoutes);
router.use('/archive', archiveRoutes);
router.use('/produce', produceRoutes);
router.use('/harvests', harvestedRoutes);

module.exports = router;
