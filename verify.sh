#!/bin/bash

echo "🔍 KallyAI MCP Server Verification"
echo "=================================="
echo ""

# Check Node.js version
echo "✓ Checking Node.js version..."
node --version
echo ""

# Check if dependencies are installed
echo "✓ Checking dependencies..."
if [ -d "node_modules" ]; then
    echo "  Dependencies installed"
else
    echo "  ❌ Dependencies not found. Run: npm install"
    exit 1
fi
echo ""

# Check if build output exists
echo "✓ Checking build output..."
if [ -f "dist/index.js" ]; then
    echo "  Build output exists"
else
    echo "  ❌ Build output not found. Run: npm run build"
    exit 1
fi
echo ""

# Check if main file is executable
echo "✓ Checking if server can start..."
timeout 2 node dist/index.js 2>&1 | grep -q "KallyAI MCP server" && echo "  Server starts successfully" || echo "  ❌ Server failed to start"
echo ""

# Check TypeScript files
echo "✓ Checking source files..."
FILES=(
    "src/index.ts"
    "src/constants.ts"
    "src/types.ts"
    "src/schemas/index.ts"
    "src/services/api-client.ts"
    "src/tools/calls.ts"
    "src/tools/user.ts"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✓ $file"
    else
        echo "  ❌ $file missing"
    fi
done
echo ""

# Count tools registered
echo "✓ Counting registered tools..."
TOOL_COUNT=$(grep -c "registerTool" src/index.ts)
echo "  Found $TOOL_COUNT tools registered"
echo ""

echo "✅ Verification complete!"
echo ""
echo "Next steps:"
echo "1. Test with: npx @modelcontextprotocol/inspector node dist/index.js"
echo "2. Configure in Claude Desktop using claude-desktop-config.example.json"
echo "3. Read USAGE.md for detailed examples"
