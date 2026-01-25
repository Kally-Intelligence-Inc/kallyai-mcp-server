# KallyAI MCP Server Usage Guide

## Quick Start

### 1. Installation

```bash
npm install
npm run build
```

### 2. Configuration

#### For Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "kallyai": {
      "command": "node",
      "args": [
        "/path/to/kallyai-mcp-server/dist/index.js"
      ]
    }
  }
}
```

#### For other MCP clients

Use the stdio transport by default:
```bash
node dist/index.js
```

Or use HTTP transport:
```bash
TRANSPORT=http PORT=3000 node dist/index.js
```

### 3. Authentication

All API calls require an OAuth2 access token.

**Interactive Setup (Recommended)**

Run the setup wizard to authenticate:
```bash
npx kallyai-mcp-server --setup
```

**OAuth2 Authorization Code Flow**

For integrations (e.g., GPT Actions):

1. **Authorization URL**:
```
https://api.kallyai.com/v1/auth/authorize?
  response_type=code&
  client_id=CLIENT_ID&
  redirect_uri=REDIRECT_URI&
  scope=calls:read%20calls:write
```

2. **Token Exchange**:
```bash
curl -X POST https://api.kallyai.com/v1/auth/gpt/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code" \
  -d "client_id=CLIENT_ID" \
  -d "client_secret=CLIENT_SECRET" \
  -d "code=AUTH_CODE" \
  -d "redirect_uri=REDIRECT_URI"
```

3. **Refresh Token**:
```bash
curl -X POST https://api.kallyai.com/v1/auth/gpt/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=refresh_token" \
  -d "client_id=CLIENT_ID" \
  -d "client_secret=CLIENT_SECRET" \
  -d "refresh_token=REFRESH_TOKEN"
```

## Available Tools

### 1. kallyai_create_call

Make an AI phone call to accomplish a task.

**Use Cases:**
- Restaurant reservations
- Medical appointments
- Hotel bookings
- General business inquiries

**Example: Restaurant Reservation**
```json
{
  "task_category": "restaurant",
  "task_description": "Reserve a table for 4 people at 7pm tonight",
  "respondent_phone": "+14155551234",
  "business_name": "Italian Bistro",
  "user_name": "John Smith",
  "party_size": 4,
  "appointment_date": "2026-01-25",
  "appointment_time": "19:00",
  "timezone": "America/New_York",
  "access_token": "eyJ..."
}
```

**Example: Medical Appointment**
```json
{
  "task_category": "clinic",
  "task_description": "Schedule a dental checkup for next week",
  "respondent_phone": "+14155559876",
  "business_name": "Downtown Dental",
  "user_name": "Jane Doe",
  "user_phone": "+14155551111",
  "time_preference_text": "morning before 11am",
  "timezone": "America/New_York",
  "access_token": "eyJ..."
}
```

**Example: General Inquiry**
```json
{
  "task_category": "general",
  "task_description": "Ask if they have iPhone 15 Pro in stock and what's the price",
  "respondent_phone": "+14155552222",
  "business_name": "Tech Store",
  "timezone": "America/Los_Angeles",
  "access_token": "eyJ..."
}
```

### 2. kallyai_list_calls

Retrieve call history with pagination.

**Example:**
```json
{
  "limit": 20,
  "offset": 0,
  "access_token": "eyJ...",
  "response_format": "markdown"
}
```

### 3. kallyai_get_call

Get detailed information about a specific call.

**Example:**
```json
{
  "call_id": "123e4567-e89b-12d3-a456-426614174000",
  "access_token": "eyJ...",
  "response_format": "json"
}
```

### 4. kallyai_get_transcript

Retrieve the conversation transcript for a call.

**Example:**
```json
{
  "call_id": "123e4567-e89b-12d3-a456-426614174000",
  "access_token": "eyJ...",
  "response_format": "markdown"
}
```

### 5. kallyai_get_subscription

Check subscription status and plan details.

**Example:**
```json
{
  "access_token": "eyJ...",
  "response_format": "json"
}
```

### 6. kallyai_get_statistics

Get usage statistics and quota information.

**Example:**
```json
{
  "access_token": "eyJ...",
  "response_format": "markdown"
}
```

## Response Formats

All tools support two response formats controlled by the `response_format` parameter:

### Markdown (Default)
Human-readable formatted text with headers, lists, and clear organization.

**Example:**
```markdown
# Call 123e4567-e89b-12d3-a456-426614174000

