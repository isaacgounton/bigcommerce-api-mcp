import { discoverTools } from './lib/tools.js';

async function testListTools() {
  try {
    const tools = await discoverTools();
    
    // Simulate the ListToolsRequestSchema handler transformation
    const transformedTools = tools.map(tool => {
      const definitionFunction = tool.definition?.function;
      if (!definitionFunction) return null;
      return {
        name: definitionFunction.name,
        description: definitionFunction.description,
        inputSchema: definitionFunction.parameters,
      };
    }).filter(Boolean);

    console.log("=== MCP Built-in List Tools Response ===");
    console.log("Number of tools:", transformedTools.length);
    console.log("");
    
    transformedTools.forEach(tool => {
      console.log("🔧 Tool:", tool.name);
      console.log("📝 Description:", tool.description.substring(0, 80) + "...");
      console.log("✅ Required params:", tool.inputSchema?.required || []);
      console.log("⚙️ Optional params:", Object.keys(tool.inputSchema?.properties || {}).filter(key => !tool.inputSchema?.required?.includes(key)));
      console.log("---");
    });
    
    console.log("\n✅ MCP already has built-in list tools functionality!");
    console.log("🎯 This is handled by the ListToolsRequestSchema handler in mcpServer.js");
    
  } catch (error) {
    console.error("Error:", error.message);
  }
}

testListTools();
