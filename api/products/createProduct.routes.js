let {Router} = require('express');
let {writeTransaction} = require('../../utils/neo4j');
let {CREATE_PRODUCT} = require("../../queries/productQuerys");
let {v4} = require("uuid");
let router = Router();

/**
 * @openapi
 * /api/v1/products:
 *   post:
 *     description: Create a new product.
 *     tags: [Products]
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: name
 *         description: The products name.
 *         type: string
 *       - name: description
 *         description: The products description.
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
    let {body, user} = request;

    let id = v4();

    await writeTransaction(CREATE_PRODUCT({
        id,
        name: body.name,
        description: body.description,
        cost: body.cost,
        price: body.price
    }, user.id), (error, result) => {
        if (error)
            return response
                .status(200)
                .json({message: 'Error while deleting a user.', error});
        else {
            let record = result.records[0];
            let data = record.get("product");

            return response.status(200).json({data});
        }
    });
});

module.exports = router;
