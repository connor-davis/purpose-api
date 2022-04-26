let { Router } = require('express');
let { writeTransaction } = require('../../utils/neo4j');
let { DELETE_PRODUCT } = require('../../queries/productQuerys');
const { DELETE_SALE } = require('../../queries/salesQuerys');
let router = Router();

/**
 * @openapi
 * /api/v1/sales:
 *   delete:
 *     description: Delete an existing sale.
 *     tags: [Sales]
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: The sales id.
 *         type: string
 *     responses:
 *       200:
 *         description: Returns "success" or error message.
 *       401:
 *         description: Returns "Unauthorized".
 */
router.delete('/:id', async (request, response) => {
  let { params } = request;

  await writeTransaction(DELETE_SALE(params.id), (error, result) => {
    if (error)
      return response
        .status(200)
        .json({ message: 'Error while deleting a sale.', error });
    else {
      return response.status(200).send('success');
    }
  });
});

module.exports = router;
