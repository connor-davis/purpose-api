let { Router } = require('express');
let router = Router();
let passport = require('passport');

let createHarvestedRoutes = require("./addHarvested.routes");
let deleteHarvestedRoutes = require("./removeHarvested.routes");
let { readTransaction } = require('../../utils/neo4j');
const { GET_HARVESTED, GET_ALL_HARVESTED, GET_ALL_HARVESTED_USER } = require('../../queries/ecd/ecdQuerys');

/**
 * @openapi
 * /api/v1/harvests:
 *   get:
 *     description: Retrieve the users harvests
 *     tags: [Harvests]
 *     produces:
 *       - application/json
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Returns the users harvests.
 *       401:
 *         description: Returns "Unauthorized".
 */
router.get(
    '/',
    passport.authenticate('jwt', { session: false }),
    async (request, response) => {
        let { user } = request;

        await readTransaction(GET_ALL_HARVESTED_USER(user.id), (error, result) => {
            if (error)
                return response
                    .status(200)
                    .json({ message: 'Error while retrieving user harvests.', error });
            else {
                let records = result.records;
                let data = records.map((record) => record.get('harvested'));

                return response.status(200).json({ data });
            }
        });
    }
);

/**
 * @openapi
 * /api/v1/harvests/:id:
 *   get:
 *     description: Retrieve a harvest with id :id
 *     tags: [Harvests]
 *     produces:
 *       - application/json
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Returns the harvest with id :id.
 *       401:
 *         description: Returns "Unauthorized".
 */
router.get(
    '/:id',
    passport.authenticate('jwt', { session: false }),
    async (request, response) => {
        let { params } = request;

        await readTransaction(GET_HARVESTED(params.id), (error, result) => {
            if (error)
                return response
                    .status(200)
                    .json({ message: 'Error while retrieving user harvest.', error });
            else {
                let record = result.records[0];

                if (record) {
                    let data = record.get('harvested');

                    return response.status(200).json({ data });
                } else
                    return response.status(200).json({
                        message: 'Harvest not found.',
                        error: 'harvest-not-found',
                    });
            }
        });
    }
);

router.use(
    '/',
    passport.authenticate('jwt', { session: false }),
    createHarvestedRoutes
);
router.use(
    '/',
    passport.authenticate('jwt', { session: false }),
    deleteHarvestedRoutes
);

module.exports = router;
