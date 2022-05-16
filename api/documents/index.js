let { Router } = require('express');
let router = Router();
let passport = require('passport');
let fs = require('fs');
let path = require('path');
let addDocumentsRoutes = require('./addDocuments');
let removeDocumentsRoutes = require('./removeDocuments');

/**
 * @openapi
 * /api/v1/:
 *   get:
 *     description: Get all user documents.
 *     tags: [Documents]
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
    let folders = fs.readdirSync(path.join(process.cwd(), 'documents'), {
      withFileTypes: true,
    });

    let foldersData = [];

    folders.map((folder) => {
      let files = fs.readdirSync(
        path.join(process.cwd(), 'documents', folder.name)
      );

      files = [...files];

      foldersData.push({
        name: folder.name,
        fileCount: files.length,
      });
    });

    return response.status(200).json({ folders: foldersData });
  }
);

/**
 * @openapi
 * /api/v1/:id:
 *   get:
 *     description: Get a specific users documents.
 *     tags: [Documents]
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
    let { id } = request.params;

    let files = fs.readdirSync(path.join(process.cwd(), 'documents', id), {
      withFileTypes: true,
    });

    files = files.map((file) => {
      return { name: file.name, owner: id };
    });

    return response.status(200).json({ files });
  }
);

/**
 * @openapi
 * /api/v1/:id/:filename:
 *   get:
 *     description: Get a specific users documents.
 *     tags: [Documents]
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
  '/:id/:filename',
  // passport.authenticate('jwt', { session: false }),
  async (request, response) => {
    let { id, filename } = request.params;

    let file = fs.readFileSync(
      path.join(process.cwd(), 'documents', id, filename)
    );

    return response.status(200).send(file);
  }
);

router.use(
  '/',
  passport.authenticate('jwt', { session: false }),
  addDocumentsRoutes
);
router.use(
  '/',
  passport.authenticate('jwt', { session: false }),
  removeDocumentsRoutes
);

module.exports = router;
