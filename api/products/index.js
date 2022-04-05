let {Router} = require('express');
let router = Router();
let passport = require('passport');

let createProductRoutes = require("./createProduct.routes");
let updateProductRoutes = require("./updateProduct.routes");
let deleteProductRoutes = require("./deleteProduct.routes");
let {readTransaction} = require("../../utils/neo4j");
let {GET_PRODUCTS, GET_PRODUCT} = require("../../queries/productQuerys");

/**
 * @openapi
 * /api/v1/products:
 *   get:
 *     description: Retrieve the users products
 *     tags: [Products]
 *     produces:
 *       - application/json
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Returns the users products.
 *       401:
 *         description: Returns "Unauthorized".
 */
router.get(
    '/',
    passport.authenticate('jwt', {session: false}),
    async (request, response) => {
        let {user} = request;

        console.log(user);

        await readTransaction(
            GET_PRODUCTS(user.id),
            (error, result) => {
                if (error)
                    return response
                        .status(200)
                        .json({message: 'Error while retrieving user products.', error});
                else {
                    let records = result.records;
                    let data = records.map((record) => record.get("product"))

                    return response.status(200).json({data});
                }
            }
        );
    }
);

/**
 * @openapi
 * /api/v1/products/:id:
 *   get:
 *     description: Retrieve a product with id :id
 *     tags: [Products]
 *     produces:
 *       - application/json
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Returns the product with id :id.
 *       401:
 *         description: Returns "Unauthorized".
 */
router.get(
    '/:id',
    passport.authenticate('jwt', {session: false}),
    async (request, response) => {
        let {params} = request;

        await readTransaction(
            GET_PRODUCT(params.id),
            (error, result) => {
                if (error)
                    return response
                        .status(200)
                        .json({message: 'Error while retrieving user products.', error});
                else {
                    let record = result.records[0];

                    if (record) {
                        let data = record.get("product");

                        return response.status(200).json({data});
                    } else return response.status(200).json({
                        message: 'Product not found.',
                        error: "product-not-found"
                    });
                }
            }
        );
    }
);

router.use("/", passport.authenticate("jwt", {session: false}), createProductRoutes);
router.use("/", passport.authenticate("jwt", {session: false}), updateProductRoutes);
router.use("/", passport.authenticate("jwt", {session: false}), deleteProductRoutes);

module.exports = router;
