let { Router } = require('express');
let router = Router();
let passport = require('passport');
let fs = require('fs');
let path = require('path');

let addArchiveRoutes = require('./addArchive.routes');
let removeArchiveRoutes = require('./removeArchive.routes');

/**
 * @openapi
 * /api/v1/archive:
 *   get:
 *     description: Get all archive files.
 *     tags: [Archive]
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
router.get('/', async (request, response) => {
  let data = fs.readdirSync(path.join(process.cwd(), 'public', 'archive'), {
    withFileTypes: true,
  });

  data = data.map((archive) => {
    return {
      name: archive.name,
      type: archive.isFile() ? 'file' : 'directory',
    };
  });

  return response.status(200).json({ data });
});

router.use(
  '/',
  passport.authenticate('jwt', { session: false }),
  addArchiveRoutes
);
router.use(
  '/',
  passport.authenticate('jwt', { session: false }),
  removeArchiveRoutes
);

module.exports = router;
