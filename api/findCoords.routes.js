let { Router } = require('express');
let router = Router();
let passport = require('passport');
let axios = require('axios');

/**
 * @openapi
 * /api/v1/findCoords/:address:
 *   get:
 *     description: Get coords based on address.
 *     tags: [Coords]
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
  '/:address',
  passport.authenticate('jwt', { session: false }),
  async (request, response) => {
    let { address } = request.params;

    let aResponse = await axios.get(
      'http://api.positionstack.com/v1/forward?access_key=' +
        process.env.COORD_FINDER_KEY +
        '&query=' +
        address
    );

    if (!aResponse.data.data)
      return response.status(200).json({
        error: 'find-coords-error',
        message: 'Error while searching.',
      });
    if (aResponse.data.data === 0)
      return response
        .status(200)
        .json({ message: 'There are no results for that search.' });
    else {
      let results = aResponse.data.data;
      return response.status(200).json({ data: results });
    }
  }
);

module.exports = router;
