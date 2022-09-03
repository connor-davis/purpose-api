let { Router } = require('express');
let router = Router();
let Product = require('../../models/product.model');

/**
 * @openapi
 * /api/v1/products:
 *   put:
 *     description: Update an existing product.
 *     tags: [Products]
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: The id of the product.
 *     responses:
 *       200:
 *         description: Returns data or error message.
 *       401:
 *         description: Returns "Unauthorized".
 */
router.put('/', async (request, response) => {
  let { body } = request;

  try {
    await Product.updateOne({ _id: body.id }, body);

    const found = await Product.findOne({ _id: body.id });
    const data = found.toJSON();

    return response.status(200).json({ data });
  } catch (error) {
    console.log(error);

    return response
      .status(200)
      .json({ message: 'Error while updating a product.', error });
  }
});

module.exports = router;
