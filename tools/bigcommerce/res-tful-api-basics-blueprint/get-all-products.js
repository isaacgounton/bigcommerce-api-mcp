/**
 * Function to get all products from the API.
 *
 * @param {Object} args - Arguments for the request.
 * @param {string} [args.store_Hash] - Optional store hash. If not provided, uses BIGCOMMERCE_STORE_HASH from environment.
 * @returns {Promise<Object>} - The result of the API request.
 */
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const executeFunction = async ({ store_Hash }) => {
  const baseUrl = 'https://api.bigcommerce.com/stores';
  const apiKey = process.env.BIGCOMMERCE_API_KEY;

  // Use provided store hash or default from environment
  const storeHash = store_Hash || process.env.BIGCOMMERCE_STORE_HASH;
  try {
    // Construct the URL for the request
    const url = `${baseUrl}/${storeHash}/v3/catalog/products`;

    // Set up headers for the request (matching n8n configuration)
    const headers = {
      'X-Auth-Token': apiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    // Perform the fetch request
    const response = await fetch(url, {
      method: 'GET',
      headers
    });

    // Check if the response was successful
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(JSON.stringify(errorData));
    }

    // Parse and return the response data
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting all products:', error);
    return {
      error: `An error occurred while getting all products: ${error instanceof Error ? error.message : JSON.stringify(error)}`
    };
  }
};

/**
 * Tool configuration for getting all products from the API.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'get_all_products',
      description: 'Get all products from the API.',
      parameters: {
        type: 'object',
        properties: {
          store_Hash: {
            type: 'string',
            description: 'The store hash to be included in the URL.'
          }
        },
        required: ['store_Hash']
      }
    }
  }
};

export { apiTool };
