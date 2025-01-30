# Understanding MCP Schema Types

## Request Schema Types

### 1. ListResourcesRequestSchema
Used to get a list of all available resources from the server.
- Input: None
- Output: List of resources with their URIs, types, and descriptions
- Example: Getting a list of all available notes in a note-taking app

```typescript
import { ListResourcesRequestSchema } from "@modelcontextprotocol/sdk/types.js";

// Lists all available resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [{ uri: "note:///1", mimeType: "text/plain" }]
  };
});
```

### 2. ReadResourceRequestSchema
Used to read the content of a specific resource.
- Input: Resource URI
- Output: Resource content and metadata
- Example: Reading the content of a specific note

```typescript
import { ReadResourceRequestSchema } from "@modelcontextprotocol/sdk/types.js";

// Reads a specific resource
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  return {
    contents: [{
      uri: request.params.uri,
      mimeType: "text/plain",
      text: "Content here"
    }]
  };
});
```

### 3. ListToolsRequestSchema
Used to discover what operations are available.
- Input: None
- Output: List of available tools and their input requirements
- Example: Finding out what actions you can perform (create/delete/update)

```typescript
import { ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

// Lists available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [{
      name: "create_note",
      description: "Creates a new note",
      inputSchema: {
        type: "object",
        properties: {
          title: { type: "string" }
        }
      }
    }]
  };
});
```

### 4. CallToolRequestSchema
Used to execute a specific tool/operation.
- Input: Tool name and required parameters
- Output: Result of the operation
- Example: Creating a new note with provided content

```typescript
import { CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";

// Executes a tool
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "create_note") {
    return {
      content: [{ type: "text", text: "Note created" }]
    };
  }
});
```

### 5. ListPromptsRequestSchema
Used to discover available AI-assisted operations.
- Input: None
- Output: List of available prompts
- Example: Finding out what AI operations are available

```typescript
import { ListPromptsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

// Lists available prompts
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: [{
      name: "summarize",
      description: "Summarizes content"
    }]
  };
});
```

### 6. GetPromptRequestSchema
Used to execute an AI-assisted operation.
- Input: Prompt name
- Output: Structured conversation for AI processing
- Example: Getting an AI summary of notes

```typescript
import { GetPromptRequestSchema } from "@modelcontextprotocol/sdk/types.js";

// Gets a specific prompt
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  return {
    messages: [{
      role: "user",
      content: { type: "text", text: "Please analyze:" }
    }]
  };
});
```

## Key Points

1. List vs Read/Call/Get:
   - List schemas (ListResources, ListTools, ListPrompts) discover available items
   - Read/Call/Get schemas (ReadResource, CallTool, GetPrompt) use specific items

2. Schema Relationships:
   - First use List schemas to discover available items
   - Then use specific schemas to interact with those items

3. Common Pattern:
   - List → Discover available items
   - Read/Call/Get → Use specific items
   - Example: List tools → Call specific tool
