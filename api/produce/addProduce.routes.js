let { Router } = require('express');
let router = Router();
let Produce = require('../../models/produce.model');

/**
 * @openapi
 * /api/v1/produce:
 *   post:
 *     description: Create a new produce.
 *     tags: [Produce]
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: image
 *         description: The products image.
 *         type: string
 *       - name: name
 *         description: The products name.
 *         type: string
 *     responses:
 *       200:
 *         description: Returns data or error message.
 *       401:
 *         description: Returns "Unauthorized".
 */
router.post('/', async (request, response) => {
  let { body, user } = request;

  try {
    const data = {
      owner: user._id,
      image: body.image,
      name: body.name,
      price: body.price,
    };
    const newProduce = new Produce(data);

    await newProduce.save();

    return response.status(200).json({ data });
  } catch (error) {
    return response
      .status(200)
      .json({ message: 'Error while adding a produce.', error });
  }
});

module.exports = router;
