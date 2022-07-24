let { Router } = require('express');
let router = Router();
let passport = require('passport');
let { readTransaction } = require('../../../utils/neo4j');
let { GET_SALES, GET_ALL_SALES } = require('../../../queries/salesQuerys');
const { GET_ALL_HARVESTS } = require('../../../queries/ecd/ecdQuerys');

/**
 * @openapi
 * /api/v1/admin/ecd/harvests:
 *   get:
 *     description: Get a harvests.
 *     tags: [Admin]
 *     produces:
 *       - application/text
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Returns data.
 *       401:
 *         description: Returns "Unauthorized".
 */
router.get(
    '/harvests',
    passport.authenticate('jwt', { session: false }),
    async (request, response) => {
        let { user } = request;

        if (user.type !== 'admin') return response.status(401);

        await readTransaction(GET_ALL_HARVESTS(), (error, result) => {
            if (error)
                return response
                    .status(200)
                    .json({ message: 'Error while retrieving user data.', error });
            else {
                let data = result.records.map((record) => {
                    let harvested = record.get('harvested');

                    return { ...harvested };
                });

                return response.status(200).json({ data });
            }
        });
    }
);

module.exports = router;
