let { Router } = require('express');
let router = Router();
let passport = require('passport');
let Product = require('../../models/product.model');

let createProductRoutes = require('./createProduct.routes');
let updateProductRoutes = require('./updateProduct.routes');
let deleteProductRoutes = require('./deleteProduct.routes');

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
  passport.authenticate('jwt', { session: false }),
  async (request, response) => {
    let { user } = request;

    try {
      const found = await Product.find({ owner: user.email });

      if (!found)
        return response.status(200).json({
          data: [],
        });
      else {
        const data = found.map((product) => {
          return { ...product.toJSON() };
        });

        return response.status(200).json({ data });
      }
    } catch (error) {
      return response
        .status(200)
        .json({ message: 'Error while retrieving user products.', error });
    }
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
  passport.authenticate('jwt', { session: false }),
  async (request, response) => {
    let { params } = request;

    try {
      const found = Product.findOne({ _id: params.id });

      if (!found)
        return response
          .status(200)
          .json({ message: 'Product not found.', error: 'product-not-found' });
      else {
        const data = found.toJSON();

        return response.status(200).json({ data });
      }
    } catch (error) {
      return response
        .status(200)
        .json({ message: 'Error while retrieving user products.', error });
    }
  }
);

router.use(
  '/',
  passport.authenticate('jwt', { session: false }),
  createProductRoutes
);
router.use(
  '/',
  passport.authenticate('jwt', { session: false }),
  updateProductRoutes
);
router.use(
  '/',
  passport.authenticate('jwt', { session: false }),
  deleteProductRoutes
);

module.exports = router;
