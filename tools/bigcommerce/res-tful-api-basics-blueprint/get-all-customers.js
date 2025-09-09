/**
 * Function to get all customers from the API with optional filtering.
 *
 * @param {Object} args - Arguments for the request.
 * @param {string} [args.store_Hash] - Optional store hash. If not provided, uses BIGCOMMERCE_STORE_HASH from environment.
 * @param {string} [args.id] - Filter by customer IDs (comma-separated).
 * @param {string} [args.email] - Filter by customer email address.
 * @param {string} [args.name] - Filter by customer name (exact match).
 * @param {string} [args.name_like] - Filter by customer name (partial match).
 * @param {string} [args.company] - Filter by company name.
 * @param {string} [args.phone] - Filter by phone number.
 * @param {string} [args.customer_group_id] - Filter by customer group ID.
 * @param {string} [args.registration_ip_address] - Filter by registration IP address.
 * @param {string} [args.date_created] - Filter by exact customer creation date.
 * @param {string} [args.date_created_min] - Filter customers created after this date.
 * @param {string} [args.date_created_max] - Filter customers created before this date.
 * @param {string} [args.date_modified] - Filter by exact customer modification date.
 * @param {string} [args.date_modified_min] - Filter customers modified after this date.
 * @param {string} [args.date_modified_max] - Filter customers modified before this date.
 * @param {string} [args.sort] - Sort field and direction (e.g., 'date_created:desc').
 * @param {string} [args.include] - Include additional resources (addresses, storecredit, attributes).
 * @param {number} [args.limit] - Number of results to return (max 250, default 50).
 * @param {number} [args.page] - Page number for pagination (default 1).
 * @returns {Promise<Object>} - The result of the API call to get all customers.
 */
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const executeFunction = async ({
  store_Hash,
  id,
  email,
  name,
  name_like,
  company,
  phone,
  customer_group_id,
  registration_ip_address,
  date_created,
  date_created_min,
  date_created_max,
  date_modified,
  date_modified_min,
  date_modified_max,
  sort,
  include,
  limit = 50,
  page = 1
} = {}) => {
  const baseUrl = 'https://api.bigcommerce.com/stores';
  const token = process.env.BIGCOMMERCE_API_KEY;

  // Use provided store hash or default from environment
  const storeHash = store_Hash || process.env.BIGCOMMERCE_STORE_HASH;

  try {
    // Build query parameters from filters
    const queryParams = new URLSearchParams();

    // Add filtering parameters (using BigCommerce v3 Customers API syntax)
    if (id) queryParams.append('id:in', id);
    if (email) queryParams.append('email:in', email);
    if (name) queryParams.append('name:in', name);
    if (name_like) queryParams.append('name:like', name_like);
    if (company) queryParams.append('company:in', company);
    if (phone) queryParams.append('phone:in', phone);
    if (customer_group_id) queryParams.append('customer_group_id:in', customer_group_id.toString());
    if (registration_ip_address) queryParams.append('registration_ip_address:in', registration_ip_address);
    if (date_created) queryParams.append('date_created', date_created);
    if (date_created_min) queryParams.append('date_created:min', date_created_min);
    if (date_created_max) queryParams.append('date_created:max', date_created_max);
    if (date_modified) queryParams.append('date_modified', date_modified);
    if (date_modified_min) queryParams.append('date_modified:min', date_modified_min);
    if (date_modified_max) queryParams.append('date_modified:max', date_modified_max);
    if (sort) queryParams.append('sort', sort);
    if (include) queryParams.append('include', include);
    if (limit) queryParams.append('limit', limit.toString());
    if (page) queryParams.append('page', page.toString());

    // Construct the URL with query parameters
    const url = `${baseUrl}/${storeHash}/v3/customers${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    // Set up headers for the request (matching n8n configuration)
    const headers = {
      'X-Auth-Token': token,
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
      const errorText = await response.text();
      console.log('Error response:', errorText.substring(0, 500));
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    // Get response as text first to check for HTML
    const responseText = await response.text();

    // Check if response is HTML (authentication error)
    if (responseText.trim().startsWith('<')) {
      // Extract error details from HTML
      const titleMatch = responseText.match(/<title>(.*?)<\/title>/i);
      const errorTitle = titleMatch ? titleMatch[1] : 'Unknown error';

      // Look for common error patterns
      let errorDetails = '';
      if (responseText.includes('401') || responseText.includes('Unauthorized')) {
        errorDetails = 'Authentication failed - invalid API token';
      } else if (responseText.includes('403') || responseText.includes('Forbidden')) {
        errorDetails = 'Access forbidden - check API token permissions';
      } else if (responseText.includes('404') || responseText.includes('Not Found')) {
        errorDetails = 'Store not found - check store hash';
      }

      throw new Error(`BigCommerce API Error: ${errorTitle}. ${errorDetails}`);
    }

    // Parse and return the response data
    const data = JSON.parse(responseText);
    return data;
  } catch (error) {
    console.error('Error getting all customers:', error);
    return {
      error: `An error occurred while getting all customers: ${error instanceof Error ? error.message : JSON.stringify(error)}`
    };
  }
};

/**
 * Tool configuration for getting all customers from the API with optional filtering.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'get_all_customers',
      description: 'Get all customers from the BigCommerce API with comprehensive filtering options (email, name, company, phone, customer group, dates, pagination). Store hash is automatically retrieved from environment variables.',
      parameters: {
        type: 'object',
        properties: {
          store_Hash: {
            type: 'string',
            description: 'Optional store hash. If not provided, uses BIGCOMMERCE_STORE_HASH from environment variables.'
          },
          id: {
            type: 'string',
            description: 'Filter by customer IDs (comma-separated for multiple IDs, e.g., "1,2,3").'
          },
          email: {
            type: 'string',
            description: 'Filter by customer email address (exact match).'
          },
          name: {
            type: 'string',
            description: 'Filter by customer full name (exact match).'
          },
          name_like: {
            type: 'string',
            description: 'Filter by customer name using partial match (substring search).'
          },
          company: {
            type: 'string',
            description: 'Filter by company name (exact match).'
          },
          phone: {
            type: 'string',
            description: 'Filter by phone number (exact match).'
          },
          customer_group_id: {
            type: 'string',
            description: 'Filter by customer group ID (comma-separated for multiple groups).'
          },
          registration_ip_address: {
            type: 'string',
            description: 'Filter by registration IP address (exact match).'
          },
          date_created: {
            type: 'string',
            description: 'Filter by exact customer creation date (ISO format: YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS).'
          },
          date_created_min: {
            type: 'string',
            description: 'Filter customers created after this date (ISO format: YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS).'
          },
          date_created_max: {
            type: 'string',
            description: 'Filter customers created before this date (ISO format: YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS).'
          },
          date_modified: {
            type: 'string',
            description: 'Filter by exact customer modification date (ISO format: YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS).'
          },
          date_modified_min: {
            type: 'string',
            description: 'Filter customers modified after this date (ISO format: YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS).'
          },
          date_modified_max: {
            type: 'string',
            description: 'Filter customers modified before this date (ISO format: YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS).'
          },
          sort: {
            type: 'string',
            description: 'Sort field and direction (e.g., "date_created:desc", "last_name:asc", "date_modified:desc").'
          },
          include: {
            type: 'string',
            description: 'Include additional customer sub-resources (comma-separated: addresses, storecredit, attributes, formfields).'
          },
          limit: {
            type: 'integer',
            description: 'Number of results to return (max 250, default 50).'
          },
          page: {
            type: 'integer',
            description: 'Page number for pagination (default 1).'
          }
        },
        required: []
      }
    }
  }
};

export { apiTool };
