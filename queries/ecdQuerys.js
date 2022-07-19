module.exports = {
    /**
     * @returns {{statement}}
     */
    GET_ALL_PRODUCE: () => {
        return {
            statement: `MATCH (produce:Produce) WITH apoc.map.removeKey(produce {.*}, '') as produce RETURN produce`,
        };
    },
    /**
     * @returns {{statement}}
     */
    GET_ALL_HARVESTED: () => {
        return {
            statement: `MATCH (harvested:Harvested) WITH apoc.map.removeKey(harvested {.*}, '') as harvested RETURN harvested`,
        };
    },
    /**
     * @param {String} id The id of the produce.
     * 
     * @returns {{statement}}
     */
    GET_PRODUCE: (id) => {
        return {
            statement: `
            MATCH (produce:Produce)
            WHERE produce.id = "${id}"
            WITH apoc.map.removeKey(produce {.*}, '') as produce
            RETURN produce
            `
        }
    },
    /**
     * @param {String} id The id of the harvested.
     * 
     * @returns {{statement}}
     */
    GET_HARVESTED: (id) => {
        return {
            statement: `
            MATCH (harvested:Harvested)
            WHERE harvested.id = "${id}"
            WITH apoc.map.removeKey(harvested {.*}, '') as harvested
            RETURN harvested
            `
        }
    },
    /**
     * @param {Object} data
     *
     * @returns {{statement, data}}
     */
    CREATE_PRODUCE: (data) => {
        return {
            statement: `
            CREATE (produce:Produce { id: $id, image: $image, name: $name })
            CREATE (user:User { id: $id })-[:PRODUCES]->(produce)
            WITH apoc.map.removeKey(produce {.*}, '') as produce
            RETURN produce
            `,
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
    CREATE_HARVESTED: (data) => {
        return {
            statement: `
            CREATE (harvested:Harvested { id: $id, items: $items })
            CREATE (user:User { id: $id })-[:HARVESTED]->(harvested)
            WITH apoc.map.removeKey(harvested {.*}, '') as harvested
            RETURN harvested
            `,
            data,
        };
    },
    /**
     * @param id The id of the produce that needs to be deleted.
     *
     * @returns {{statement}}
     */
    DELETE_PRODUCE: (id) => {
        if (!id) throw 'id is undefined for DELETE_PRODUCE';

        return {
            statement: `MATCH (produce:Produce) WHERE produce.id = "${id}" WITH produce DETACH DELETE produce`,
        };
    },
    /**
     * @param id The id of the harvested that needs to be deleted.
     *
     * @returns {{statement}}
     */
    DELETE_HARVESTED: (id) => {
        if (!id) throw 'id is undefined for DELETE_HARVESTED';

        return {
            statement: `MATCH (harvested:Harvested) WHERE harvested.id = "${id}" WITH harvested DETACH DELETE harvested`,
        };
    },
};
