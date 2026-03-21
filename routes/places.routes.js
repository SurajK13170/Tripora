const express = require('express');
const router = express.Router();

const { asyncHandler } = require('../middleware/errorHandler');
const {
  getTopTouristAttractionsByCountry,
} = require('../services/googlePlacesService');

// Optional: fallback if constants missing
const HTTP_STATUS = {
  SUCCESS: 200,
  BAD_REQUEST: 400,
};

router.get(
  '/attractions',
  asyncHandler(async (req, res) => {
    const country = req.query.country?.trim();

    if (!country) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: 'Bad request',
        message: 'Query parameter "country" is required.',
        timestamp: new Date().toISOString(),
      });
    }

    const places =
      await getTopTouristAttractionsByCountry(country);

    res.status(HTTP_STATUS.SUCCESS).json({
      country,
      query: `top tourist attractions in ${country}`,
      count: places.length,
      places,
      timestamp: new Date().toISOString(),
    });
  })
);

module.exports = router;