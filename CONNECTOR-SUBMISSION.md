# KallyAI MCP Server - Connector Submission Documentation

**Submission Ready** for Anthropic Connectors Directory

## Server Information

- **Name**: KallyAI MCP Server
- **Version**: 1.0.0
- **Type**: Remote MCP Server (Streamable HTTP + stdio)
- **Status**: Production Ready (GA)
- **License**: MIT
- **Repository**: https://github.com/kallyai/kallyai-mcp-server

## Description

The KallyAI MCP Server enables Claude AI to make phone calls through an AI assistant. Users can ask Claude to schedule restaurant reservations, book medical appointments, make general business inquiries, and handle other phone-based tasks without picking up the phone themselves.

The connector provides a seamless bridge between Claude's conversational AI and KallyAI's phone automation API, allowing natural language requests like "Call that Italian restaurant and make a reservation for 4 people at 7pm tonight" to be executed automatically.

## Features

- **🍽️ Restaurant Reservations**: Book tables at restaurants with specific date, time, and party size
- **🏥 Medical Appointments**: Schedule appointments at clinics with flexible time preferences
- **🏨 Hotel Bookings**: Reserve hotel rooms and amenities
- **📞 General Inquiries**: Ask businesses questions about products, services, hours, availability
- **📜 Call History**: Retrieve past calls with status and results
- **📝 Transcripts**: Access full conversation transcripts from completed calls
- **📊 Usage Tracking**: Monitor minutes used and quota remaining
- **💳 Subscription Management**: Check plan status and billing information

## Authentication

**Type**: OAuth2 Bearer Token (stored locally)

The server uses automatic authentication via tokens stored in `~/.kallyai_token.json`. Users authenticate once through the KallyAI web app or CLI, and tokens are managed automatically with auto-refresh.

**OAuth Details**:
- Not required in connector (tokens managed locally)
- Tokens obtained via https://kallyai.com/app
- Standard OAuth2 with Google/Apple Sign-In
- Automatic token refresh on expiry

## Setup Instructions

### 1. Prerequisites

```bash
# Ensure Node.js 18+ is installed
node --version

# Authenticate with KallyAI (one-time setup)
# Visit: https://kallyai.com/app
# Sign in with Google or Apple
```

### 2. Installation

**For Claude Desktop** (stdio mode):
```json
{
  "mcpServers": {
    "kallyai": {
      "command": "npx",
      "args": [
        "-y",
        "kallyai-mcp-server"
      ]
    }
  }
}
```

**For Claude.ai** (HTTP mode):
```bash
# Deploy as HTTP service
TRANSPORT=http PORT=3000 npx kallyai-mcp-server
```

### 3. Verification

```bash
# Test with MCP Inspector
npx @modelcontextprotocol/inspector npx kallyai-mcp-server
```

## Usage Examples

### Example 1: Restaurant Reservation

**User Prompt**:
> "Call Bella Italia at +1-415-555-1234 and make a reservation for 4 people tomorrow at 7pm. My name is John Smith."

**Claude Action**:
```
Tool: kallyai_create_call
Parameters:
{
  "task_category": "restaurant",
  "task_description": "Reserve a table for 4 people at 7pm tomorrow",
  "respondent_phone": "+14155551234",
  "business_name": "Bella Italia",
  "user_name": "John Smith",
  "party_size": 4,
  "appointment_date": "2026-01-26",
  "appointment_time": "19:00",
  "timezone": "America/New_York"
}
```

**Result**:
```markdown
# Call Completed

**Status**: success

## Summary
Successfully reserved a table for 4 people at 7:00 PM on January 26, 2026.

## Next Steps
Arrive 10 minutes early. Ask for the Smith reservation.

**Duration**: 2m 15s
```

### Example 2: Medical Appointment

**User Prompt**:
> "Schedule a dental checkup at Downtown Dental (415-555-9876). I prefer morning appointments before 11am."

**Claude Action**:
```
Tool: kallyai_create_call
Parameters:
{
  "task_category": "clinic",
  "task_description": "Schedule a dental checkup",
  "respondent_phone": "+14155559876",
  "business_name": "Downtown Dental",
  "time_preference_text": "morning before 11am",
  "timezone": "America/Los_Angeles"
}
```

**Result**:
```markdown
# Call Completed

**Status**: success

## Summary
Appointment scheduled for January 28, 2026 at 10:30 AM.

## Next Steps
Arrive 15 minutes early to fill out paperwork. Bring insurance card.
```

### Example 3: Product Inquiry

**User Prompt**:
> "Call the Apple Store at +1-415-555-2000 and ask if they have iPhone 15 Pro in stock and what colors are available."

