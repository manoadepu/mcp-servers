# Understanding MCP Handler Types

## 1. Resource Handlers
Resources are read-only data that your MCP server makes available to clients. Think of them as "things you can read".

Key characteristics:
- Represent static or dynamic data
- Always have a unique URI and mimeType
- Are read-only (cannot be modified through resource handlers)
- Can be listed and accessed individually

Example use cases:
- Exposing files or documents
- Providing API responses
- Sharing configuration data
- Making database records readable

## 2. Tool Handlers
Tools are actions or operations that your MCP server can perform. Think of them as "things you can do".

Key characteristics:
- Represent executable functionality
- Can modify state or perform operations
- Take input parameters
- Return results or confirmations
- Have defined input schemas

Example use cases:
- Creating new data
- Updating existing data
- Deleting records
- Processing information
- Performing calculations
- Making API calls

## 3. Prompt Handlers
Prompts are structured conversations or queries that can be processed by AI. Think of them as "things you can ask about".

Key characteristics:
- Define AI-assisted interactions
- Can include context and resources
- Structure multi-message conversations
- Generate AI responses

Example use cases:
- Summarizing data
- Analyzing content
- Answering questions about resources
- Generating recommendations
- Processing natural language queries

## 4. Transport Handler
Transport is the communication layer between the MCP server and clients. Think of it as "how things talk".

Key characteristics:
- Manages data transfer
- Handles communication protocol
- Processes incoming requests
- Sends responses back to clients

Example implementation:
```typescript
// Using stdio transport
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
```

## How They Work Together

1. Transport Handler:
   - Receives requests from clients
   - Routes them to appropriate handlers
   - Returns responses

2. Resource Handlers:
   - List available resources
   - Provide access to resource content

3. Tool Handlers:
   - List available tools
   - Execute tool operations
   - Return results

4. Prompt Handlers:
   - List available prompts
   - Structure AI conversations
   - Return AI-processed responses

Example flow:
1. Client connects via Transport
2. Client can:
   - List/read Resources
   - Execute Tools
   - Use Prompts
3. Server processes requests
4. Transport sends responses back

This separation of concerns allows MCP servers to provide a clear and organized interface for different types of operations while maintaining a structured and maintainable codebase.
