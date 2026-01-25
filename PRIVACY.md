# Privacy Policy for KallyAI MCP Server

**Last Updated**: January 25, 2026

## Overview

The KallyAI MCP Server is a connector that enables Claude AI to interact with the KallyAI API for making AI-powered phone calls. This privacy policy describes how the connector handles user data.

## Data Collection and Storage

### What We Collect

The KallyAI MCP Server does NOT collect or store any user data. The connector operates as a pass-through service that:

1. **Authentication Tokens**: Reads OAuth2 tokens from the local file `~/.kallyai_token.json` stored on your device
2. **API Requests**: Forwards your requests to the KallyAI API (api.kallyai.com)
3. **API Responses**: Returns responses from the KallyAI API to Claude

### What We Don't Collect

- Conversation history with Claude
- Personal information
- Call recordings or transcripts (beyond what's required by the KallyAI API)
- Usage analytics
- Telemetry data

## Data Transmission

### Secure Communication

All communication with the KallyAI API uses:
- HTTPS/TLS encryption
- OAuth2 Bearer token authentication
- Industry-standard security practices

### Data Flow

1. **Claude** → **MCP Server** → **KallyAI API**
2. Your requests pass through the connector but are not logged or stored
3. Responses are returned directly to Claude without modification

## Third-Party Services

### KallyAI API

When you use this connector, your data is sent to the KallyAI API:
- **Service**: KallyAI Phone Assistant API
- **URL**: https://api.kallyai.com
- **Privacy Policy**: https://kallyai.com/privacy-policy
- **Purpose**: To execute AI phone calls on your behalf

The KallyAI API may collect:
- Phone numbers you call
- Call transcripts and recordings
- Usage statistics
- Subscription information

Please review the [KallyAI Privacy Policy](https://kallyai.com/privacy-policy) for details.

## Local Storage

### Token Storage

- Authentication tokens are stored locally in `~/.kallyai_token.json`
- File permissions are set to 0o600 (owner read/write only)
- Tokens are never transmitted except to the KallyAI API
- Tokens can be deleted by removing the file or running `kallyai logout`

## User Rights

You have the right to:

1. **Access**: Review your token file at any time
2. **Delete**: Remove your authentication tokens
3. **Revoke**: Revoke API access through the KallyAI dashboard
4. **Export**: Export your call history via the KallyAI API
5. **Opt-out**: Stop using the connector at any time

## Children's Privacy

The KallyAI MCP Server is not directed to individuals under 13 years of age. We do not knowingly collect personal information from children.

## Changes to This Policy

We may update this privacy policy from time to time. The "Last Updated" date at the top indicates when the policy was last revised.

## Contact Information

For privacy-related questions about:

- **This MCP Server**: Create an issue at [GitHub Repository](https://github.com/sltelitsyn/kallyai-mcp-server)
- **KallyAI Service**: Contact support@kallyintelligence.com
- **Data Requests**: privacy@kallyintelligence.com

## Prohibited Activities

You shall NOT:

1. **Reverse Engineer**: Attempt to reverse engineer, decompile, disassemble, or derive source code, algorithms, or data structures from the KallyAI API
2. **Security Testing**: Conduct penetration testing, vulnerability scanning, or any security research on the KallyAI API or MCP Server without prior written consent
3. **Circumvent Controls**: Attempt to bypass, disable, or circumvent any security features, authentication mechanisms, or rate limits
4. **Unauthorized Access**: Access or attempt to access any systems, data, or accounts without authorization
5. **API Abuse**: Use automated tools to scrape, harvest, or extract data beyond normal usage patterns

Violations may result in immediate termination of access and legal action.

## Compliance

We respect user privacy and comply with:
- General Data Protection Regulation (GDPR)
- California Consumer Privacy Act (CCPA)
- Other applicable data protection laws

---

**Note**: This privacy policy applies only to the KallyAI MCP Server connector. For information about how Claude AI or the KallyAI service handles your data, please refer to their respective privacy policies:

- [Anthropic (Claude) Privacy Policy](https://www.anthropic.com/privacy)
- [KallyAI Privacy Policy](https://kallyai.com/privacy-policy)
