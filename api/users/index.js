let { Router } = require('express');
let router = Router();
let passport = require('passport');
let { GET_USER } = require('../../queries/userQuerys');
let { readTransaction } = require('../../utils/neo4j');

let updateUserRoutes = require("./updateUser.routes");

/**
 * @openapi
 * /api/v1/users:
 *   get:
 *     description: Retrieve the users data.
 *     tags: [Users]
 *     produces:
 *       - application/text
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Returns the users data.
 *       401:
 *         description: Returns "Unauthorized".
 */
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  async (request, response) => {
    await readTransaction(
      GET_USER({ email: request.user.email }),
      (error, result) => {
        if (error)
          return response
            .status(200)
            .json({ message: 'Error while retrieving user data.', error });
        else {
          let record = result.records[0];

          let data = record.get("user");

          return response.status(200).json({ data });
        }
      }
    );
  }
);

router.use("/", passport.authenticate("jwt", { session: false }), updateUserRoutes);

module.exports = router;
