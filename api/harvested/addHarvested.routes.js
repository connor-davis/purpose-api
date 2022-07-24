let { Router } = require('express');
let { writeTransaction } = require('../../utils/neo4j');
let { CREATE_PRODUCT } = require('../../queries/productQuerys');
let { v4 } = require('uuid');
const { CREATE_HARVESTED } = require('../../queries/ecd/ecdQuerys');
let router = Router();

/**
 * @openapi
 * /api/v1/harvests:
 *   post:
 *     description: Create a new harvests.
 *     tags: [Harvests]
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: date
 *         description: The harvest date.
 *         type: string
 *       - name: produce
 *         description: The harvests produce.
 *         type: string
 *       - yield:
 *         description: The harvests yield.
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

    await writeTransaction(
        CREATE_HARVESTED(
            {
                email: user.email,
                id,
                ...body,
            },
            user.id
        ),
        (error, result) => {
            if (error)
                return response
                    .status(200)
                    .json({ message: 'Error while adding a harvest.', error });
            else {
                let record = result.records[0];
                let data = record.get('harvested');

                return response.status(200).json({ data });
            }
        }
    );
});

module.exports = router;
