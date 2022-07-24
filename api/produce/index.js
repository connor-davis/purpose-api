let { Router } = require('express');
let router = Router();
let passport = require('passport');

let createProduceRoutes = require("./addProduce.routes");
let deleteProduceRoutes = require("./removeProduce.routes");
let { readTransaction } = require('../../utils/neo4j');
const { GET_ALL_PRODUCE, GET_PRODUCE, GET_ALL_PRODUCE_USER } = require('../../queries/ecd/ecdQuerys');

/**
 * @openapi
 * /api/v1/produce:
 *   get:
 *     description: Retrieve the users produce
 *     tags: [Produce]
 *     produces:
 *       - application/json
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Returns the users produce.
 *       401:
 *         description: Returns "Unauthorized".
 */
router.get(
    '/',
    passport.authenticate('jwt', { session: false }),
    async (request, response) => {
        let { user } = request;

        await readTransaction(GET_ALL_PRODUCE_USER(user.id), (error, result) => {
            if (error)
                return response
                    .status(200)
                    .json({ message: 'Error while retrieving user produce.', error });
            else {
                let records = result.records;
                let data = records.map((record) => record.get('produce'));

                return response.status(200).json({ data });
            }
        });
    }
);

/**
 * @openapi
 * /api/v1/produce/:id:
 *   get:
 *     description: Retrieve a produce with id :id
 *     tags: [Produce]
 *     produces:
 *       - application/json
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Returns the produce with id :id.
 *       401:
 *         description: Returns "Unauthorized".
 */
router.get(
    '/:id',
    passport.authenticate('jwt', { session: false }),
    async (request, response) => {
        let { params } = request;

        await readTransaction(GET_PRODUCE(params.id), (error, result) => {
            if (error)
                return response
                    .status(200)
                    .json({ message: 'Error while retrieving user produce.', error });
            else {
                let record = result.records[0];

                if (record) {
                    let data = record.get('produce');

                    return response.status(200).json({ data });
                } else
                    return response.status(200).json({
                        message: 'Produce not found.',
                        error: 'produce-not-found',
                    });
            }
        });
    }
);

router.use(
    '/',
    passport.authenticate('jwt', { session: false }),
    createProduceRoutes
);
router.use(
    '/',
    passport.authenticate('jwt', { session: false }),
    deleteProduceRoutes
);

module.exports = router;
