let { Router } = require('express');
let router = Router();
let passport = require('passport');
let Harvest = require('../../../models/harvest.model');

/**
 * @openapi
 * /api/v1/admin/ecd/harvests:
 *   get:
 *     description: Get a harvests.
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
  '/harvests',
  passport.authenticate('jwt', { session: false }),
  async (request, response) => {
    let { user } = request;

    if (user.businessType !== 'admin') return response.status(401);

    try {
      if ((await Harvest.count()) > 0) {
        const found = await Harvest.find();
        const data = found.map((harvest) => {
          return { ...harvest.toJSON() };
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
