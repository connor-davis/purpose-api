let { Router } = require('express');
let router = Router();
let uuid = require('uuid');
let bcrypt = require('bcrypt');
let jwt = require('jsonwebtoken');
let fs = require('fs');
let { writeTransaction } = require('../../utils/neo4j');
let { CREATE_USER } = require('../../queries/userQuerys');

/**
 * @openapi
 * /api/v1/auth/register:
 *   post:
 *     description: Register a new user.
 *     tags: [Authentication]
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: email
 *         description: The user's email.
 *         type: string
 *       - name: password
 *         description: The user's password.
 *         type: string
 *     responses:
 *       200:
 *         description: Returns the users data and their auth token if the email isn't being used.
 */
router.post('/', async (request, response) => {
  let { body } = request;

  let privateKey = fs.readFileSync('certs/privateKey.pem', {
    encoding: 'utf-8',
  });

  let data = {
    id: uuid.v4(),
    email: body.email,
    password: bcrypt.hashSync(body.password, 2048),
  };

  let token = jwt.sign(
    {
      sub: data.id,
      email: data.email,
    },
    privateKey,
    { expiresIn: '1d', algorithm: 'RS256' }
  );

  writeTransaction(CREATE_USER(data), (error, result) => {
    if (error)
      return response
        .status(500)
        .json({ message: 'Error while registering a new user.', error });
    else {
      let record = result.records[0];
      let data = record.get("user");

      return response.status(200).json({
        message: 'Successfully registered new user.',
        data: {
          ...data,
          password: undefined,
          authenticationToken: token,
        },
      });
    }
  });
});

module.exports = router;
