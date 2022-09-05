let { Router } = require('express');
let router = Router();
let fs = require('fs');
let path = require('path');

let multer = require('multer');
let upload = multer({ dest: path.join(process.cwd(), 'temp') });

/**
 * @openapi
 * /api/v1/documents:
 *   post:
 *     description: Add users documents.
 *     tags: [Documents]
 *     produces:
 *       - multipart/form-data
 *     parameters:
 *       - name: files
 *         description: The users documents.
 *         type: object
 *     responses:
 *       200:
 *         description: Returns data or error message.
 *       401:
 *         description: Returns "Unauthorized".
 */
router.post('/', upload.single('file'), async (request, response) => {
  let { file, user } = request;

  if (!fs.existsSync(path.join(process.cwd(), 'documents', user._id.toString())))
    fs.mkdirSync(path.join(process.cwd(), 'documents', user._id.toString()));

  try {
    await fs.writeFileSync(
      path.join(process.cwd(), 'documents', user._id.toString(), file.originalname),
      await fs.readFileSync(file.path)
    );

    await fs.unlinkSync(file.path);

    return response.status(200).json({
      success: 'File uploaded successfully.',
      name: file.originalname,
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
