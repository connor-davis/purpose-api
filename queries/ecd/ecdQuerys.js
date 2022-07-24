const moment = require("moment");

module.exports = {
    GET_ALL_PRODUCE: () => {
        return {
            statement: `MATCH (user:User)-[:PRODUCES]->(produce:Product) WITH apoc.map.removeKey(produce {.*}, '') as produce RETURN produce`
        };
    },
    GET_ALL_HARVESTS: () => {
        return {
            statement: `MATCH (user:User)-[:HARVESTED]->(harvested:Harvested) WITH apoc.map.removeKey(harvested {.*}, '') as harvested RETURN harvested`
        };
    },
    /**
     * @returns {{statement}}
     */
    GET_ALL_PRODUCE_USER: (id) => {
        return {
            statement: `MATCH (user:User)-[:PRODUCES]->(produce:Product) WHERE user.id = "${id}" WITH apoc.map.removeKey(produce {.*}, '') as produce RETURN produce`,
        };
    },
    /**
     * @returns {{statement}}
     */
    GET_ALL_HARVESTED_USER: (id) => {
        return {
            statement: `MATCH (user:User)-[:HARVESTED]->(harvested:Harvested) WHERE user.id = "${id}" WITH apoc.map.removeKey(harvested {.*}, '') as harvested RETURN harvested`,
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
            MATCH (produce:Product)
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
     * @param data.id The produce id
     * @param data.email The user who produces this produce' email
     * @param data.image The produce image
     * @param data.name The produce name
     * @param data.price The produce price
     *
     * @returns {{statement, data}}
     */
    CREATE_PRODUCE: (data) => {
        return {
            statement: `
            MATCH (user:User { email: $email })
            WITH user
            CREATE (produce:Product { id: $id, image: $image, name: $name, price: $price })
            CREATE (user)-[:PRODUCES]->(produce)
            WITH apoc.map.removeKey(produce {.*}, '') as produce
            RETURN produce
            `,
            data,
        };
    },
    /**
     * @param {Object} data
     *
     * @param data.id The harvest id
     * @param data.yield The harvests yield
     * @param data.weight The weight of the harvest (optional)
     * @param data.date The harvest date
     * @param data.produceName The harvest produce name
     * @param data.produceImage The harvest produce image
     * @param data.producePrice The price the harvest produce is sold for
     *
     * @returns {{statement, data}}
     */
    CREATE_HARVESTED: (data) => {
        if (!data.date) data.date = moment(Date.now()).toString();

        if (!data.weight) data.weight = "Not set";
        else data.weight = parseInt(data.weight);

        return {
            statement: `
            MATCH (user:User { email: $email })
            with user
            CREATE (harvested:Harvested { id: $id, date: $date, yield: $yield, weight: $weight, produceName: $produceName, produceImage: $produceImage, producePrice: $producePrice })
            CREATE (user)-[:HARVESTED]->(harvested)
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