**Status**: success
**Business**: Italian Bistro

## Summary

Successfully reserved a table for 4 people at 7:00 PM on January 25, 2026.

## Next Steps

Arrive 10 minutes early. Ask for the Smith reservation.

**Duration**: 2m 15s
```

### JSON
Machine-readable structured data with all fields.

**Example:**
```json
{
  "call_id": "123e4567-e89b-12d3-a456-426614174000",
  "status": "success",
  "business_name": "Italian Bistro",
  "highlights": "Successfully reserved a table for 4 people at 7:00 PM on January 25, 2026.",
  "next_steps": "Arrive 10 minutes early. Ask for the Smith reservation.",
  "duration_seconds": 135,
  "created_at": "2026-01-25T17:30:00Z",
  "ended_at": "2026-01-25T17:32:15Z"
}
```

## Common Error Scenarios

### Quota Exceeded
```json
{
  "error": "quota_exceeded",
  "message": "You've used all your minutes. Upgrade at https://kallyai.com/pricing"
}
```

**Solution**: User needs to upgrade their plan at kallyai.com/pricing

### Invalid Phone Number
```json
{
  "error": "missing_phone_number",
  "message": "Please provide a valid phone number in E.164 format"
}
```

**Solution**: Use E.164 format: `+14155551234` (country code + number, no spaces)

### Emergency Number
```json
{
  "error": "emergency_number",
  "message": "Emergency numbers (911, 112, etc.) cannot be called"
}
```

**Solution**: KallyAI blocks emergency services for safety reasons

### Country Not Supported
```json
{
  "error": "country_restriction",
  "message": "This country is not supported in your region"
}
```

**Solution**: Check supported countries in README.md

## Phone Number Format

Always use E.164 format:
- ✅ `+14155551234` (US)
- ✅ `+442071234567` (UK)
- ✅ `+34625521040` (Spain)
- ❌ `415-555-1234` (missing country code, has dashes)
- ❌ `14155551234` (missing + prefix)
- ❌ `+1 (415) 555-1234` (has spaces and parentheses)

## Supported Languages

- English: `"language": "en"` and `"call_language": "en"`
- Spanish: `"language": "es"` and `"call_language": "es"`

**Notes:**
- `language`: Language for app interface/responses
- `call_language`: Language the AI will speak during the call
- These can be different (e.g., English app, Spanish call)

## Best Practices

1. **Always specify timezone**: Use IANA timezone names (e.g., `America/New_York`, `Europe/Madrid`)

2. **Be specific in task_description**:
   - ✅ "Reserve a table for 4 people at 7pm tonight"
   - ❌ "Make a reservation"

3. **Include business_name when known**: Helps the AI introduce itself properly

4. **For appointments, prefer structured data**:
   - Use `appointment_date` and `appointment_time` when you have exact times
   - Use `time_preference_text` for flexible scheduling ("next Tuesday afternoon")

5. **Use response_format wisely**:
   - `markdown` for displaying to users
   - `json` for programmatic processing

6. **Handle errors gracefully**: Check for quota limits before making multiple calls

## Development

### Run in development mode
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Clean
```bash
npm run clean
```

## Testing with MCP Inspector

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

This opens a web UI to test your MCP server tools interactively.

## Support

- Documentation: https://api.kallyai.com/docs
- Website: https://kallyai.com
- Support: support@kallyintelligence.com
