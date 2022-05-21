module.exports = {
  /**
   * @returns {{statement}}
   */
  GET_USERS: () => {
    return {
      statement: `MATCH (user:User) WITH apoc.map.removeKey(user {.*}, 'password') as user RETURN user`,
    };
  },
  /**
   * @param {Object} data ```js
   * { email: 'test@test' } or { id: '12345abcdef' }
   * ```
   *
   * @param {Boolean} hidePassword Whether to hide the password from the record or not.
   * @returns {{statement, data}}
   */
  GET_USER: (data, hidePassword = true) => {
    return {
      statement: `MATCH (user:User) WHERE ${
        data.id ? 'user.id = $id' : 'user.email = $email'
      } ${
        hidePassword
          ? `WITH apoc.map.removeKey(user {.*}, 'password') as user`
          : `WITH apoc.map.removeKey(user {.*}, '') as user`
      } RETURN user`,
      data,
    };
  },
  /**
   * @param {String} id The users id
   * @param {Boolean} hidePassword Whether to hide the password from the record or not.
   * @returns {{statement, data}}
   */
  GET_USER_DATA: (id, hidePassword = true) => {
    return {
      statement: `MATCH (user:User { id: "${id}" })-[:USER_SALE]->(sale:Sale) WITH user, sale MATCH (sale)-[:SALE_PRODUCT]->(product:Product) WITH user, sale, product RETURN apoc.map.removeKey(sale {.*}, '') as sale, apoc.map.removeKey(product {.*}, '') as product, apoc.map.removeKey(user  {.*}, 'password') as user`,
    };
  },
  /**
   * @param {Object} data
   *
   * @param data.email The users email
   * @param data.password The users password
   *
   * @returns {{statement, data}}
   */
  CREATE_USER: (data) => {
    return {
      statement: `CREATE (user:User { id: $id, email: $email, password: $password }) WITH apoc.map.removeKey(user {.*}, 'password') as user RETURN user`,
      data,
    };
  },
  /**
   * @param {Object} data Data that needs to be added or updated to a user
   *
   * @param data.email This value has to be passed
   *
   * @returns {{statement}}
   */
  UPDATE_USER: (data, specific = false) => {
    if (!data.email) throw 'Email is undefined for UPDATE_USER';

    let email = data.email;

    for (let key in data) {
      data[key] = `user.${key} = "${data[key]}"`;
    }

    let values = Object.values(data);
    let returns = values.map((field) => field.split(' = ')[0]);

    returns = returns.map((field) => field + ' as ' + field.split('.')[1]);

    return {
      statement: `MERGE (user:User { email: "${email}" }) SET ${values.join(
        ', '
      )} WITH apoc.map.removeKey(user {.*}, 'password') as user RETURN ${
        specific ? returns.join(', ') : 'user'
      }`,
    };
  },
  /**
   * @param email The email of the user that needs to be deleted.
   *
   * @returns {{statement}}
   */
  DELETE_USER: (email) => {
    if (!email) throw 'Email is undefined for DELETE_USER';

    return {
      statement: `MATCH (user:User) WHERE user.email = "connor@3reco.co.za" WITH user MATCH (user)-[:SELLS]->(product:Product) WITH user, product MATCH (user)-[:USER_SALE]->(sale:Sale) WITH user, sale, product DETACH DELETE sale DETACH DELETE product WITH user MATCH (user:User) WHERE user.email = "connor@3reco.co.za" DETACH DELETE user`,
    };
  },
};
