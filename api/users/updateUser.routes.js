let { Router } = require('express');
const { UPDATE_USER } = require('../../queries/userQuerys');
const { writeTransaction } = require('../../utils/neo4j');
let router = Router();

/**
 * @openapi
 * /api/v1/users:
 *   put:
 *     description: Update an existing user.
 *     tags: [Users]
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: email
 *         description: The user's email.
 *         type: string
 *     responses:
 *       200:
 *         description: Returns the users updated data.
 *       401:
 *         description: Returns "Unauthorized".
 */
router.put('/', async (request, response) => {
  let { body, user } = request;

  writeTransaction(
    UPDATE_USER({ ...body, email: body.email || user.email }),
    (error, result) => {
      if (error)
        return response
          .status(200)
          .json({ message: 'Error while updating a user.', error });
      else {
        let record = result.records[0];
        let data = record.get("user");

        return response.status(200).json({ data });
      }
    }
  );
});

module.exports = router;
