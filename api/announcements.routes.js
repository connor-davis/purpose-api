let { Router } = require('express');
let router = Router();
let passport = require('passport');
let Announcement = require('../models/announcement.model');

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
    if ((await Announcement.countDocuments()) > 0) {
      const announcements = await Announcement.find();

      return response.status(200).json({
        data: [
          ...announcements.map((announcement) => {
            return announcement.toJSON();
          }),
        ],
      });
    } else {
      return response.status(200).json({ data: [] });
    }
  }
);

module.exports = router;
