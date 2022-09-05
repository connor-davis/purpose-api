let { Router } = require('express');
let router = Router();
let Sale = require('../../models/sale.model');
let Product = require('../../models/product.model');

/**
 * @openapi
 * /api/v1/sales:
 *   put:
 *     description: Update an existing sale.
 *     tags: [Sales]
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: The id of the sale.
 *     responses:
 *       200:
 *         description: Returns data or error message.
 *       401:
 *         description: Returns "Unauthorized".
 */
router.put('/', async (request, response) => {
  let { body } = request;

  if (!body.date) body.date = Date.now();

  try {
    let data = {
      owner: user.email,
      date: body.date,
      product: body.product,
      numberSold: body.numberSold,
      profit: body.profit,
    };

    await Sale.updateOne({ _id: body.id }, data);

    const product = await Product.findOne({ _id: body.product });

    data.product = product.toJSON();

    return response.status(200).json({ data });
  } catch (error) {
    return response
      .status(200)
      .json({ message: 'Error while updating a sale.', error });
  }
});

module.exports = router;
