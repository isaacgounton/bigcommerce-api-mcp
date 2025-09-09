# Agno Compatibility Guide for BigCommerce MCP Server

This document explains the compatibility improvements made to the BigCommerce MCP server to work seamlessly with Agno's MCPTools client.

## 🔄 Changes Made for Agno Compatibility

### 1. Enhanced Tool Response Format

**Previous Format:**

```javascript
{
  content: [
    {
      type: "text",
      text: JSON.stringify(result, null, 2),
    },
  ],
}
```

**New Format:**

```javascript
{
  content: [
    {
      type: "text",
      text: formattedResult, // More readable format
    },
  ],
  // Additional metadata for advanced clients
  _meta: {
    toolName: "get_all_products",
    resultType: "object",
    hasData: true,
    timestamp: "2024-01-01T00:00:00.000Z",
  },
  // Error handling
  isError: false, // true if result contains error
}
```

### 2. Improved Response Formatting

- **Error Handling**: Explicit error detection and formatting
- **Data-Aware Formatting**: Better formatting for arrays and data objects
- **Readable Output**: More human-readable responses for Agno agents
- **Metadata**: Additional information for debugging and optimization

### 3. Enhanced Server Configuration

#### CORS Support

Added proper CORS headers for web-based MCP clients:

```javascript
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Mcp-Session-Id');
  // ...
});
```

#### Additional Endpoints

- **Health Check**: `GET /health` - Server status and diagnostics
- **Server Info**: `GET /info` - Server capabilities and metadata

## 🚀 Usage with Agno

### Installation

1. **Install Agno** (Python):

```bash
pip install agno
```

2. **Start the MCP Server**:

```bash
# HTTP Transport (recommended for Agno)
npm run start:http

# or SSE Transport
npm run start:sse

# or stdio (for CLI usage)
npm start
```

### Basic Usage Example

```python
import asyncio
from agno.agent import Agent
from agno.models.openai import OpenAIChat
from agno.tools.mcp import MCPTools

async def bigcommerce_agent_example():
    # Initialize MCPTools with the BigCommerce server
    mcp_tools = MCPTools(
        url="http://localhost:3000/mcp",
        transport="streamable-http"
    )
    
    # Connect to the MCP server
    await mcp_tools.connect()
    
    # Create an agent with BigCommerce capabilities
    agent = Agent(
        model=OpenAIChat(id="gpt-4o"),
        tools=[mcp_tools],
        instructions="""
        You are a BigCommerce assistant with access to:
        - Product management (get all products)
        - Customer management (get all customers)  
        - Order management (get all orders)
        
        Always use the store hash when required.
        Provide clear, helpful responses about the BigCommerce data.
        """,
        markdown=True,
        show_tool_calls=True,
    )
    
    # Example interactions
    queries = [
        "Get all products from the BigCommerce store",
        "Show me all customers",
        "What orders do we have?",
        "How many products are in the catalog?",
    ]
    
    for query in queries:
        print(f"\n🤖 Query: {query}")
        await agent.aprint_response(query, stream=True)
        print("\n" + "="*50)
    
    # Close the connection
    await mcp_tools.close()

# Run the example
asyncio.run(bigcommerce_agent_example())
```

### Advanced Usage with Multiple Servers

```python
from agno.tools.mcp import MultiMCPTools

async def multi_server_example():
    # Connect to multiple MCP servers including BigCommerce
    multi_mcp = MultiMCPTools([
        "http://localhost:3000/mcp",  # BigCommerce server
        # Add other MCP servers as needed
    ], urls_transports=["streamable-http"])
    
    await multi_mcp.connect()
    
    agent = Agent(
        model=OpenAIChat(id="gpt-4o"),
        tools=[multi_mcp],
        instructions="You have access to BigCommerce and other tools.",
        markdown=True,
    )
    
    await agent.aprint_response(
        "Compare our BigCommerce product catalog with market trends",
        stream=True
    )
    
    await multi_mcp.close()
```

## 🧪 Testing Compatibility

Run the included compatibility test:

```bash
npm run test:agno
```

This test will:

- ✅ Verify server connectivity
- ✅ Test tool discovery
- ✅ Validate response formats
- ✅ Check Agno compatibility features

## 🔧 Configuration

### Environment Variables

Create a `.env` file with your BigCommerce credentials:

```env
BIGCOMMERCE_API_KEY=your_api_key_here
BIGCOMMERCE_STORE_HASH=your_store_hash_here
MCP_AUTH_TOKEN=optional_auth_token
PORT=3000
```

### Transport Options

The server supports all MCP transports that Agno can use:

1. **Streamable HTTP** (recommended for Agno):

   ```bash
   npm run start:http
   ```

   URL: `http://localhost:3000/mcp`

2. **SSE (Server-Sent Events)**:

   ```bash
   npm run start:sse
   ```

   URL: `http://localhost:3000/sse`

3. **stdio** (for command-line usage):

   ```bash
   npm start
   ```

## 🔍 Troubleshooting

### Common Issues

1. **Connection Errors**:
   - Ensure the server is running: `npm run start:http`
   - Check the URL: `http://localhost:3000/mcp`
   - Verify CORS settings if using from browser

2. **Authentication Issues**:
   - Verify BigCommerce API credentials in `.env`
   - Check API key permissions in BigCommerce admin

3. **Tool Not Found**:
   - Ensure tools are properly loaded: `npm run list-tools`
   - Check store hash parameter

### Debug Mode

Enable debug logging by setting:

```env
DEBUG=true
NODE_ENV=development
```

## 📊 Response Format Details

### Successful Tool Calls

```json
{
  "content": [
    {
      "type": "text",
      "text": "Found 25 items:\n{\n  \"data\": [...],\n  \"meta\": {...}\n}"
    }
  ],
  "_meta": {
    "toolName": "get_all_products",
    "resultType": "object",
    "hasData": true,
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
}
```

### Error Responses

```json
{
  "content": [
    {
      "type": "text",
      "text": "Error: Invalid API key or store hash"
    }
  ],
  "isError": true,
  "_meta": {
    "toolName": "get_all_products",
    "resultType": "object",
    "hasData": false,
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
}
```

## 🆕 What's New

### Compatibility Improvements

- ✅ **Enhanced Response Format**: Better structured responses for Agno parsing
- ✅ **Error Handling**: Explicit error detection and user-friendly messages  
- ✅ **CORS Support**: Web-based MCP client compatibility
- ✅ **Health Checks**: Server status monitoring
- ✅ **Metadata**: Additional context for debugging and optimization
- ✅ **Multiple Transports**: Support for HTTP, SSE, and stdio
- ✅ **Test Suite**: Automated compatibility testing

### Breaking Changes

None! The changes are backward compatible with existing MCP clients while adding Agno-specific enhancements.

## 📚 Additional Resources

- [Agno Documentation](https://docs.agno.ai/)
- [MCP Protocol Specification](https://modelcontextprotocol.io/)
- [BigCommerce API Reference](https://developer.bigcommerce.com/api-docs)

## 🤝 Contributing

To improve Agno compatibility further:

1. Test with your specific Agno use cases
2. Report issues with detailed error messages
3. Suggest improvements for response formatting
4. Add additional tool metadata as needed

The server is now fully compatible with Agno's MCPTools and ready for production use!
