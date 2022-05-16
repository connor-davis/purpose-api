let { Router } = require('express');
let router = Router();
let passport = require('passport');
let { readTransaction } = require('../../../utils/neo4j');
let { GET_SALES, GET_ALL_SALES } = require('../../../queries/salesQuerys');

/**
 * @openapi
 * /api/v1/user/sales/all:
 *   get:
 *     description: Get a specific users sales.
 *     tags: [Admin]
 *     produces:
 *       - application/text
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Returns data.
 *       401:
 *         description: Returns "Unauthorized".
 */
router.get(
  '/all',
  passport.authenticate('jwt', { session: false }),
  async (request, response) => {
    let { user } = request;

    if (user.type !== 'admin') return response.status(401);

    await readTransaction(GET_ALL_SALES(), (error, result) => {
      if (error)
        return response
          .status(200)
          .json({ message: 'Error while retrieving user data.', error });
      else {
        let data = result.records.map((record) => {
          let sale = record.get('sale');
          let product = record.get('product');

          return { ...sale, product };
        });

        return response.status(200).json({ data });
      }
    });
  }
);

/**
 * @openapi
 * /api/v1/user/sales/:id:
 *   get:
 *     description: Get a specific users sales.
 *     tags: [Admin]
 *     produces:
 *       - application/text
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Returns data.
 *       401:
 *         description: Returns "Unauthorized".
 */
router.get(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  async (request, response) => {
    let { user } = request;
    let { id } = request.params;

    if (user.type !== 'admin') return response.status(401);

    await readTransaction(GET_SALES(id), (error, result) => {
      if (error)
        return response
          .status(200)
          .json({ message: 'Error while retrieving user data.', error });
      else {
        let data = result.records.map((record) => {
          let sale = record.get('sale');
          let product = record.get('product');

          return { ...sale, product };
        });

        return response.status(200).json({ data });
      }
    });
  }
);

module.exports = router;
