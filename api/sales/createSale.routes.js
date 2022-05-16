let { Router } = require('express');
let { writeTransaction } = require('../../utils/neo4j');
let { v4 } = require('uuid');
let { CREATE_SALE } = require('../../queries/salesQuerys');
let router = Router();

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

  let id = v4();
  let date = Date.now();

  try {
    await writeTransaction(
      CREATE_SALE(
        {
          id,
          date,
          ...body,
        },
        user.id
      ),
      (error, result) => {
        if (error)
          return response
            .status(200)
            .json({ message: 'Error while adding a sale.', error });
        else {
          let record = result.records[0];
          let data = { ...record.get('sale'), product: record.get('product') };

          return response.status(200).json({ data });
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
