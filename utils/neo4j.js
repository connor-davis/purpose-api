let neo4j = require('neo4j-driver');

let neo4jUrl = process.env.NEO4J_URL;

let driver = neo4j.driver(
  neo4jUrl,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

let writeTransaction = async (query, callback) => {
  let session = driver.session({
    database: process.env.NEO4J_DATABASE,
    defaultAccessMode: neo4j.session.WRITE,
  });

  try {
    let result = await session.writeTransaction((tx) =>
      tx.run(query.statement, query.data)
    );

    callback(null, result);
  } catch (error) {
    callback(error, null);
  }
};

let readTransaction = async (query, callback) => {
  let session = driver.session({
    database: process.env.NEO4J_DATABASE,
    defaultAccessMode: neo4j.session.WRITE,
  });

  try {
    let result = await session.readTransaction((tx) => tx.run(query.statement, query.data));

    callback(null, result);
  } catch (error) {
    callback(error, null);
  }
};

module.exports = { writeTransaction, readTransaction };