**Claude Action**:
```
Tool: kallyai_create_call
Parameters:
{
  "task_category": "general",
  "task_description": "Ask if they have iPhone 15 Pro in stock and what colors are available",
  "respondent_phone": "+14155552000",
  "business_name": "Apple Store",
  "timezone": "America/Los_Angeles"
}
```

**Result**:
```markdown
# Call Completed

**Status**: success

## Summary
iPhone 15 Pro is in stock. Available colors: Natural Titanium, Blue Titanium, White Titanium, Black Titanium. Price: $999 for 128GB.

## Next Steps
Visit store or order online. Stock available for immediate pickup.
```

## Technical Specifications

### Tool Annotations (All Present ✅)

All 6 tools have accurate safety annotations:

| Tool | readOnlyHint | destructiveHint | idempotentHint |
|------|--------------|-----------------|----------------|
| kallyai_create_call | false | false | false |
| kallyai_list_calls | true | false | true |
| kallyai_get_call | true | false | true |
| kallyai_get_transcript | true | false | true |
| kallyai_get_subscription | true | false | true |
| kallyai_get_statistics | true | false | true |

### Transport Support

- ✅ Streamable HTTP (production deployment)
- ✅ stdio (local development, Claude Desktop)
- ✅ HTTPS/TLS with valid certificates
- ✅ Proper CORS configuration

### Performance

- Response time: < 2s for read operations
- Call creation: 1-3 minutes (actual phone call duration)
- Timeout: 120 seconds
- Max tokens: < 25,000 per response
- Auto-truncation for large results

### Error Handling

```typescript
// Example error messages
"Error: Rate limit exceeded. Please wait before making more requests."
"Error: Quota exceeded. Upgrade at https://kallyai.com/pricing"
"Error: Phone number must be in E.164 format (+1234567890)"
"Error: No authentication found. Please run: kallyai login"
```

All errors include:
- Clear description of the problem
- Actionable next steps
- Links to documentation when relevant

## Privacy & Support

### Privacy Policy
Complete privacy policy: [PRIVACY.md](./PRIVACY.md)

**Key Points**:
- No data collection or logging by the MCP server
- Tokens stored locally only
- Data transmitted directly to KallyAI API
- Open-source for transparency

### Support Channels

- **Email**: support@kallyai.com
- **GitHub Issues**: https://github.com/kallyai/kallyai-mcp-server/issues
- **Documentation**: https://github.com/kallyai/kallyai-mcp-server
- **API Docs**: https://api.kallyai.com/docs

### Hours of Operation
- GitHub Issues: 24/7 (community + maintainers)
- Email Support: Business hours (M-F, 9am-5pm PST)
- Response Time: < 24 hours for critical issues

## Testing Account

**Available for Anthropic Review**:

Test credentials can be provided upon request for QA purposes. The test account includes:
- Pre-loaded quota for making calls
- Sample call history
- Active subscription
- Access to all tools

Contact: engineering@kallyai.com with subject "MCP Connector Review - Test Account"

## Production Readiness Checklist

- ✅ General Availability (GA) status
- ✅ Full test coverage and verification
- ✅ Complete documentation
- ✅ Privacy policy published
- ✅ Support channels active
- ✅ All tools have safety annotations
- ✅ Error handling implemented
- ✅ HTTPS/TLS enabled
- ✅ OAuth not required (local token auth)
- ✅ Performance optimized
- ✅ Open source (MIT license)

## Additional Information

### Supported Countries
- United States
- Canada
- United Kingdom
- Spain
- Most European Union countries

### Supported Languages
- English (en)
- Spanish (es)

### Phone Format
E.164 format required: `+[country code][number]`
Example: `+14155551234`

### Timezone Support
IANA timezone identifiers
Examples: `America/New_York`, `Europe/Madrid`

## Links

- **Repository**: https://github.com/kallyai/kallyai-mcp-server
- **npm Package**: https://www.npmjs.com/package/kallyai-mcp-server
- **Documentation**: README.md, USAGE.md, IMPLEMENTATION.md
- **Privacy**: PRIVACY.md
- **License**: LICENSE (MIT)
- **Test Results**: TEST-RESULTS.md

---

## Submission Checklist

- ✅ Server fully tested and production-ready
- ✅ All tools have accurate safety annotations
- ✅ Documentation complete (description, features, setup, examples)
- ✅ Privacy policy published
- ✅ Support channels active and monitored
- ✅ Test account available
- ✅ Minimum 3 usage examples provided
- ✅ Open source with MIT license
- ✅ Error handling with helpful messages
- ✅ Performance meets requirements (<25K tokens)

**Ready for submission to**: [MCP Directory Server Review Form](https://docs.google.com/forms/d/e/1FAIpQLSeafJF2NDI7oYx1r8o0ycivCSVLNq92Mpc1FPxMKSw1CzDkqA/viewform)
