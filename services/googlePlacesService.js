const axios = require('axios');

const GOOGLE_PLACES_TEXT_SEARCH_URL =
  'https://places.googleapis.com/v1/places:searchText';

// Custom error creator
const createServiceError = (message, status = 500) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const buildPlacesApiErrorMessage = (errorData, status) => {
  const googleMessage = errorData?.error?.message;

  if (!googleMessage) {
    return null;
  }

  if (
    status === 403 &&
    googleMessage.includes('places.googleapis.com')
  ) {
    return [
      'Google Places API request was rejected.',
      'The API key project likely does not have Places API (New) enabled, billing enabled, or the key is restricted to a different API/project.',
      `Google says: ${googleMessage}`,
    ].join(' ');
  }

  if (status === 403) {
    return [
      'Google Places API request was rejected.',
      'Check that the API key is valid, billing is enabled, and the key restrictions allow Places API (New).',
      `Google says: ${googleMessage}`,
    ].join(' ');
  }

  return googleMessage;
};

// Map API response → clean object
const mapPlace = (place) => ({
  name: place.displayName?.text || null,
  address: place.formattedAddress || null,
  rating: place.rating || null,
  location: {
    lat: place.location?.latitude || null,
    lng: place.location?.longitude || null,
  },
});

// Main function
const getTopTouristAttractionsByCountry = async (country) => {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    throw createServiceError(
      'GOOGLE_PLACES_API_KEY is not configured.',
      500
    );
  }

  try {
    const response = await axios.post(
      GOOGLE_PLACES_TEXT_SEARCH_URL,
      {
        textQuery: `top tourist attractions in ${country}`,
        pageSize: 10,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask':
            'places.displayName,places.formattedAddress,places.rating,places.location',
        },
        timeout: 10000,
      }
    );

    const places = response.data?.places || [];
    return places.map(mapPlace);
  } catch (error) {
    console.error('Google Places API Error:', error.message);

    const status = error.response?.status || 502;
    const serviceMessage = buildPlacesApiErrorMessage(
      error.response?.data,
      status
    );

    if (serviceMessage) {
      throw createServiceError(
        serviceMessage,
        status
      );
    }

    if (error.code === 'ECONNABORTED') {
      throw createServiceError(
        'Google Places API request timed out.',
        504
      );
    }

    throw createServiceError(
      'Failed to fetch places from Google Places API.',
      502
    );
  }
};

module.exports = {
  getTopTouristAttractionsByCountry,
};
