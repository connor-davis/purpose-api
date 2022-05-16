let { Router } = require('express');
let router = Router();
let fs = require('fs');
let path = require('path');

let multer = require('multer');
let upload = multer({ dest: path.join(process.cwd(), 'temp') });

/**
 * @openapi
 * /api/v1/documents:
 *   delete:
 *     description: Removes a document.
 *     tags: [Documents]
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Returns success or error message.
 *       401:
 *         description: Returns "Unauthorized".
 */
router.delete('/:id/:filename', async (request, response) => {
  let { id, filename } = request.params;

  try {
    await fs.unlinkSync(path.join(process.cwd(), 'documents', id, filename));

    return response.status(200).json({
      success: 'File deleted successfully.',
      name: filename,
    });
  } catch (error) {
    console.log(error);

    return response.status(200).json({
      error: 'document-delete-error',
      message: 'Failed to delete document',
    });
  }
});

module.exports = router;
