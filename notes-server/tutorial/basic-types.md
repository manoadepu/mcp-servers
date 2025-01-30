# Basic Types in MCP Server

## Core Types

### 1. String Types
```typescript
type StringTypes = {
  // Basic string for general text
  name: string;                    // "My Note"
  
  // URI string for resource identification
  uri: string;                     // "note:///1"
  
  // MIME type string for content type
  mimeType: string;                // "text/plain"
  
  // Description string for documentation
  description: string;             // "This is a note"
}
```

### 2. Object Types
```typescript
// Basic note type
type Note = {
  title: string;
  content: string;
}

// Storage type with string key
type Storage = {
  [id: string]: Note;
}

// Example usage
const notes: Storage = {
  "1": { 
    title: "First Note", 
    content: "Content here" 
  }
}
```

### 3. Response Types
```typescript
// Basic text response
type TextResponse = {
  type: "text";
  text: string;
}

// Resource response
type ResourceResponse = {
  uri: string;
  mimeType: string;
  text: string;
}

// Error response
type ErrorResponse = {
  type: "error";
  code: string;
  message: string;
}
```

### 4. Request Types
```typescript
// Basic request parameters
type RequestParams = {
  uri?: string;      // For resource requests
  name?: string;     // For tool requests
  arguments?: {      // For tool parameters
    [key: string]: any;
  }
}

// Full request type
type Request = {
  params: RequestParams;
}
```

## Common Type Patterns

### 1. Array Types
```typescript
// Array of resources
type ResourceList = Array<{
  uri: string;
  mimeType: string;
  name?: string;
}>

// Array of tools
type ToolList = Array<{
  name: string;
  description: string;
  inputSchema: object;
}>
```

### 2. Schema Types
```typescript
// Input schema type
type InputSchema = {
  type: "object";
  properties: {
    [key: string]: {
      type: string;
      description: string;
    }
  };
  required: string[];
}

// Example
const schema: InputSchema = {
  type: "object",
  properties: {
    title: {
      type: "string",
      description: "Note title"
    }
  },
  required: ["title"]
}
```

### 3. Message Types
```typescript
// Basic message type
type Message = {
  role: "user" | "assistant" | "system";
  content: {
    type: "text" | "resource";
    text?: string;
    resource?: ResourceResponse;
  }
}

// Message array type
type MessageList = Array<Message>
```

## Type Validation Examples

### 1. String Validation
```typescript
// URI validation
function isValidUri(uri: string): boolean {
  try {
    new URL(uri);
    return true;
  } catch {
    return false;
  }
}

// MIME type validation
function isValidMimeType(type: string): boolean {
  return /^[a-z]+\/[a-z0-9\-\+]+$/.test(type);
}
```

### 2. Object Validation
```typescript
// Note validation
function isValidNote(note: any): note is Note {
  return (
    typeof note === "object" &&
    typeof note.title === "string" &&
    typeof note.content === "string"
  );
}

// Request validation
function isValidRequest(req: any): req is Request {
  return (
    typeof req === "object" &&
    typeof req.params === "object"
  );
}
```

## Best Practices

1. Type Declaration:
   - Always declare types for data structures
   - Use interfaces for extendable types
   - Use type aliases for union types

2. Type Safety:
   - Validate input types
   - Use type guards when needed
   - Handle type errors gracefully

3. Type Documentation:
   - Document complex types
   - Include examples in comments
   - Explain type constraints

4. Type Organization:
   - Group related types together
   - Use meaningful type names
   - Keep types focused and single-purpose

## Common Type Errors

1. Type Mismatch:
```typescript
// Wrong
const note: Note = {
  title: 123,        // Should be string
  content: "text"
}

// Correct
const note: Note = {
  title: "Title",    // Correct string type
  content: "text"
}
```

2. Missing Required Fields:
```typescript
// Wrong
const response: ResourceResponse = {
  uri: "note:///1"   // Missing mimeType and text
}

// Correct
const response: ResourceResponse = {
  uri: "note:///1",
  mimeType: "text/plain",
  text: "content"
}
```

3. Invalid Type Assignment:
```typescript
// Wrong
const messages: MessageList = {
  role: "user"       // Should be an array
}

// Correct
const messages: MessageList = [{
  role: "user",
  content: { type: "text", text: "message" }
}]
