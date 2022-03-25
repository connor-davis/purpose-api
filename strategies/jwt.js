let Strategy = require('passport-jwt').Strategy,
  ExtractJwt = require('passport-jwt').ExtractJwt;
let fs = require('fs');
let { GET_USER } = require('../queries/userQuerys');
let { readTransaction } = require('../utils/neo4j');

let pubKey = fs.readFileSync('certs/publicKey.pem', {
  encoding: 'utf8',
});

let options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: pubKey,
  algorithms: ['RS256'],
};

module.exports = new Strategy(options, async (payload, done) => {
  readTransaction(GET_USER({ id: payload.sub }), (error, result) => {
    let record = result.records[0];
    let data = {
      id: record.get(0),
      email: record.get(1),
    };

    if (error) {
      return done(error, null);
    }

    if (data) {
      return done(null, data);
    } else {
      return done('no-user', null);
    }
  });
});
