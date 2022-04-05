let {Router} = require('express');
let {writeTransaction} = require('../../utils/neo4j');
let {DELETE_PRODUCT} = require("../../queries/productQuerys");
let router = Router();

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
    let {params} = request;

    await writeTransaction(DELETE_PRODUCT(params.id), (error, result) => {
        if (error)
            return response
                .status(200)
                .json({message: 'Error while deleting a user.', error});
        else {
            return response.status(200).send("success");
        }
    });
});

module.exports = router;
