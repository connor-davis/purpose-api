let { Router } = require('express');
let router = Router();
let Sale = require('../../models/sale.model');

/**
 * @openapi
 * /api/v1/sales:
 *   post:
 *     description: Create a new sale.
 *     tags: [Sales]
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: product
 *         description: The userData product.
 *         type: object
 *       - name: numberSold
 *         description: The userData number sold.
 *         type: number
 *       - name: profit
 *         description: The userData profit.
 *         type: number
 *     responses:
 *       200:
 *         description: Returns data or error message.
 *       401:
 *         description: Returns "Unauthorized".
 */
router.post('/', async (request, response) => {
  let { body, user } = request;

  if (!body.date) body.date = Date.now();

  let data = {
    owner: user.email,
    date: body.date,
    product: body.product,
    numberSold: parseInt(body.numberSold),
    profit: parseFloat(body.profit),
  };

  const newSale = new Sale(data);

  try {
    await newSale.save();

    return response.status(200).json({ data });
  } catch (error) {
    return response
      .status(200)
      .json({ message: 'Unable to create a new sale.', error });
  }
});

module.exports = router;
