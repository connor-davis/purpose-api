let { Router } = require('express');
let router = Router();
let Sale = require('../../models/sale.model');
let Product = require('../../models/product.model');
const moment = require('moment');

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
  let { body, user } = request;

  if (!body.date) body.date = Date.now();

  console.log(moment(body.date).format("DD/MM/YYYY"));

  let data = {
    id: body._id,
    owner: user.email,
    date: body.date,
    product: body.product,
    numberSold: parseInt(body.numberSold),
    profit: parseFloat(body.profit),
  };

  Sale.updateOne({ _id: body._id }, data)
    .then(() => {
      return response.status(200).json({ data });
    })
    .catch((error) => {
      return response
        .status(200)
        .json({ message: 'Error while updating a sale.', error });
    });
});

module.exports = router;
