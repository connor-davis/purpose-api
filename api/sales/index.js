let { Router } = require('express');
let router = Router();
let passport = require('passport');

let createSaleRoutes = require('./createSale.routes');
let updateSaleRoutes = require('./updateSale.routes');
let deleteSaleRoutes = require('./deleteSale.routes');
let { readTransaction } = require('../../utils/neo4j');
let { GET_SALES, GET_SALE } = require('../../queries/salesQuerys');

/**
 * @openapi
 * /api/v1/sales:
 *   get:
 *     description: Retrieve the users products
 *     tags: [Sales]
 *     produces:
 *       - application/json
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Returns the users sales.
 *       401:
 *         description: Returns "Unauthorized".
 */
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  async (request, response) => {
    let { user } = request;

    await readTransaction(GET_SALES(user.id), (error, result) => {
      if (error)
        return response
          .status(200)
          .json({ message: 'Error while retrieving user sales.', error });
      else {
        let records = result.records;
        let data = records.map((record) => {
          return { ...record.get('sale'), product: record.get('product') };
        });

        return response.status(200).json({ data });
      }
    });
  }
);

/**
 * @openapi
 * /api/v1/sales/:id:
 *   get:
 *     description: Retrieve a sale with id :id
 *     tags: [Sales]
 *     produces:
 *       - application/json
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Returns the sale with id :id.
 *       401:
 *         description: Returns "Unauthorized".
 */
router.get(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  async (request, response) => {
    let { params } = request;

    await readTransaction(GET_SALE(params.id), (error, result) => {
      if (error)
        return response
          .status(200)
          .json({ message: 'Error while retrieving user sale.', error });
      else {
        let record = result.records[0];

        if (record) {
          let data = { ...record.get('sale'), product: record.get('product') };

          return response.status(200).json({ data });
        } else
          return response.status(200).json({
            message: 'Sale not found.',
            error: 'sale-not-found',
          });
      }
    });
  }
);

router.use(
  '/',
  passport.authenticate('jwt', { session: false }),
  createSaleRoutes
);
router.use(
  '/',
  passport.authenticate('jwt', { session: false }),
  updateSaleRoutes
);
router.use(
  '/',
  passport.authenticate('jwt', { session: false }),
  deleteSaleRoutes
);

module.exports = router;
