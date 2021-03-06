let { Router } = require('express');
let router = Router();
let passport = require('passport');
let { readTransaction } = require('../../../utils/neo4j');
let { GET_SALES } = require('../../../queries/salesQuerys');
const { GET_PRODUCTS } = require('../../../queries/productQuerys');
const { GET_USER } = require('../../../queries/userQuerys');
const { GET_ALL_PRODUCE_USER } = require('../../../queries/ecd/ecdQuerys');

/**
 * @openapi
 * /api/v1/user/:id/products:
 *   get:
 *     description: Get a specific users products.
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

    await readTransaction(GET_USER({ id }, true), async (error, result) => {
      if (error)
        return response
          .status(200)
          .json({ message: 'Error while retrieving user data.', error });
      else {
        let record = result.records[0];
        let data = { ...record.get("user") };

        if (data.type === "earlyChildhoodDevelopmentCenter") {
          await readTransaction(GET_ALL_PRODUCE_USER(id), async (error, result) => {
            if (error)
              return response
                .status(200)
                .json({ message: 'Error while retrieving user data.', error });
            else {
              let data = result.records.map((record) => {
                return record.get('produce');
              });

              return response.status(200).json({ data });
            }
          });
        } else {
          await readTransaction(GET_PRODUCTS(id), (error, result) => {
            if (error)
              return response
                .status(200)
                .json({ message: 'Error while retrieving user data.', error });
            else {
              let data = result.records.map((record) => {
                return record.get('product');
              });

              return response.status(200).json({ data });
            }
          });
        }
      }
    })
  }
);

module.exports = router;
