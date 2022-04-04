module.exports = {
    /**
     * @returns {{statement}}
     */
    GET_USERS: () => {
        return {
            statement: `MATCH (user:User) RETURN apoc.map.removeKey(user {.*}, 'password') as user`,
        };
    },
    /**
     * @param {Object} data ```js
     * { email: 'test@test' } or { id: '12345abcdef' }
     * ```
     *
     * @returns {{statement, data}}
     */
    GET_USER: (data) => {
        return {
            statement: `MATCH (n) WHERE ${
                data.id ? 'n.id = $id' : 'n.email = $email'
            } RETURN n.id, n.email, n.lastLogin, n.password`,
            data,
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
            statement: `CREATE (user:User { id: $id, email: $email, password: $password }) RETURN apoc.map.removeKey(user {.*}, 'password') as user`,
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
    UPDATE_USER: (data) => {
        if (!data.email) throw 'Email is undefined for UPDATE_USER';

        let email = data.email;

        for (let key in data) {
            data[key] = `user.${key} = "${data[key]}"`;
        }

        let values = Object.values(data);

        return {
            statement: `MERGE (user:User { email: "${email}" }) SET ${values.join(', ')} WITH apoc.map.removeKey(user {.*}, 'password') as user RETURN user`
        };
    },
    /**
     * @param email The email of the user that needs to be deleted.
     *
     * @returns {{statement}}
     */
    DELETE_USER: (email) => {
        if (!email) throw "Email is undefined for DELETE_USER";

        return {
            statement: ``
        }
    }
};
