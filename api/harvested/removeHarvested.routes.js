let { Router } = require('express');
let { writeTransaction } = require('../../utils/neo4j');
let { DELETE_HARVESTED } = require('../../queries/ecd/ecdQuerys');
let router = Router();

/**
 * @openapi
 * /api/v1/harvests/:id:
 *   delete:
 *     description: Delete an existing product.
 *     tags: [Harvests]
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: The harvest id.
 *         type: string
 *     responses:
 *       200:
 *         description: Returns "success" or error message.
 *       401:
 *         description: Returns "Unauthorized".
 */
router.delete('/:id', async (request, response) => {
    let { params } = request;

    await writeTransaction(DELETE_HARVESTED(params.id), (error, result) => {
        if (error)
            return response
                .status(200)
                .json({ message: 'Error while deleting a harvest.', error });
        else {
            return response.status(200).send("success");
        }
    });
});

module.exports = router;
