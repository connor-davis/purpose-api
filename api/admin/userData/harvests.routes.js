let { Router } = require('express');
let router = Router();
let passport = require('passport');
let Harvest = require("../../../models/harvest.model");

/**
 * @openapi
 * /api/v1/user/:id/harvests:
 *   get:
 *     description: Get a specific users harvests.
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
      if (await Harvest.count({ owner: id }) > 0) {
        const found = await Harvest.find({ owner: id });
        const data = found.map((harvest) => {
          return {...harvest.toJSON()};
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
