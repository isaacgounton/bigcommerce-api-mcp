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

const executeFunction = async ({ store_Hash } = {}) => {
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
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        // If JSON parsing fails, use the text response
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
      }
      throw new Error(JSON.stringify(errorData));
    }

    // Get response text first to handle empty responses
    const responseText = await response.text();

    // Check if response is empty
    if (!responseText || responseText.trim() === '') {
      return { data: [], meta: { total: 0 } };
    }

    // Parse and return the response data
    try {
      const data = JSON.parse(responseText);
      return data;
    } catch (parseError) {
      throw new Error(`Invalid JSON response: ${responseText.substring(0, 200)}...`);
    }
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
      description: 'Get all products from the BigCommerce API. Store hash is automatically retrieved from environment variables.',
      parameters: {
        type: 'object',
        properties: {
          store_Hash: {
            type: 'string',
            description: 'Optional store hash. If not provided, uses BIGCOMMERCE_STORE_HASH from environment variables.'
          }
        },
        required: []
      }
    }
  }
};

export { apiTool };
