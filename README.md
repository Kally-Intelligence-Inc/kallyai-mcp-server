# KallyAI MCP Server

MCP (Model Context Protocol) server for KallyAI API - an AI phone assistant that makes calls on your behalf.

## Overview

This MCP server enables LLM agents to interact with the KallyAI API to:
- Make AI phone calls for restaurant reservations, medical appointments, hotel bookings, and general inquiries
- Retrieve call history and details
- Get call transcripts
- Check subscription status and usage statistics

## Features

### Tools

1. **kallyai_create_call** - Make an AI phone call
   - Restaurant reservations
   - Medical appointments
   - Hotel bookings
   - General inquiries

2. **kallyai_list_calls** - List call history with pagination

3. **kallyai_get_call** - Get detailed call information

4. **kallyai_get_transcript** - Retrieve conversation transcript

5. **kallyai_get_subscription** - Check subscription status

6. **kallyai_get_statistics** - Get usage and quota information

## Quick Start

### Step 1: Authenticate (one-time)

```bash
npx kallyai-mcp-server --setup
```

Follow the prompts to sign in at https://kallyai.com/app

### Step 2: Install in Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "kallyai": {
      "command": "npx",
      "args": ["-y", "kallyai-mcp-server"]
    }
  }
}
```

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

**Linux**: `~/.config/Claude/claude_desktop_config.json`

### Step 3: Restart Claude Desktop

Done! Try: "Call a restaurant and make a reservation"

## Verification

Test the server:
```bash
npx kallyai-mcp-server
# Should start successfully without errors
```

Check authentication:
```bash
# Verify token file exists
ls -la ~/.kallyai_token.json
```

## Troubleshooting

### "Authentication failed" or "No token found"
- Run `npx kallyai-mcp-server --setup` to re-authenticate
- Make sure you completed the sign-in flow at https://kallyai.com/app

### "Command not found: npx"
- Install Node.js from https://nodejs.org (version 18 or higher)
- Restart your terminal after installation

### "Server not showing in Claude Desktop"
- Check your config file path is correct for your OS
- Verify JSON syntax is valid (no trailing commas)
- Restart Claude Desktop completely (quit and reopen)

### "quota_exceeded" error
- You've used all available minutes
- Upgrade your plan at https://kallyai.com/app/settings

## Authentication

The MCP server uses automatic token management:

1. **Automatic token management**: Reads tokens from `~/.kallyai_token.json`
2. **Auto-refresh**: Automatically refreshes expired tokens
3. **No manual token passing**: Users don't need to provide tokens in tool parameters

The authentication token is stored in `~/.kallyai_token.json` and used automatically by all MCP tools.

## Advanced Usage

### As a stdio server (local development)

```bash
npm install
npm run build
npm start
```

### As an HTTP server (remote)

```bash
npm install
npm run build
TRANSPORT=http PORT=3000 npm start
```

## Configuration

Environment variables:
- `TRANSPORT`: Set to `http` for HTTP server, default is `stdio`
- `PORT`: HTTP server port (default: 3000)
- `ALLOWED_ORIGINS`: Comma-separated list of allowed CORS origins for HTTP mode (default: `https://claude.ai,https://www.anthropic.com`)

### Security Features (HTTP Mode)

When running in HTTP mode, the server includes:
- **CORS Protection**: Restricts cross-origin requests to allowed domains
- **Rate Limiting**: 100 requests per 15 minutes per IP address
- **Security Headers**: Helmet middleware with CSP and HSTS
- **Request Size Limits**: 100kb maximum payload size

## Example Tool Calls

### Create a restaurant reservation

```json
{
  "task_category": "restaurant",
  "task_description": "Reserve a table for 4 people at 7pm",
  "respondent_phone": "+14155551234",
  "business_name": "Italian Bistro",
  "user_name": "John Smith",
  "party_size": 4,
  "appointment_date": "2026-01-28",
  "appointment_time": "19:00",
  "timezone": "America/New_York"
}
```

Note: No `access_token` parameter needed - authentication is automatic!

### Schedule a medical appointment

```json
{
  "task_category": "clinic",
  "task_description": "Schedule a dental checkup",
  "respondent_phone": "+14155551234",
  "user_name": "Jane Doe",
  "time_preference_text": "morning before 11am",
  "timezone": "America/New_York"
}
```

### General inquiry

```json
{
  "task_category": "general",
  "task_description": "Ask if they have iPhone 15 in stock and the price",
  "respondent_phone": "+34900000000",
  "business_name": "Phone Store",
  "call_language": "es",
  "timezone": "Europe/Madrid"
}
```

**Tested successfully!** See [TEST-RESULTS.md](TEST-RESULTS.md) for verification.

## Response Formats

All tools support two response formats:
- `markdown` (default): Human-readable formatted text
- `json`: Machine-readable structured data

## Error Handling

The server provides detailed error messages for common scenarios:
- `quota_exceeded`: User out of minutes, needs to upgrade
- `missing_phone_number`: Invalid phone number format
- `emergency_number`: Cannot call emergency services
- `country_restriction`: Country not supported
- `call_not_found`: Call ID doesn't exist

## Development

```bash
# Install dependencies
npm install

# Development mode with auto-reload
npm run dev

# Build
npm run build

# Clean build artifacts
npm run clean
```

## API Reference

Base URL: `https://api.kallyai.com/v1`

See the [API Reference](https://api.kallyai.com/docs) for complete documentation.

## Supported Countries

- United States
- Canada
- United Kingdom
- Spain
- Most European countries

## Supported Languages

- English (`en`)
- Spanish (`es`)

## Privacy Policy

**Full Privacy Policy**: [PRIVACY.md](PRIVACY.md)

### Data Collection & Usage

The KallyAI MCP Server **does NOT collect or store any user data**. It operates as a pass-through service:

- **Authentication**: OAuth2 tokens stored locally in `~/.kallyai_token.json` (owner-only permissions)
- **No Logging**: Conversation history and personal information are not logged
- **No Analytics**: No telemetry or usage tracking
- **Secure Transit**: All API requests use HTTPS/TLS encryption
- **Third-Party Service**: Requests are forwarded to KallyAI API (https://api.kallyai.com) - see [KallyAI Privacy Policy](https://kallyai.com/privacy)

### What Data is Transmitted

When you use this MCP server, the following data is sent to the KallyAI API:
- Phone numbers you request to call
- Task descriptions for the AI assistant
- Call settings (language, timezone, etc.)
- Your OAuth2 authentication token

### Data Retention

- **Local tokens**: Stored until manually deleted (`rm ~/.kallyai_token.json`)
- **Call data**: Retained by KallyAI according to their privacy policy
- **MCP server**: Does not retain any data between sessions

### User Rights

You have the right to:
- Access your data via KallyAI API tools
- Delete your authentication tokens locally
- Revoke API access through the KallyAI dashboard
- Export your call history

### Contact

Privacy questions:
- **This MCP Server**: support@kallyintelligence.com
- **KallyAI Service**: privacy@kallyintelligence.com
- **GitHub Issues**: https://github.com/Kally-Intelligence-Inc/kallyai-mcp-server/issues

## License

MIT

## Support

For issues and questions:
- API Documentation: https://api.kallyai.com/docs
- Website: https://kallyai.com
- Support: support@kallyintelligence.com
- GitHub Issues: https://github.com/Kally-Intelligence-Inc/kallyai-mcp-server/issues
