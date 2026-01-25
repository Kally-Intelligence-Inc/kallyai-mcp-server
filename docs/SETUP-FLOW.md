# Setup Flow Implementation Details

This document describes the technical implementation of the `--setup` command.

## Overview

The setup command (`npx kallyai-mcp-server --setup`) provides an interactive CLI flow to help users authenticate with the KallyAI API.

## Architecture

### File Structure

```
src/
├── cli/
│   └── setup.ts          # Interactive setup implementation
├── index.ts              # Main entry point (handles --setup flag)
└── services/
    ├── token-manager.ts  # Token reading/writing/refreshing
    └── api-client.ts     # API request handling
```

### Flow Diagram

```
User runs: npx kallyai-mcp-server --setup
           ↓
    index.ts parses args
           ↓
    Detects --setup flag
           ↓
    Imports cli/setup.js
           ↓
    runSetup() executes
           ↓
    ┌─────────────────────┐
    │ Welcome Screen      │
    └─────────────────────┘
           ↓
    ┌─────────────────────┐
    │ Check Existing Token│ → If exists, ask to overwrite
    └─────────────────────┘
           ↓
    ┌─────────────────────┐
    │ Show Instructions   │
    └─────────────────────┘
           ↓
    ┌─────────────────────┐
    │ Open Browser        │ → https://kallyai.com/app
    │ (using 'open' pkg)  │
    └─────────────────────┘
           ↓
    ┌─────────────────────┐
    │ Prompt for Token    │ → User pastes JSON
    └─────────────────────┘
           ↓
    ┌─────────────────────┐
    │ Parse & Validate    │ → Max 3 attempts
    └─────────────────────┘
           ↓
    ┌─────────────────────┐
    │ Verify Token        │ → Call users/me/subscription
    └─────────────────────┘
           ↓
    ┌─────────────────────┐
    │ Save to File        │ → ~/.kallyai_token.json
    │ Set permissions 600 │
    └─────────────────────┘
           ↓
    ┌─────────────────────┐
    │ Success Message     │
    │ Next Steps          │
    └─────────────────────┘
```

## Implementation Details

### 1. Argument Parsing (index.ts)

```typescript
async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--setup") || args.includes("-s")) {
    const { runSetup } = await import("./cli/setup.js");
    await runSetup();
    process.exit(0);
  }
  // ... other commands
}
```

**Key Points:**
- Checks for `--setup` or `-s` flags
- Dynamically imports setup module only when needed
- Exits after setup completes

### 2. Setup Flow (cli/setup.ts)

#### a. Welcome Screen

```typescript
console.log(`
╔═══════════════════════════════════════════════════════════════╗
║              🚀 KallyAI MCP Server Setup 🚀                  ║
╚═══════════════════════════════════════════════════════════════╝
`);
```

#### b. Check Existing Token

```typescript
try {
  const existingToken = await readFile(TOKEN_FILE, "utf-8");
  if (existingToken) {
    const overwrite = await prompt(rl, "Do you want to overwrite it? (yes/no): ");
    if (overwrite.toLowerCase() !== "yes") {
      console.log("Setup cancelled. Using existing token.");
      return;
    }
  }
} catch {
  // File doesn't exist, continue
}
```

**Behavior:**
- Non-destructive by default
- Requires explicit confirmation to overwrite
- Gracefully handles missing files

#### c. Browser Launch

```typescript
async function openBrowser(url: string): Promise<void> {
  const { default: open } = await import("open");
  try {
    await open(url);
  } catch (error) {
    console.error("⚠️  Could not open browser automatically");
    console.log(`\nPlease open this URL manually: ${url}\n`);
  }
}
```

**Features:**
- Dynamic import of `open` package
- Fallback message if browser launch fails
- Works on macOS, Windows, Linux

#### d. Token Input & Parsing

```typescript
function parseTokenInput(input: string): TokenData | null {
  try {
    const data = JSON.parse(input);

    if (!data.access_token || !data.refresh_token) {
      return null;
    }

    // Calculate expires_at if not provided
    let expiresAt = data.expires_at;
    if (!expiresAt && data.expires_in) {
      const now = Math.floor(Date.now() / 1000);
      expiresAt = now + data.expires_in;
    }

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: expiresAt,
    };
  } catch {
    return null;
  }
}
```

