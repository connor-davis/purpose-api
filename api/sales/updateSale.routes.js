let { Router } = require('express');
let { writeTransaction } = require('../../utils/neo4j');
let { CREATE_PRODUCT, UPDATE_PRODUCT } = require('../../queries/productQuerys');
let { v4 } = require('uuid');
const {
  UPDATE_SALE,
  DELETE_SALE,
  CREATE_SALE,
} = require('../../queries/salesQuerys');
let router = Router();

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

  body.industry = request.user.type;

  await writeTransaction(DELETE_SALE(body.id), async (error, result) => {
    if (error)
      return response
        .status(200)
        .json({ message: 'Error while updating a sale.', error });
    else {
      await writeTransaction(
        CREATE_SALE(body, request.user.id),
        (error, result) => {
          if (error)
            return response
              .status(200)
              .json({ message: 'Error while updating a sale.', error });
          else {
            let record = result.records[0];
            let data = {
              ...record.get('sale'),
              product: record.get('product'),
            };

            return response.status(200).json({ data });
          }
        }
      );
    }
  });
});

module.exports = router;
