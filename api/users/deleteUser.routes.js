let {Router} = require('express');
let {DELETE_USER} = require('../../queries/userQuerys');
let {writeTransaction} = require('../../utils/neo4j');
let router = Router();

/**
 * @openapi
 * /api/v1/users:
 *   delete:
 *     description: Delete an existing user.
 *     tags: [Users]
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: email
 *         description: The user's email.
 *         type: string
 *     responses:
 *       200:
 *         description: Returns "success" or error message.
 *       401:
 *         description: Returns "Unauthorized".
 */
router.delete('/:email', async (request, response) => {
    let {params} = request;

    await writeTransaction(DELETE_USER(params.email), (error, result) => {
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
