'use strict';
let dotenv = require('dotenv');
dotenv.config();

let logger = require('./utils/logger');
let express = require('express');
let app = express();
let fs = require('fs');
let path = require('path');
let http = require('http').createServer(app);
let devmode = process.env.DEV_MODE === 'true';
let https;
let compression = require('compression');
let cors = require('cors');
let { json, urlencoded } = require('body-parser');
let passport = require('passport');
let JwtStrategy = require('./strategies/jwt');
let session = require('express-session');
let swaggerJsdoc = require('swagger-jsdoc');
let swaggerUi = require('swagger-ui-express');
let morgan = require('morgan');
let chalk = require('chalk');
let { readTransaction, writeTransaction } = require('./utils/neo4j');
let { GET_USER, CREATE_USER } = require('./queries/userQuerys');
let io = require('socket.io')(http, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});
let apiRoutes = require('./api');
let { v4 } = require('uuid');
let bcrypt = require('bcrypt');
const { ADD_ANNOUNCEMENT } = require('./queries/announcementQueries');

let secure_port = process.env.HTTP_SECURE_PORT || 443;
let port = process.env.HTTP_PORT || 80;

(async () => {
  logger.success(`OP MODE: ${devmode ? 'DEV' : 'PROD'}`);

  await readTransaction(
    GET_USER({ email: 'admin@purposeapp' }),
    async (error, result) => {
      if (error) return console.log(error);
      else {
        let adminUser = result.records[0];

        if (!adminUser) {
          logger.warning('Admin user does not exist, creating them now.');

          await writeTransaction(
            CREATE_USER({
              id: v4(),
              email: 'admin@purposeapp',
              password: bcrypt.hashSync(process.env.ROOT_PASSWORD, 2048),
              type: 'admin',
            }),
            async (error, result) => {
              if (error) return logger.error(error);
              else return logger.success('Created admin user.');
            }
          );
        }
      }
    }
  );

  if (!devmode) {
    https = require('https').createServer(
      {
        cert: fs.readFileSync(process.env.CERTPATH + '/fullchain.pem'),
        key: fs.readFileSync(process.env.CERTPATH + '/privkey.pem'),
      },
      app
    );
  }

  let options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Api (v1)',
        version: '1.0.0',
      },
    },
    apis: ['./api/**/*.js'],
  };

  let openapiSpecification = swaggerJsdoc(options);

  let morganMiddleware = morgan(function (tokens, req, res) {
    return [
      chalk.hex('#c7e057').bold(tokens.method(req, res) + '\t'),
      chalk.hex('#ffffff').bold(tokens.status(req, res) + '\t'),
      chalk.hex('#262626').bold(tokens.url(req, res) + '\t\t\t'),
      chalk.hex('#c7e057').bold(tokens['response-time'](req, res) + ' ms'),
    ].join(' ');
  });

  app.use(morganMiddleware);
  app.use(
    cors({
      origin: [
        'https://purpose360.co.za',
        'https://purpose.lone-wolf.software',
        'http://localhost:3000',
      ],
    })
  );
  app.use(compression());
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: false }));
  app.use(session({ secret: process.env.ROOT_PASSWORD }));
  app.use(passport.initialize());
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'ejs');
  app.use(express.static(__dirname + '/public'));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    await readTransaction(GET_USER({ id }, true), (error, result) => {
      let record = result.records[0];
      let data = record.get('user');

      return done(null, data);
    });
  });

  passport.use('jwt', JwtStrategy);

  app.use('/api/v1', apiRoutes);
  app.use(
    '/api/v1/docs',
    swaggerUi.serve,
    swaggerUi.setup(openapiSpecification)
  );

  app.get('/', async (request, response) => {
    response.render('pages/welcome');
  });

  app.get('/visualize', async (request, response) => {
    response.render('pages/visualize');
  });

  app.get('/**', async (request, response) => {
    response.render('pages/404.ejs');
  });

  io.on('connection', (socket) => {
    logger.success('a user connected to socket io');

    socket.on('announcement', (data) => {
      let announcement = {
        announcementTitle: data.data.announcementTitle,
        announcementBody: data.data.announcementBody,
        id: v4(),
      };

      writeTransaction(ADD_ANNOUNCEMENT(announcement), (error, result) => {});

      socket.broadcast.emit('announcement', announcement);
    });
  });

  http.listen(port, () =>
    logger.success(`HTTP listening on http://localhost:${port}`)
  );

  if (!devmode) {
    https.listen(secure_port, () =>
      logger.success(`HTTPS listening on https://localhost:${secure_port}`)
    );
  }
})();
