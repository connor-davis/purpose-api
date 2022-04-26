let neo4j = require('neo4j-driver');
let logger = require('./logger');

let neo4jUrl = process.env.NEO4J_URL;

let driver = neo4j.driver(
  neo4jUrl,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

logger.info(
  `Database - ${neo4jUrl} (${process.env.NEO4J_USER}:${process.env.NEO4J_PASSWORD})`
);

driver
  .verifyConnectivity({ database: 'neo4j' })
  .then((verified) => logger.info(JSON.stringify(verified)))
  .catch((error) => logger.error(JSON.stringify(error)));

let writeTransaction = async (query, callback) => {
  let session = driver.session({
    database: process.env.NEO4J_DATABASE,
    defaultAccessMode: neo4j.session.WRITE,
  });

  await session.writeTransaction((tx) =>
    query.data
      ? tx.run(query.statement, query.data).then(
          (success) => {
            callback(null, success);
          },
          (error) => {
            callback(error, null);
            console.log(error);
          }
        )
      : tx.run(query.statement).then(
          (success) => {
            callback(null, success);
          },
          (error) => {
            callback(error, null);
            console.log(error);
          }
        )
  );
};

let readTransaction = async (query, callback) => {
  let session = driver.session({
    database: process.env.NEO4J_DATABASE,
    defaultAccessMode: neo4j.session.WRITE,
  });

  await session.readTransaction((tx) =>
    query.data
      ? tx.run(query.statement, query.data).then(
          (success) => {
            callback(null, success);
          },
          (error) => callback(error, null)
        )
      : tx.run(query.statement).then(
          (success) => {
            callback(null, success);
          },
          (error) => callback(error, null)
        )
  );
};

module.exports = { writeTransaction, readTransaction };
