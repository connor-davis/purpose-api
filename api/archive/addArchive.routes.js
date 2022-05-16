let { Router } = require('express');
let router = Router();
let passport = require('passport');
let fs = require('fs');
let path = require('path');

let multer = require('multer');
let upload = multer({ dest: path.join(process.cwd(), 'temp') });

/**
 * @openapi
 * /api/v1/documents:
 *   post:
 *     description: Add an archive.
 *     tags: [Documents]
 *     produces:
 *       - multipart/form-data
 *     parameters:
 *       - name: file
 *         description: The archive.
 *         type: object
 *     responses:
 *       200:
 *         description: Returns data or error message.
 *       401:
 *         description: Returns "Unauthorized".
 */
router.post('/', upload.single('file'), async (request, response) => {
  let { file, user } = request;

  if (!fs.existsSync(path.join(process.cwd(), 'public', 'archive')))
    fs.mkdirSync(path.join(process.cwd(), 'public', 'archive'));

  try {
    await fs.writeFileSync(
      path.join(process.cwd(), 'public', 'archive', file.originalname),
      await fs.readFileSync(file.path)
    );

    return response.status(200).json({
      success: 'File uploaded successfully.',
      data: {
        name: file.originalname,
        type: 'file',
      },
    });
  } catch (error) {
    console.log(error);

    return response.status(200).json({
      error: 'document-upload-error',
      message: 'Failed to upload document',
    });
  }
});

module.exports = router;
