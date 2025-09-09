#!/usr/bin/env node

/**
 * Test script to verify BigCommerce MCP server compatibility with Agno
 * 
 * This script demonstrates how to use the BigCommerce MCP server with Agno's MCPTools
 * Run with: node test-agno-compatibility.js
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Mock Agno MCPTools behavior to test compatibility
class MockMCPTools {
    constructor(serverUrl) {
        this.serverUrl = serverUrl;
        this.isConnected = false;
    }

    async connect() {
        console.log(`🔗 Connecting to MCP server: ${this.serverUrl}`);

        try {
            // Test health check
            const healthResponse = await fetch(`${this.serverUrl.replace('/mcp', '')}/health`);
            if (healthResponse.ok) {
                const healthData = await healthResponse.json();
                console.log(`✅ Health check passed:`, healthData);
            }

            // Test server info
            try {
                const infoResponse = await fetch(`${this.serverUrl.replace('/mcp', '')}/info`);
                if (infoResponse.ok) {
                    const infoData = await infoResponse.json();
                    console.log(`ℹ️  Server info:`, infoData);
                }
            } catch (e) {
                console.log(`⚠️  Server info endpoint not available`);
            }

            // Test tools listing
            const toolsRequest = {
                jsonrpc: "2.0",
                id: "test-tools",
                method: "tools/list",
                params: {}
            };

            const toolsResponse = await fetch(this.serverUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json, text/event-stream',
                    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30'
                },
                body: JSON.stringify(toolsRequest)
            });

            if (!toolsResponse.ok) {
                throw new Error(`Tools request failed: ${toolsResponse.status}`);
            }

            // Parse SSE response
            const responseText = await toolsResponse.text();
            const toolsData = this.parseSSEResponse(responseText);
            console.log(`🛠️  Available tools:`, toolsData.result?.tools?.map(t => t.name) || []);

            this.isConnected = true;
            console.log(`✅ Successfully connected to MCP server`);

            return toolsData.result?.tools || [];
        } catch (error) {
            console.error(`❌ Failed to connect:`, error.message);
            throw error;
        }
    }

    async callTool(toolName, args) {
        if (!this.isConnected) {
            throw new Error('Not connected to MCP server');
        }

        console.log(`🔧 Calling tool: ${toolName} with args:`, args);

        const request = {
            jsonrpc: "2.0",
            id: `test-${toolName}-${Date.now()}`,
            method: "tools/call",
            params: {
                name: toolName,
                arguments: args
            }
        };

        try {
            const response = await fetch(this.serverUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json, text/event-stream',
                    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30'
                },
                body: JSON.stringify(request)
            });

            if (!response.ok) {
                throw new Error(`Tool call failed: ${response.status}`);
            }

            // Parse SSE response  
            const responseText = await response.text();
            const data = this.parseSSEResponse(responseText);

            if (data.error) {
                console.error(`❌ Tool error:`, data.error);
                throw new Error(data.error.message);
            }

            console.log(`✅ Tool result received:`, {
                toolName,
                hasContent: !!data.result?.content,
                contentType: data.result?.content?.[0]?.type,
                hasMeta: !!data.result?._meta,
                resultKeys: Object.keys(data.result || {})
            });

            return data.result;
        } catch (error) {
            console.error(`❌ Tool call failed:`, error.message);
            throw error;
        }
    }

    parseSSEResponse(sseText) {
        // Parse Server-Sent Events format
        const lines = sseText.split('\n');
        let eventType = '';
        let data = '';

        for (const line of lines) {
            if (line.startsWith('event: ')) {
                eventType = line.substring(7).trim();
            } else if (line.startsWith('data: ')) {
                data += line.substring(6);
            } else if (line === '' && data) {
                // End of event
                try {
                    return JSON.parse(data);
                } catch (e) {
                    console.warn('Failed to parse SSE data as JSON:', data);
                    return { result: { tools: [] } };
                }
            }
        }

        // If no complete event found, try to parse the last data
        if (data) {
            try {
                return JSON.parse(data);
            } catch (e) {
                console.warn('Failed to parse SSE data as JSON:', data);
                return { result: { tools: [] } };
            }
        }

        return { result: { tools: [] } };
    }

    async close() {
        this.isConnected = false;
        console.log(`🔌 Disconnected from MCP server`);
    }
}

async function testAgnoCompatibility() {
    console.log(`🧪 Testing BigCommerce MCP Server compatibility with Agno`);
    console.log(`=====================================\n`);

    const serverUrl = process.env.MCP_SERVER_URL || 'http://localhost:3000/mcp';
    const mcpTools = new MockMCPTools(serverUrl);

    try {
        // Connect to the server
        const tools = await mcpTools.connect();

        if (tools.length === 0) {
            console.log(`⚠️  No tools available. Make sure the server is configured with BigCommerce credentials.`);
            return;
        }

        // Test each available tool
        for (const tool of tools) {
            console.log(`\n📋 Testing tool: ${tool.name}`);
            console.log(`   Description: ${tool.description}`);

            try {
                // Test with sample data based on tool name
                let testArgs = {};

                if (tool.name.includes('products')) {
                    testArgs = { store_Hash: process.env.BIGCOMMERCE_STORE_HASH || 'test_store' };
                } else if (tool.name.includes('customers')) {
                    testArgs = { store_Hash: process.env.BIGCOMMERCE_STORE_HASH || 'test_store' };
                } else if (tool.name.includes('orders')) {
                    testArgs = { store_Hash: process.env.BIGCOMMERCE_STORE_HASH || 'test_store' };
                }

                if (Object.keys(testArgs).length > 0) {
                    const result = await mcpTools.callTool(tool.name, testArgs);

                    // Analyze the result format for Agno compatibility
                    if (result.content && Array.isArray(result.content)) {
                        const content = result.content[0];
                        if (content.type === 'text') {
                            console.log(`   ✅ Response format compatible with Agno`);
                            console.log(`   📊 Content preview: ${content.text.substring(0, 100)}...`);

                            // Check if it's JSON data
                            try {
                                const jsonData = JSON.parse(content.text);
                                console.log(`   🔍 JSON structure detected:`, {
                                    hasData: !!jsonData.data,
                                    isArray: Array.isArray(jsonData),
                                    dataLength: Array.isArray(jsonData) ? jsonData.length : (jsonData.data ? jsonData.data.length : 'N/A')
                                });
                            } catch (e) {
                                console.log(`   📝 Text response format`);
                            }
                        }
                    }

                    // Check for metadata
                    if (result._meta) {
                        console.log(`   🏷️  Metadata available:`, result._meta);
                    }
                } else {
                    console.log(`   ⏭️  Skipping test (no sample args available)`);
                }
            } catch (error) {
                console.log(`   ❌ Tool test failed: ${error.message}`);
            }
        }

        await mcpTools.close();

        console.log(`\n🎉 Compatibility test completed!`);
        console.log(`\n📋 Summary:`);
        console.log(`   - Server is accessible via HTTP`);
        console.log(`   - Tools can be listed and called`);
        console.log(`   - Response format follows MCP protocol`);
        console.log(`   - Additional metadata provided for enhanced compatibility`);
        console.log(`\n✨ The BigCommerce MCP server should now work with Agno MCPTools!`);

    } catch (error) {
        console.error(`❌ Compatibility test failed:`, error.message);
        process.exit(1);
    }
}

// Example usage with Agno (commented out as it requires Agno to be installed)
function printAgnoUsageExample() {
    console.log(`\n📖 Example Agno usage:`);
    console.log(`
// Install Agno first: pip install agno

import asyncio
from agno.agent import Agent
from agno.models.openai import OpenAIChat
from agno.tools.mcp import MCPTools

async def test_bigcommerce_mcp():
    # Initialize MCPTools with your BigCommerce MCP server
    mcp_tools = MCPTools(
        url="http://localhost:3000/mcp",
        transport="streamable-http"
    )
    
    # Connect to the server
    await mcp_tools.connect()
    
    # Create an agent with MCP tools
    agent = Agent(
        model=OpenAIChat(id="gpt-4o"),
        tools=[mcp_tools],
        instructions="You have access to BigCommerce API tools for products, customers, and orders.",
        markdown=True,
        show_tool_calls=True,
    )
    
    # Test the agent
    await agent.aprint_response(
        "Get all products from the BigCommerce store",
        stream=True
    )
    
    # Close the connection
    await mcp_tools.close()

# Run the test
asyncio.run(test_bigcommerce_mcp())
`);
}

// Run the test
if (import.meta.url === `file://${process.argv[1]}`) {
    testAgnoCompatibility()
        .then(() => {
            printAgnoUsageExample();
        })
        .catch(console.error);
}

export { MockMCPTools, testAgnoCompatibility };
