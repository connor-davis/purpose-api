let { Router } = require('express');
let router = Router();
let passport = require('passport');
let fs = require('fs');
let path = require('path');

/**
 * @openapi
 * /api/v1/archive:
 *   delete:
 *     description: Removes an archive.
 *     tags: [Archive]
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Returns arhive or error message.
 *       401:
 *         description: Returns "Unauthorized".
 */
router.delete('/:filename', async (request, response) => {
  let { filename } = request.params;

  try {
    await fs.unlinkSync(
      path.join(process.cwd(), 'public', 'archive', filename)
    );

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
