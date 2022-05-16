let { Router } = require('express');
let router = Router();
let passport = require('passport');
const { readTransaction } = require('../utils/neo4j');
const { GET_ANNOUNCEMENTS } = require('../queries/announcementQueries');

/**
 * @openapi
 * /api/v1/announcements:
 *   get:
 *     description: Get announcements.
 *     tags: [Announcements]
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
  '/',
  passport.authenticate('jwt', { session: false }),
  async (request, response) => {
    await readTransaction(GET_ANNOUNCEMENTS(), (error, result) => {
      if (error)
        return response
          .status(200)
          .json({ error, message: 'Failed to get announcements.' });
      else {
        let data = result.records.map((record) => {
          let announcement = record.get('announcement');
          return { ...announcement };
        });

        return response.status(200).json({ data });
      }
    });
  }
);

module.exports = router;
