let { Router } = require('express');
let router = Router();
let Product = require("../../models/product.model");

/**
 * @openapi
 * /api/v1/products:
 *   post:
 *     description: Create a new product.
 *     tags: [Products]
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: image
 *         description: The products image.
 *         type: string
 *       - name: name
 *         description: The products name.
 *         type: string
 *       - name: cost
 *         description: The products cost.
 *         type: number
 *       - name: price
 *         description: The products price.
 *         type: number
 *     responses:
 *       200:
 *         description: Returns data or error message.
 *       401:
 *         description: Returns "Unauthorized".
 */
router.post('/', async (request, response) => {
  let { body, user } = request;

  const newProduct = new Product({
    owner: user._id,
    image: body.image || "",
    name: body.name,
    cost: parseFloat(body.cost),
    price: parseFloat(body.price)
  });

  try {
    newProduct.save();

    const data = newProduct.toJSON();

    return response.status(200).json({ data });
  } catch (error) {
    return response
          .status(200)
          .json({ message: 'Error while adding a product.', error });
  }
});

module.exports = router;
