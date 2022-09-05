let { Router } = require('express');
let router = Router();
let passport = require('passport');
let Sale = require('../../../models/sale.model');

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

    if (user.businessType !== 'admin') return response.status(401);

    try {
      if ((await Sale.count()) > 0) {
        const found = await Sale.find();
        const data = found.map((sale) => {
          return { ...sale.toJSON() };
        });

        return response.status(200).json({ data });
      } else {
        return response.status(200).json({ data: [] });
      }
    } catch (error) {
      return response
        .status(200)
        .json({ message: 'Error while retrieving user data.', error });
    }
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

    if (user.businessType !== 'admin') return response.status(401);

    try {
      if ((await Sale.count({ owner: id })) > 0) {
        const found = await Sale.find({ owner: id });
        const data = found.map((sale) => {
          return { ...sale.toJSON() };
        });

        return response.status(200).json({ data });
      } else {
        return response.status(200).json({ data: [] });
      }
    } catch (error) {
      return response
        .status(200)
        .json({ message: 'Error while retrieving user data.', error });
    }
  }
);

module.exports = router;
