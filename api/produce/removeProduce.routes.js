let { Router } = require('express');
let router = Router();
let Produce = require('../../models/produce.model');

/**
 * @openapi
 * /api/v1/produce/:id:
 *   delete:
 *     description: Delete an existing product.
 *     tags: [Produce]
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: The produce id.
 *         type: string
 *     responses:
 *       200:
 *         description: Returns "success" or error message.
 *       401:
 *         description: Returns "Unauthorized".
 */
router.delete('/:id', async (request, response) => {
  let { params } = request;

  try {
    await Produce.deleteOne({ _id: params.id });

    return response.status(200).send('success');
  } catch (error) {
    return response
      .status(200)
      .json({ message: 'Error while deleting a produce.', error });
  }
});

module.exports = router;
