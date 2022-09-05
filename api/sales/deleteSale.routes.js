let { Router } = require('express');
let router = Router();
let Sale = require("../../models/sale.model");

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
 *         description: The userData id.
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
    await Sale.deleteOne({ _id: params.id });

    return response.status(200).send("success");
  } catch (error) {
    return response.status(200).json({ message: "Error while deleting a sale.", error });
  }
});

module.exports = router;
