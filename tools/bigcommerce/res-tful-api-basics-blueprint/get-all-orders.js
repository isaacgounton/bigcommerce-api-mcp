/**
 * Function to get all orders from the BigCommerce API.
 *
 * @param {Object} args - Arguments for the request.
 * @param {string} args.store_Hash - The store hash to be included in the URL.
 * @param {number} [args.customer_id] - Filter orders by specific customer ID.
 * @param {string} [args.email] - Filter orders by customer email.
 * @param {number} [args.status_id] - Filter orders by status ID.
 * @param {number} [args.min_id] - Minimum order ID.
 * @param {number} [args.max_id] - Maximum order ID.
 * @param {number} [args.limit] - Number of results to return (default: 50).
 * @param {number} [args.page] - Page to return (default: 1).
 * @returns {Promise<Object>} - The result of the API call.
 */
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const executeFunction = async ({ 
  store_Hash, 
  customer_id, 
  email, 
  status_id, 
  min_id, 
  max_id, 
  limit = 50, 
  page = 1 
}) => {
  const baseUrl = 'https://api.bigcommerce.com/stores';
  const apiKey = process.env.BIGCOMMERCE_API_KEY;

  // Use provided store hash or default from environment
  const storeHash = store_Hash || process.env.BIGCOMMERCE_STORE_HASH;
  
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();
    
    if (customer_id) queryParams.append('customer_id', customer_id.toString());
    if (email) queryParams.append('email', email);
    if (status_id) queryParams.append('status_id', status_id.toString());
    if (min_id) queryParams.append('min_id', min_id.toString());
    if (max_id) queryParams.append('max_id', max_id.toString());
    if (limit) queryParams.append('limit', limit.toString());
    if (page) queryParams.append('page', page.toString());
    
    // Construct the URL for the request
    const url = `${baseUrl}/${storeHash}/v2/orders${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

    // Set up headers for the request
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
    console.error('Error getting all orders:', error);
    return {
      error: `An error occurred while getting all orders: ${error instanceof Error ? error.message : JSON.stringify(error)}`
    };
  }
};

/**
 * Tool configuration for getting all orders from the BigCommerce API.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'get_all_orders',
      description: 'Get all orders from the BigCommerce API. Can filter by customer_id to get products associated with specific customers through their order history.',
      parameters: {
        type: 'object',
        properties: {
          store_Hash: {
            type: 'string',
            description: 'The store hash to be included in the URL.'
          },
          customer_id: {
            type: 'integer',
            description: 'Filter orders by specific customer ID to get products associated with that customer.'
          },
          email: {
            type: 'string',
            description: 'Filter orders by customer email address.'
          },
          status_id: {
            type: 'integer',
            description: 'Filter orders by status ID (e.g., 1=Pending, 7=Awaiting Payment, 11=Awaiting Fulfillment).'
          },
          min_id: {
            type: 'integer',
            description: 'Minimum order ID for filtering.'
          },
          max_id: {
            type: 'integer',
            description: 'Maximum order ID for filtering.'
          },
          limit: {
            type: 'integer',
            description: 'Number of results to return (default: 50, max: 250).'
          },
          page: {
            type: 'integer',
            description: 'Page number to return (default: 1).'
          }
        },
        required: ['store_Hash']
      }
    }
  }
};

export { apiTool };
