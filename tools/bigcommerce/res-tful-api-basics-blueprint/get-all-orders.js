/**
 * Function to get all orders from the BigCommerce API.
 *
 * @param {Object} args - Arguments for the request.
 * @param {string} [args.store_Hash] - Optional store hash. If not provided, uses BIGCOMMERCE_STORE_HASH from environment.
 * @param {number} [args.customer_id] - Filter orders by specific customer ID.
 * @param {string} [args.email] - Filter orders by customer email.
 * @param {number} [args.status_id] - Filter orders by status ID.
 * @param {number} [args.min_id] - Minimum order ID.
 * @param {number} [args.max_id] - Maximum order ID.
 * @param {number} [args.min_total] - Minimum order total amount.
 * @param {number} [args.max_total] - Maximum order total amount.
 * @param {string} [args.min_date_created] - Minimum date created (ISO 8601 format).
 * @param {string} [args.max_date_created] - Maximum date created (ISO 8601 format).
 * @param {string} [args.min_date_modified] - Minimum date modified (ISO 8601 format).
 * @param {string} [args.max_date_modified] - Maximum date modified (ISO 8601 format).
 * @param {number} [args.channel_id] - Filter by channel ID.
 * @param {string} [args.payment_method] - Filter by payment method.
 * @param {string} [args.cart_id] - Filter by cart ID.
 * @param {string} [args.external_order_id] - Filter by external order ID.
 * @param {string} [args.sort] - Sort field and direction (e.g., 'date_created:desc').
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
  min_total,
  max_total,
  min_date_created,
  max_date_created,
  min_date_modified,
  max_date_modified,
  channel_id,
  payment_method,
  cart_id,
  external_order_id,
  sort,
  limit = 50,
  page = 1
} = {}) => {
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
    if (min_total) queryParams.append('min_total', min_total.toString());
    if (max_total) queryParams.append('max_total', max_total.toString());
    if (min_date_created) queryParams.append('min_date_created', min_date_created);
    if (max_date_created) queryParams.append('max_date_created', max_date_created);
    if (min_date_modified) queryParams.append('min_date_modified', min_date_modified);
    if (max_date_modified) queryParams.append('max_date_modified', max_date_modified);
    if (channel_id) queryParams.append('channel_id', channel_id.toString());
    if (payment_method) queryParams.append('payment_method', payment_method);
    if (cart_id) queryParams.append('cart_id', cart_id);
    if (external_order_id) queryParams.append('external_order_id', external_order_id);
    if (sort) queryParams.append('sort', sort);
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
      description: 'Get all orders from the BigCommerce API. Can filter by customer_id to get products associated with specific customers through their order history. Store hash is automatically retrieved from environment variables.',
      parameters: {
        type: 'object',
        properties: {
          store_Hash: {
            type: 'string',
            description: 'Optional store hash. If not provided, uses BIGCOMMERCE_STORE_HASH from environment variables.'
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
          min_total: {
            type: 'number',
            description: 'Minimum order total amount for filtering.'
          },
          max_total: {
            type: 'number',
            description: 'Maximum order total amount for filtering.'
          },
          min_date_created: {
            type: 'string',
            description: 'Minimum date created for filtering (ISO 8601 format, e.g., 2023-01-01T00:00:00Z).'
          },
          max_date_created: {
            type: 'string',
            description: 'Maximum date created for filtering (ISO 8601 format, e.g., 2023-12-31T23:59:59Z).'
          },
          min_date_modified: {
            type: 'string',
            description: 'Minimum date modified for filtering (ISO 8601 format, e.g., 2023-01-01T00:00:00Z).'
          },
          max_date_modified: {
            type: 'string',
            description: 'Maximum date modified for filtering (ISO 8601 format, e.g., 2023-12-31T23:59:59Z).'
          },
          channel_id: {
            type: 'integer',
            description: 'Filter orders by channel ID.'
          },
          payment_method: {
            type: 'string',
            description: 'Filter orders by payment method (e.g., credit_card, paypal, manual).'
          },
          cart_id: {
            type: 'string',
            description: 'Filter orders by cart ID.'
          },
          external_order_id: {
            type: 'string',
            description: 'Filter orders by external order ID.'
          },
          sort: {
            type: 'string',
            description: 'Sort field and direction (e.g., date_created:desc, id:asc, total:desc).'
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
        required: []
      }
    }
  }
};

export { apiTool };
