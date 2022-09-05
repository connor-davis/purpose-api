let { Router } = require('express');
let router = Router();
let passport = require('passport');
let Harvest = require('../../models/harvest.model');

let createHarvestedRoutes = require('./addHarvested.routes');
let deleteHarvestedRoutes = require('./removeHarvested.routes');

/**
 * @openapi
 * /api/v1/harvests:
 *   get:
 *     description: Retrieve the users harvests
 *     tags: [Harvests]
 *     produces:
 *       - application/json
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Returns the users harvests.
 *       401:
 *         description: Returns "Unauthorized".
 */
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  async (request, response) => {
    let { user } = request;

    try {
      if ((await Harvest.count()) > 0) {
        const found = await Harvest.find({ owner: user.email });
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
        .json({ message: 'Error while retrieving user harvests.', error });
    }
  }
);

/**
 * @openapi
 * /api/v1/harvests/:id:
 *   get:
 *     description: Retrieve a harvest with id :id
 *     tags: [Harvests]
 *     produces:
 *       - application/json
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Returns the harvest with id :id.
 *       401:
 *         description: Returns "Unauthorized".
 */
router.get(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  async (request, response) => {
    let { params } = request;

    try {
      const found = await Harvest.findOne({ _id: params.id });

      if (!found) {
        return response.status(200).json({
          message: 'Harvest not found.',
          error: 'harvest-not-found',
        });
      } else {
        const data = found.toJSON();

        return response.status(200).json({ data });
      }
    } catch (error) {
      return response
        .status(200)
        .json({ message: 'Error while retrieving user harvest.', error });
    }
  }
);

router.use(
  '/',
  passport.authenticate('jwt', { session: false }),
  createHarvestedRoutes
);
router.use(
  '/',
  passport.authenticate('jwt', { session: false }),
  deleteHarvestedRoutes
);

module.exports = router;
