let { Router } = require('express');
let router = Router();
let Harvest = require('../../models/harvest.model');

/**
 * @openapi
 * /api/v1/harvests:
 *   post:
 *     description: Create a new harvests.
 *     tags: [Harvests]
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: date
 *         description: The harvest date.
 *         type: string
 *       - name: produce
 *         description: The harvests produce.
 *         type: string
 *       - yield:
 *         description: The harvests yield.
 *         type: number
 *     responses:
 *       200:
 *         description: Returns data or error message.
 *       401:
 *         description: Returns "Unauthorized".
 */
router.post('/', async (request, response) => {
  let { body, user } = request;

  if (!body.date) body.date = Date.now();

  try {
    const data = {
      owner: user._id,
      yield: parseFloat(body.yield),
      weight: parseFloat(body.weight),
      date: body.date,
      produce: body.produce,
    };

    const newHarvest = new Harvest(data);

    await newHarvest.save();

    return response.status(200).json({ data });
  } catch (error) {
    return response
      .status(200)
      .json({ message: 'Error while adding a harvest.', error });
  }
});

module.exports = router;
