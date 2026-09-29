#!/usr/bin/env node
// Live read-only MCP smoke test against the public KRS API.

import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const client = new Client({ name: "mcp-krs-smoke", version: "1.0.0" });
const transport = new StdioClientTransport({
  command: process.execPath,
  args: ["dist/index.js"],
  stderr: "pipe",
});

try {
  await client.connect(transport);
  const { tools } = await client.listTools();
  assert.deepEqual(tools.map((tool) => tool.name), ["get_entity", "get_entity_full", "get_board"]);

  const result = await client.callTool({
    name: "get_board",
    arguments: { krs: "28860" },
  });
  assert.notEqual(result.isError, true, JSON.stringify(result.structuredContent));
  assert.match(result.content?.[0]?.text ?? "", /ORLEN/i);
  assert.ok((result.structuredContent?.citations ?? []).length > 0, "citations are required");
  console.log("PASS tools/list: 3 tools");
  console.log("PASS get_board: public KRS record returned with citations");
} finally {
  await client.close();
}
