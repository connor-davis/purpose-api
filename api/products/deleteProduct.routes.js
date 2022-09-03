let { Router } = require('express');
let router = Router();
let Product = require('../../models/product.model');

/**
 * @openapi
 * /api/v1/products:
 *   delete:
 *     description: Delete an existing product.
 *     tags: [Products]
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: The products id.
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
    await Product.deleteOne({ _id: params.id });

    return response.status(200).send('success');
  } catch (error) {
    return response
      .status(200)
      .json({ message: 'Error while deleting a product.', error });
  }
});

module.exports = router;
