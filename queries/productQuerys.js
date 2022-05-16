module.exports = {
  /**
   * @param {String} id The id of the user to match the products and return them.
   * @returns {{statement}}
   */
  GET_PRODUCTS: (id) => {
    return {
      statement: `MATCH (user)-[:SELLS]->(product:Product) WHERE user.id = "${id}" RETURN apoc.map.removeKey(product {.*}, '') as product`,
    };
  },
  /**
   * @param id The id of the product we are looking for.
   *
   * @returns {{statement}}
   */
  GET_PRODUCT: (id) => {
    return {
      statement: `MATCH (product:Product) WHERE product.id = "${id}" WITH apoc.map.removeKey(product {.*}, '') as product RETURN product`,
    };
  },
  /**
   * @param {Object} data
   * @param {String} ownerId The id of the user who has the product.
   *
   * @param data.id The products id
   * @param data.name The products name
   * @param data.cost The products cost
   * @param data.price The products sale price
   *
   * @returns {{statement, data}}
   */
  CREATE_PRODUCT: (data, ownerId) => {
    return {
      statement: `
                MATCH (user:User {id: "${ownerId}"}) 
                WITH user
                CREATE (product:Product { id: $id, image: $image, name: $name, cost: $cost, price: $price })
                CREATE (user)-[:SELLS]->(product)
                WITH apoc.map.removeKey(product {.*}, '') as product
                RETURN product
            `,
      data,
    };
  },
  /**
   * @param {Object} data Data that needs to be added or updated to a user.
   *
   * @param data.id This value has to be passed.
   *
   * @returns {{statement}}
   */
  UPDATE_PRODUCT: (data) => {
    if (!data.id) throw 'Email is undefined for UPDATE_USER';

    let id = data.id;

    for (let key in data) {
      data[key] = `product.${key} = "${data[key]}"`;
    }

    let values = Object.values(data);

    return {
      statement: `MERGE (product:Product { id: "${id}" }) SET ${values.join(
        ', '
      )} WITH apoc.map.removeKey(product {.*}, '') as product RETURN product`,
    };
  },
  /**
   * @param id The id of the product that needs to be deleted.
   *
   * @returns {{statement}}
   */
  DELETE_PRODUCT: (id) => {
    if (!id) throw 'Id is undefined for DELETE_PRODUCT';

    return {
      statement: `MATCH (product:Product { id: "${id}" }) DETACH DELETE product`,
    };
  },
};
