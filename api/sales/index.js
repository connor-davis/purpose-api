let { Router } = require('express');
let router = Router();
let passport = require('passport');
let Sale = require('../../models/sale.model');
let Product = require('../../models/product.model');
let moment = require("moment");

let createSaleRoutes = require('./createSale.routes');
let updateSaleRoutes = require('./updateSale.routes');
let deleteSaleRoutes = require('./deleteSale.routes');

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
 *         description: Returns the users userData.
 *       401:
 *         description: Returns "Unauthorized".
 */
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  async (request, response) => {
    let { user } = request;

    if ((await Sale.count()) > 0) {
      try {
        const sales = await Sale.find({ owner: user._id });
        const data = sales.map((sale) => {
          let saleData = sale.toJSON();

          return {
            ...saleData,
          };
        });

        return response.status(200).json({ data });
      } catch (error) {
        return response
          .status(200)
          .json({ message: 'Error while finding user sales.', error });
      }
    } else {
      return response.status(200).json({ data: [] });
    }
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

    try {
      const found = await Sale.findOne({ _id: params.id });

      if (!found)
        return response
          .status(200)
          .json({ message: 'Sale not found.', error: 'sale-not-found' });
      else {
        const data = { ...found.toJSON() };

        return response.status(200).json({ data });
      }
    } catch (error) {
      return response
        .status(200)
        .json({ message: 'Error while retrieving user sale.', error });
    }
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
