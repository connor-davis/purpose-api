let {Router} = require('express');
let {writeTransaction} = require('../../utils/neo4j');
let {CREATE_PRODUCT, UPDATE_PRODUCT} = require("../../queries/productQuerys");
let {v4} = require("uuid");
let router = Router();

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
router.post('/', async (request, response) => {
    let {body} = request;

    await writeTransaction(UPDATE_PRODUCT(body), (error, result) => {
        if (error)
            return response
                .status(200)
                .json({message: 'Error while updating a product.', error});
        else {
            let record = result.records[0];
            let data = record.get("product");

            return response.status(200).json({data});
        }
    });
});

module.exports = router;
