import { toolPaths } from "../tools/paths.js";

/**
 * Discovers and loads available tools from the tools directory
 * @returns {Array} Array of tool objects
 */
export async function discoverTools() {
  const tools = await Promise.all(
    toolPaths.map(async (file) => {
      const { apiTool } = await import(`../tools/${file}`);
      return { ...apiTool, path: file };
    })
  );

  // deduplicate tool names
  const nameCounts = {};

  return tools.map((tool) => {
    const name = tool.definition?.function?.name;
    if (!name) return tool;

    nameCounts[name] = (nameCounts[name] || 0) + 1;

    if (nameCounts[name] > 1) {
      tool.definition.function.name = `${name}_${nameCounts[name]}`;
    }

    return tool;
  });
}
