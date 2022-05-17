let { Router } = require('express');
let router = Router();
let fs = require('fs');
let path = require('path');
let bcrypt = require('bcrypt');
let passport = require('passport');
let { GET_USER, UPDATE_USER } = require('../../queries/userQuerys');
let { readTransaction, writeTransaction } = require('../../utils/neo4j');
let crypto = require('crypto-js');

/**
 * @openapi
 * /api/v1/passwordReset/:
 *   post:
 *     description: Reset a users password in the database.
 *     tags: [User]
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
router.post('/', async (request, response) => {
  let { newPassword, token } = request.body;

  let hash = '#';
  let regex = new RegExp(hash, 'g');

  token = token.replace(regex, '/');

  let decryptTokenBytes = crypto.AES.decrypt(
    token,
    fs.readFileSync(path.join(process.cwd(), 'certs', 'privateKey.pem'), {
      encoding: 'utf-8',
    })
  );
  let email = decryptTokenBytes.toString(crypto.enc.Utf8);

  if (!fs.existsSync(path.join(process.cwd(), 'temp', email + '-pwrs.txt')))
    return response.status(401).send('Unauthorized');

  let password = bcrypt.hashSync(newPassword, 2048);

  await writeTransaction(
    UPDATE_USER({ email, password }),
    async (error, result) => {
      if (error)
        return response
          .status(200)
          .json({ error, message: 'Failed to reset password.' });
      else {
        fs.unlinkSync(path.join(process.cwd(), 'temp', email + '-pwrs.txt'));

        return response
          .status(200)
          .json({ success: 'Reset password successfully.' });
      }
    }
  );
});

/**
 * @openapi
 * /api/v1/passwordReset/:id:
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
  '/:id',
  passport.authenticate('jwt', { session: false }),
  async (request, response) => {
    let { user } = request;
    let { id } = request.params;

    if (user.type !== 'admin') return response.status(401);

    await readTransaction(GET_USER({ id }), async (error, result) => {
      if (error)
        return response
          .status(200)
          .json({ message: 'Error while retrieving user.', error });
      else {
        let record = result.records[0];
        let data = record.get('user');

        if (!fs.existsSync(path.join(process.cwd(), 'temp')))
          fs.mkdirSync(path.join(process.cwd(), 'temp'));

        let tokenGen = crypto.AES.encrypt(
          data.email,
          fs.readFileSync(path.join(process.cwd(), 'certs', 'privateKey.pem'), {
            encoding: 'utf-8',
          })
        ).toString();

        let slash = '/';
        let regex = new RegExp(slash, 'g');

        tokenGen = tokenGen.replace(regex, '#');

        let passwordResetData = {
          token: tokenGen,
          user: data,
        };

        fs.writeFileSync(
          path.join(process.cwd(), 'temp', data.email + '-pwrs.txt'),
          JSON.stringify(passwordResetData),
          { encoding: 'utf-8' }
        );

        return response.status(200).json({
          data: {
            link:
              'https://purpose.lone-wolf.software/reset/' +
              passwordResetData.token,
          },
        });
      }
    });
  }
);

module.exports = router;
