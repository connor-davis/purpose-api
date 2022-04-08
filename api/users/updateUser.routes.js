let { Router } = require('express');
let { UPDATE_USER } = require('../../queries/userQuerys');
let { writeTransaction } = require('../../utils/neo4j');
let router = Router();
let logger = require('../../utils/logger');

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

  await writeTransaction(
    UPDATE_USER({ ...body, email: body.email || user.email }, true),
    (error, result) => {
      if (error)
        return response
          .status(200)
          .json({ message: 'Error while updating a user.', error });
      else {
        let record = result.records[0];
        let data = {};

        record.keys.forEach((key) => (data[key] = record.get(key)));

        return response.status(200).json({ data });
      }
    }
  );
});

module.exports = router;