**Features:**
- Validates required fields
- Handles both `expires_at` and `expires_in` formats
- Returns null on validation failure
- 3 retry attempts for user input

#### e. Token Verification

```typescript
async function verifyToken(accessToken: string): Promise<boolean> {
  try {
    const subscription = await makeApiRequest<SubscriptionResponse>(
      "users/me/subscription",
      "GET",
      undefined,
      undefined,
      accessToken
    );
    console.log(`✅ Authentication successful!`);
    console.log(`📊 Plan: ${subscription.plan?.type}`);
    return true;
  } catch (error) {
    console.error("❌ Token verification failed:", handleApiError(error));
    return false;
  }
}
```

**Why `/users/me/subscription`?**
- Verifies authentication works
- Shows user their plan status
- Provides immediate value
- Low-cost API call

#### f. Token Storage

```typescript
async function saveToken(tokenData: TokenData): Promise<void> {
  const content = JSON.stringify(tokenData, null, 2);
  await writeFile(TOKEN_FILE, content, { mode: 0o600 });

  // Double-check permissions (some systems need explicit chmod)
  await chmod(TOKEN_FILE, 0o600);

  console.log(`💾 Token saved to: ${TOKEN_FILE}`);
  console.log(`🔒 File permissions: 600 (owner read/write only)`);
}
```

**Security Features:**
- File created with 0600 permissions (owner read/write only)
- Explicit chmod call for cross-platform compatibility
- User-friendly success messages
- Pretty-printed JSON for manual inspection

## CLI Commands

### --setup / -s

Run interactive authentication setup.

```bash
npx kallyai-mcp-server --setup
npx kallyai-mcp-server -s
```

### --help / -h

Display help information.

```bash
npx kallyai-mcp-server --help
npx kallyai-mcp-server -h
```

### --version / -v

Show version number.

```bash
npx kallyai-mcp-server --version
npx kallyai-mcp-server -v
```

## Error Handling

### Token Parsing Errors

- **Invalid JSON**: User gets 3 attempts to paste valid JSON
- **Missing fields**: Clear error message about required fields
- **After 3 failures**: Exit with helpful tips

### Network Errors

- **Browser launch fails**: Show manual URL
- **API verification fails**: Display error with actionable advice
- **Connection timeout**: Suggest checking internet connection

### File System Errors

- **Permission denied**: Clear message about file permissions
- **Disk full**: Standard system error message
- **Invalid path**: Should never happen (using homedir())

## Dependencies

### Production Dependencies

```json
{
  "open": "^11.0.0"  // Browser launching
}
```

### Built-in Node.js Modules

- `fs/promises` - File operations
- `os` - Home directory resolution
- `path` - Path joining
- `readline` - User input prompts

## Testing

### Manual Testing

```bash
# Test setup flow
npm run build
node dist/index.js --setup

# Test with existing token
touch ~/.kallyai_token.json
echo '{"access_token":"test","refresh_token":"test","expires_at":1234567890}' > ~/.kallyai_token.json
node dist/index.js --setup
# Should ask to overwrite

# Test help
node dist/index.js --help

# Test version
node dist/index.js --version
```

### Edge Cases Tested

1. ✅ Existing token file
2. ✅ User cancels overwrite
3. ✅ Invalid JSON input
4. ✅ Missing required fields
5. ✅ Network failures
6. ✅ Browser launch failures
7. ✅ File permission errors

## Future Improvements

### Potential Enhancements

1. **OAuth Flow**: Direct OAuth instead of manual token paste
2. **QR Code**: Generate QR code for mobile sign-in
3. **Auto-detect**: Check if user is already logged in via browser cookies
4. **Multiple Profiles**: Support multiple accounts/tokens
5. **Token Rotation**: Automatic token rotation policy
6. **Biometric Auth**: Integrate with OS keychain for secure storage

### Backwards Compatibility

The setup command is **optional**. Users can still:
- Manually create `~/.kallyai_token.json`
- Use existing tokens
- Get tokens from the web app directly

This ensures the MCP server works even if the setup flow is broken or unavailable.

## Related Documentation

- [README.md](../README.md) - Main documentation
- [SETUP.md](../SETUP.md) - User-facing setup guide
- [IMPLEMENTATION.md](../IMPLEMENTATION.md) - Overall architecture
