let { Router } = require('express');
let router = Router();
let bcrypt = require('bcrypt');
let jwt = require('jsonwebtoken');
let fs = require('fs');
let { readTransaction, writeTransaction } = require('../../utils/neo4j');
let { GET_USER, UPDATE_USER } = require('../../queries/userQuerys');

/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     description: Login an existing user.
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
 *         description: Returns the users email and their auth token if the passwords match.
 */
router.post('/', async (request, response) => {
  let { body } = request;

  let privateKey = fs.readFileSync('certs/privateKey.pem', {
    encoding: 'utf-8',
  });

  await readTransaction(
    GET_USER({ email: body.email }, false),
    (error, result) => {
      if (error)
        return response
          .status(500)
          .json({ message: 'Error while checking if passwords match.', error });
      else {
        let record = result.records[0];
        let data = record.get('user');

        if (data.email === 'admin@purposeapp') data.type = 'admin';

        if (bcrypt.compareSync(body.password, data.password)) {
          writeTransaction(
            UPDATE_USER({
              email: data.email,
              lastLogin: Date.now(),
              type: data.type,
            }),
            (error, result) => {
              if (error) {
                return response
                  .status(200)
                  .json({ message: 'Error while logging user in.', error });
              } else {
                let record = result.records[0];
                let data = record.get('user');

                let token = jwt.sign(
                  {
                    sub: data.id,
                    email: data.email,
                  },
                  privateKey,
                  { expiresIn: '1d', algorithm: 'RS256' }
                );

                return response.status(200).json({
                  message: 'Successfully logged in.',
                  data: {
                    ...data,
                    authenticationToken: token,
                  },
                });
              }
            }
          );
        } else
          return response.status(200).json({
            message: 'Incorrect password.',
            error: 'invalid-password',
          });
      }
    }
  );
});

module.exports = router;
