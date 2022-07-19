let { Router } = require('express');
let { writeTransaction } = require('../../utils/neo4j');
let { CREATE_PRODUCT } = require('../../queries/productQuerys');
let { v4 } = require('uuid');
const { CREATE_PRODUCE } = require('../../queries/ecdQuerys');
let router = Router();

/**
 * @openapi
 * /api/v1/produce:
 *   post:
 *     description: Create a new produce.
 *     tags: [Produce]
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: image
 *         description: The products image.
 *         type: string
 *       - name: name
 *         description: The products name.
 *         type: string
 *     responses:
 *       200:
 *         description: Returns data or error message.
 *       401:
 *         description: Returns "Unauthorized".
 */
router.post('/', async (request, response) => {
    let { body, user } = request;

    let id = v4();

    await writeTransaction(
        CREATE_PRODUCE(
            {
                id,
                ...body,
            },
            user.id
        ),
        (error, result) => {
            if (error)
                return response
                    .status(200)
                    .json({ message: 'Error while adding a produce.', error });
            else {
                let record = result.records[0];
                let data = record.get('produce');

                return response.status(200).json({ data });
            }
        }
    );
});

module.exports = router;
