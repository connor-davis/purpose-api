let { Router } = require('express');
let router = Router();
let uuid = require('uuid');
let bcrypt = require('bcrypt');
let jwt = require('jsonwebtoken');
let fs = require('fs');
let User = require("../../models/user.model");

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

  const found = await User.findOne({ email: data.email });

  if (found)
    return response.status(500).json({
      message: 'Email already in use. Please use a different email.',
    });
  else {
    const newUser = new User({
      email: data.email,
      password: data.password,
      agreedToTerms: true,
      completedProfile: false,
    });

    try {
      newUser.save();

      const data = newUser.toJSON();

      response.status(200).json({
        message: 'Successfully registered new user.',
        data: {
          ...data,
          password: undefined,
          authenticationToken: token,
        },
      });
    } catch (error) {
      return response
        .status(500)
        .json({ message: 'Error while registering a new user.', error });
    }
  }
});

module.exports = router;
