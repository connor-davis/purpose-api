let { Router } = require('express');
let router = Router();
let Harvest = require('../../models/harvest.model');

/**
 * @openapi
 * /api/v1/harvests/:id:
 *   delete:
 *     description: Delete an existing product.
 *     tags: [Harvests]
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: The harvest id.
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
    await Harvest.deleteOne({ _id: params.id });

    return response.status(200).send('success');
  } catch (error) {
    return response
      .status(200)
      .json({ message: 'Error while deleting a harvest.', error });
  }
});

module.exports = router;
