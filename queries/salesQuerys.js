module.exports = {
  /**
   * @returns {{statement}}
   */
  GET_ALL_SALES: () => {
    return {
      statement: `MATCH (sale:Sale) WITH sale MATCH (sale)-[:SALE_PRODUCT]->(product:Product) WITH sale, product RETURN apoc.map.removeKey(sale {.*}, '') as sale, apoc.map.removeKey(product {.*}, '') as product`,
    };
  },
  /**
   * @param {String} id The id of the user to match the userData and return them.
   * @returns {{statement}}
   */
  GET_SALES: (id) => {
    return {
      statement: `MATCH (user)-[:USER_SALE]->(sale:Sale) WHERE user.id = "${id}" WITH sale MATCH (sale)-[:SALE_PRODUCT]->(product:Product) WITH sale, product RETURN apoc.map.removeKey(sale {.*}, '') as sale, apoc.map.removeKey(product {.*}, '') as product`,
    };
  },
  /**
   * @param id The id of the sale we are looking for.
   *
   * @returns {{statement}}
   */
  GET_SALE: (id) => {
    return {
      statement: `MATCH (sale:Sale) WHERE sale.id = "${id}" WITH sale MATCH (sale)-[:SALE_PRODUCT]->(product:Product) WITH sale, product RETURN apoc.map.removeKey(sale {.*}, '') as sale, apoc.map.removeKey(product {.*}, '') as product`,
    };
  },
  /**
   * @param {Object} data
   * @param {String} ownerId The id of the user who has the product.
   *
   * @param data.id The userData id
   * @param data.date The data of the sale
   * @param data.product The userData product
   * @param data.numberSold The userData number sold
   * @param data.profit The userData sale profit
   *
   * @returns {{statement, data}}
   */
  CREATE_SALE: (data, ownerId) => {
    return {
      statement: `
                MATCH (user:User {id: "${ownerId}"})
                MATCH (product:Product {id: "${data.product.id}"})
                WITH user, product
                CREATE (sale:Sale { id: $id, date: $date, numberSold: $numberSold, profit: $profit })
                CREATE (sale)-[:SALE_PRODUCT]->(product)
                CREATE (user)-[:USER_SALE]->(sale)
                RETURN apoc.map.removeKey(sale {.*}, '') as sale, apoc.map.removeKey(product {.*}, '') as product
            `,
      data,
    };
  },
  /**
   * @param id The id of the sale that needs to be deleted.
   *
   * @returns {{statement}}
   */
  DELETE_SALE: (id) => {
    if (!id) throw 'Id is undefined for DELETE_SALE';

    return {
      statement: `MATCH (sale:Sale { id: "${id}" }) DETACH DELETE sale`,
    };
  },
};
