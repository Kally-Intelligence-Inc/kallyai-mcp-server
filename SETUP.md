# KallyAI MCP Server Setup Guide

This guide walks you through the interactive authentication setup for the KallyAI MCP Server.

## Quick Setup

The easiest way to authenticate is using the interactive setup command:

```bash
npx kallyai-mcp-server --setup
```

This will:
1. Open the KallyAI web app in your browser
2. Guide you through signing in or creating an account
3. Help you generate and save your API token
4. Verify the token works
5. Save it securely to `~/.kallyai_token.json`

## Step-by-Step Instructions

### 1. Run Setup Command

```bash
npx kallyai-mcp-server --setup
```

You'll see a welcome screen:

```
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║              🚀 KallyAI MCP Server Setup 🚀                  ║
║                                                               ║
║  Welcome! Let's get you authenticated to use KallyAI.        ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
```

### 2. Browser Opens Automatically

The setup will open https://kallyai.com/app in your default browser.

**If the browser doesn't open:**
- Manually open the URL shown in the terminal
- Continue with the next steps

### 3. Sign In or Create Account

In the KallyAI web app:
- **Existing users**: Sign in with your credentials
- **New users**: Create a free account (no credit card required for trial)

### 4. Generate API Token

Once signed in:
1. Go to **Settings** → **Developer** → **API Tokens**
2. Click **Create New Token** or copy an existing token
3. The token will be shown as a JSON object:

```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "expires_in": 3600
}
```

### 5. Paste Token in Terminal

Return to your terminal and paste the entire JSON object when prompted:

```
🔑 Paste your token JSON here:
```

### 6. Verification

The setup will verify your token by making a test API call. You'll see:

```
🔍 Verifying token...
✅ Authentication successful!
📊 Plan: trial (active)
```

### 7. Token Saved

Your token is saved securely:

```
💾 Token saved to: /Users/yourname/.kallyai_token.json
🔒 File permissions: 600 (owner read/write only)
```

## Manual Setup (Alternative)

If you prefer to set up manually without the interactive flow:

1. Get your token from https://kallyai.com/app → Settings → Developer → API Tokens

2. Create `~/.kallyai_token.json` manually:

```json
{
  "access_token": "your_access_token_here",
  "refresh_token": "your_refresh_token_here",
  "expires_at": 1234567890
}
```

3. Set secure permissions:

```bash
chmod 600 ~/.kallyai_token.json
```

## Token Security

The token file is stored with **0600 permissions** (read/write for owner only) to protect your credentials.

**Security best practices:**
- Never share your token file
- Don't commit tokens to version control
- Regenerate tokens if compromised
- The MCP server will automatically refresh expired tokens

## Troubleshooting

### "Token verification failed"

**Cause**: The token may be invalid or expired.

**Solution**:
1. Get a fresh token from https://kallyai.com/app
2. Run setup again: `npx kallyai-mcp-server --setup`

### "Invalid token format"

**Cause**: The JSON was not copied completely or is malformed.

**Solution**:
- Make sure you copied the **entire** JSON object
- Include the opening `{` and closing `}`
- Don't add or remove any fields

### "Token file has insecure permissions"

**Cause**: The file permissions are too open (e.g., world-readable).

**Solution**:
```bash
chmod 600 ~/.kallyai_token.json
```

### "Could not open browser automatically"

**Cause**: The system doesn't have a default browser configured or permission was denied.

**Solution**:
- Manually open https://kallyai.com/app in any browser
- Continue with the setup flow

### Re-running Setup

If you want to replace your existing token:

```bash
npx kallyai-mcp-server --setup
```

The setup will ask if you want to overwrite the existing token:

```
⚠️  Found existing token at: /Users/yourname/.kallyai_token.json

Do you want to overwrite it? (yes/no):
```

Type `yes` to continue with a new token.

## Command Line Options

```bash
# Interactive setup
npx kallyai-mcp-server --setup
npx kallyai-mcp-server -s

# Show help
npx kallyai-mcp-server --help
npx kallyai-mcp-server -h

# Show version
npx kallyai-mcp-server --version
npx kallyai-mcp-server -v

# Start MCP server (normal operation)
npx kallyai-mcp-server
```

## Next Steps

After completing setup:

1. **Configure Claude Desktop**: Add the MCP server to your Claude Desktop config
2. **Restart Claude Desktop**: Quit and reopen the application
3. **Start using**: Try "Call a restaurant and make a reservation"

See [README.md](README.md) for full installation and usage instructions.

## Support

Need help?
- Email: support@kallyintelligence.com
- Issues: https://github.com/Kally-Intelligence-Inc/kallyai-mcp-server/issues
- Documentation: https://github.com/Kally-Intelligence-Inc/kallyai-mcp-server
