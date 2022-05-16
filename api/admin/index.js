let { Router } = require('express');
let router = Router();
let passport = require('passport');

const { readTransaction } = require('../../utils/neo4j');
const { GET_USERS, GET_USER } = require('../../queries/userQuerys');

/**
 * @openapi
 * /api/v1/users:
 *   get:
 *     description: Get all users.
 *     tags: [Admin]
 *     produces:
 *       - application/text
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Returns "Authorized".
 *       401:
 *         description: Returns "Unauthorized".
 */
router.get(
  '/users',
  passport.authenticate('jwt', { session: false }),
  async (request, response) => {
    let { user } = request;

    if (user.type !== 'admin') return response.status(401);

    await readTransaction(GET_USERS(), (error, result) => {
      if (error)
        return response
          .status(200)
          .json({ message: 'Error while retrieving users.', error });
      else {
        let records = result.records;
        let data = records
          .map((record) => {
            return record.get('user');
          })
          .filter((user) => user.type !== 'admin');

        return response.status(200).json({ data });
      }
    });
  }
);

/**
 * @openapi
 * /api/v1/users/:id:
 *   get:
 *     description: Get a specific user.
 *     tags: [Admin]
 *     produces:
 *       - application/text
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Returns "Authorized".
 *       401:
 *         description: Returns "Unauthorized".
 */
router.get(
  '/users/:id',
  passport.authenticate('jwt', { session: false }),
  async (request, response) => {
    let { user } = request;
    let { id } = request.params;

    if (user.type !== 'admin') return response.status(401);

    await readTransaction(GET_USER({ id }), (error, result) => {
      if (error)
        return response
          .status(200)
          .json({ message: 'Error while retrieving user data.', error });
      else {
        let record = result.records[0];
        let data = record.get('user');

        return response.status(200).json({ data });
      }
    });
  }
);

router.use('/users/sales', require('./userData/sales'));
router.use('/users/products', require('./userData/products'));

module.exports = router;
