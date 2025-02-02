# MCP Inspector Integration Guide

## Overview
This guide explains how to integrate and test the Project Assistant using the MCP Inspector tool. The MCP Inspector provides a graphical interface for interacting with our MCP server and testing its functionality.

## Prerequisites
- Node.js installed
- Project Assistant repository cloned
- @modelcontextprotocol/inspector installed globally:
  ```bash
  npm install -g @modelcontextprotocol/inspector
  ```

## Step-by-Step Integration

### 1. Start the MCP Server
```bash
# Navigate to project directory
cd project-assistant

# Start the server
node build/index.js

# Expected output:
# Project Assistant MCP server running on stdio
```

### 2. Launch MCP Inspector
```bash
# In a new terminal window
cd project-assistant
npx @modelcontextprotocol/inspector gui
```

### 3. Connect to Server
In the MCP Inspector interface (http://localhost:5173):

1. Configure Connection:
   - Transport Type: "STDIO"
   - Command: Full path to index.js (e.g., `C:\Users\[username]\dev\mcp-servers\project-assistant\build\index.js`)
   - Arguments: Leave empty

2. Click "Connect"

### 4. Using the Tools

#### Analyze Code Complexity
1. Select the "analyze_complexity" tool
2. Enter path to analyze:
   - Single file: Use absolute path (e.g., `C:\Users\[username]\dev\mcp-servers\project-assistant\src\core\analyzers\complexity.ts`)
   - Directory: Use directory path (e.g., `C:\Users\[username]\dev\mcp-servers\project-assistant\src`)
3. Configure options:
   - recursive: true/false (for directory analysis)
   - format: 'detailed' or 'summary'
4. Click "Execute"

Example File Analysis Response:
```json
{
  "type": "file",
  "path": "src/core/analyzers/complexity.ts",
  "metrics": {
    "complexity": {
      "cyclomatic": 29,
      "cognitive": 44,
      "maintainability": -1
    },
    "summary": {
      "status": "fail",
      "issues": [
        "High cyclomatic complexity (29)",
        "High cognitive complexity (44)",
        "Low maintainability index (-1.00)"
      ]
    }
  }
}
```

Example Directory Analysis Response:
```json
{
  "type": "directory",
  "path": "src/core/analyzers",
  "metrics": {
    "totalFiles": 3,
    "averageComplexity": {
      "cyclomatic": 15.3,
      "cognitive": 22.7,
      "maintainability": 45.2
    },
    "worstFiles": [
      {
        "path": "src/core/analyzers/complexity.ts",
        "metrics": {
          "cyclomatic": 29,
          "cognitive": 44,
          "maintainability": -1
        }
      }
    ],
    "summary": {
      "status": "fail",
      "issues": [
        "High average cyclomatic complexity (15.30)",
        "High average cognitive complexity (22.70)",
        "Low average maintainability index (45.20)"
      ]
    }
  },
  "children": [...]
}
```

## Testing Scenarios

### Testing Scenarios

#### 1. Single File Analysis
Test analyzing individual files:

1. Simple File:
```typescript
// test/fixtures/simple.ts
function add(a: number, b: number): number {
  return a + b;
}
```
Expected:
- Low complexity scores
- Pass status
- No issues reported

2. Complex File:
```typescript
// src/core/analyzers/complexity.ts
```
Expected:
- Higher complexity scores
- Warning or fail status
- Multiple issues reported

#### 2. Directory Analysis
Test analyzing directories:

1. Small Directory:
```bash
# Analyze a directory with few files
analyze_complexity --path src/utils
```
Expected:
- Total files count
- Average complexity metrics
- List of worst files
- Directory summary status

2. Large Directory:
```bash
# Analyze entire source directory
analyze_complexity --path src --recursive true
```
Expected:
- Hierarchical analysis results
- Nested directory metrics
- Overall project health indicators

#### 3. Error Cases
Test error handling:

1. Invalid Paths:
   - Non-existent file/directory: `src/nonexistent.ts`
   - Expected: FileSystemError

2. Invalid Files:
   - File with syntax errors
   - Expected: AnalysisError

3. Unsupported Files:
   - Non-TypeScript/JavaScript files
   - Expected: InvalidFileType error

4. Permission Issues:
   - Inaccessible directories
   - Expected: FileSystemError

## Troubleshooting

### Common Issues

1. Connection Errors
   - Verify server is running
   - Check command path is correct
   - Ensure no other processes are using port 5173

2. Path Issues
   - Use absolute paths if relative paths fail
   - Check for correct path separators
   - Verify file permissions

3. Analysis Errors
   - Verify file exists
   - Check file has valid TypeScript syntax
   - Ensure file is readable

### Solutions

1. Server Won't Start
   ```bash
   # Kill any existing node processes
   taskkill /F /IM node.exe
   # Start server with full path
   node "C:\full\path\to\build\index.js"
   ```

2. Inspector Connection Issues
   ```bash
   # Start inspector with specific port
   npx @modelcontextprotocol/inspector gui --port 5174
   ```

3. Path Resolution
   ```bash
   # Use forward slashes in paths
   src/core/analyzers/complexity.ts
   # Or escaped backslashes
   src\\core\\analyzers\\complexity.ts
   ```

## Best Practices

1. Server Management
   - Run server in dedicated terminal
   - Keep server logs visible
   - Monitor for errors

2. Testing
   - Start with simple files
   - Test edge cases
   - Verify error handling
   - Document unexpected behavior

3. Path Handling
   - Use consistent path format
   - Prefer absolute paths
   - Document path requirements

## Next Steps

1. Automation
   - Create test scripts
   - Add CI/CD integration
   - Automate common tests

2. Monitoring
   - Add logging
   - Track usage patterns
   - Monitor performance

3. Documentation
   - Update for new features
   - Add troubleshooting guides
   - Include example scripts
