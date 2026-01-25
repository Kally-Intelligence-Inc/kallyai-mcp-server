# Manual Steps Required for Anthropic Submission

**Important**: The following steps require manual action and cannot be automated.

---

## Step 1: Create Test Account ⚠️ MANUAL ACTION REQUIRED

### 1.1 Create Account on Production

Visit: https://kallyai.com/app

**Recommended Test Email Options:**
- `anthropic-review@kallyai.com`
- `mcp-test@kallyai.com`
- `claude-directory@kallyai.com`

**Sign Up Process:**
1. Click "Sign Up" or "Get Started"
2. Use Google or Apple Sign-In
3. Complete authentication
4. Verify account is created

### 1.2 Test the Account

1. Visit https://kallyai.com/app
2. Verify you can access dashboard
3. Check subscription status
4. Confirm all features are visible

---

## Step 2: Grant Unlimited Subscription ⚠️ BACKEND ACCESS REQUIRED

### Option A: Using Firebase Admin (Recommended)

```javascript
// Run this in your backend admin script or Firebase Functions
const admin = require('firebase-admin');

async function grantUnlimitedSubscription(userEmail) {
  const db = admin.firestore();

  // Find user by email
  const userRecord = await admin.auth().getUserByEmail(userEmail);
  const userId = userRecord.uid;

  // Update subscription in Firestore
  await db.collection('users').doc(userId).update({
    subscription: {
      provider: 'stripe',
      status: 'active',
      plan: {
        type: 'business',
        period: 'annual',
        minutes_included: 10000 // Very high quota
      },
      auto_renew: true,
      expires_at: new Date('2027-12-31').toISOString()
    }
  });

  // Update usage statistics
  await db.collection('statistics').doc(userId).update({
    minutes_allocated: 10000,
    minutes_used: 0,
    calls_allocated: 1000,
    calls_used: 0,
    period_start: new Date().toISOString(),
    period_end: new Date('2027-12-31').toISOString()
  });

  console.log(`Unlimited subscription granted to ${userEmail}`);
}

// Usage
grantUnlimitedSubscription('anthropic-review@kallyai.com');
```

### Option B: Using Admin Dashboard

If you have an admin panel:
1. Login to admin dashboard
2. Find user by email
3. Navigate to subscription settings
4. Set:
   - Plan: Business/Enterprise
   - Minutes: 10,000
   - Expiration: 2027-12-31
   - Status: Active
   - Auto-renew: Enabled

### Option C: Direct Database Update

**Firestore Console:**
1. Go to Firebase Console
2. Navigate to Firestore Database
3. Find user document in `users` collection
4. Edit subscription fields manually
5. Update statistics document in `statistics` collection

**Required Fields:**
```json
{
  "subscription": {
    "provider": "stripe",
    "status": "active",
    "plan": {
      "type": "business",
      "period": "annual",
      "minutes_included": 10000
    },
    "expires_at": "2027-12-31T23:59:59Z",
    "auto_renew": true
  }
}
```

### 2.3 Verify Subscription

1. Log in as test user at https://kallyai.com/app
2. Check dashboard shows correct subscription
3. Verify quota displays high limits
4. Make a test call to confirm everything works

---

## Step 3: Prepare Credentials Document

Create a file: `test-account-credentials.txt`

```text
# KallyAI MCP Server - Test Account Credentials
# For Anthropic Directory Review

## Account Access

**Email:** anthropic-review@kallyai.com
**Authentication Method:** Google Sign-In (or Apple Sign-In)

## How to Authenticate

1. Visit: https://kallyai.com/app
2. Click "Sign In"
3. Choose Google Sign-In (or Apple Sign-In)
4. Use the credentials above
5. Once authenticated, token is automatically stored in ~/.kallyai_token.json

## Alternative: Manual Token Setup

If you prefer to test without web authentication:

1. Obtain access token from: https://kallyai.com/app (after sign in)
2. Create file: ~/.kallyai_token.json
3. Add content:
```json
{
  "access_token": "YOUR_ACCESS_TOKEN_HERE",
  "refresh_token": "YOUR_REFRESH_TOKEN_HERE",
  "expires_at": 1234567890
}
```

## Account Details

**Subscription:**
- Plan: Business Annual
- Minutes Included: 10,000
- Calls Allocated: 1,000
- Status: Active
- Expires: 2027-12-31

**Sample Data:**
- Clean account (no previous call history)
- Ready for testing all 6 tools
- Quota sufficient for extensive testing

**Supported Regions:**
- United States
- Canada
- United Kingdom
- Spain
- Most EU countries

**Supported Languages:**
- English (en)
- Spanish (es)

## Testing Instructions

### Quick Test
```bash
# Install MCP server
npx kallyai-mcp-server

# Or test via Claude Desktop
# Add to Claude Desktop config and restart
```

### Test Call Examples

1. **Restaurant Reservation:**
   "Call Bella Italia at +1-415-555-1234 and make a reservation for 4 people at 7pm tomorrow"

2. **Medical Appointment:**
   "Schedule a dental checkup at Downtown Dental (415-555-9876), prefer morning appointments"

3. **General Inquiry:**
   "Call Apple Store at +1-415-555-2000 and ask about iPhone 15 Pro availability"

## Support

**Technical Issues:**
- Email: engineering@kallyai.com
- GitHub Issues: https://github.com/Kally-Intelligence-Inc/kallyai-mcp-server/issues

**Account Issues:**
- Email: support@kallyai.com
- Response Time: < 24 hours

## Notes for Reviewers

- Account created specifically for Anthropic review
- High quota ensures no interruption during testing
- All 6 MCP tools are fully functional
- Real phone calls will be made (charges covered by KallyAI)
- Token auto-refresh implemented (no manual token management needed)

## Security

- Tokens stored locally only (not transmitted to MCP server logs)
- File permissions enforced (0o600)
- OAuth2 Bearer token authentication
- Automatic token refresh before expiry

---

**Created:** January 25, 2026
**Contact:** ceo@kallyintelligence.com, engineering@kallyai.com
```

Save this as: `test-account-credentials.txt`

---

## Step 4: Submit to Anthropic ⚠️ MANUAL FORM SUBMISSION

### 4.1 Open Form

Visit: https://forms.gle/tyiAZvch1kDADKoP9

### 4.2 Prepare Materials

**Before submitting, have ready:**
- ✅ `LOCAL-MCPB-SUBMISSION.txt` (all form responses)
- ✅ `kallyai-mcp-server-1.0.1.mcpb` (4.1 MB package)
- ✅ `test-account-credentials.txt` (credentials document)

### 4.3 Fill Form Fields

**Copy-paste from `LOCAL-MCPB-SUBMISSION.txt` for each field.**

**Key Fields:**
- Extension Name: KallyAI Phone Assistant
- npm Package: kallyai-mcp-server
- Version: 1.0.1
- Privacy Policy: https://github.com/Kally-Intelligence-Inc/kallyai-mcp-server/blob/main/PRIVACY.md

**Testing Credentials Field:**
Paste entire contents of `test-account-credentials.txt`

### 4.4 Upload Package

When prompted, upload:
```
kallyai-mcp-server-1.0.1.mcpb
```

Location: `/Users/sergei/PycharmProjects/KallyAI/kallyai-mcp-server/kallyai-mcp-server-1.0.1.mcpb`

### 4.5 Review and Submit

1. Double-check all URLs are correct
2. Verify 3 examples are complete
3. Confirm package uploaded successfully
4. Review privacy policy links
5. Click "Submit"
6. **Save confirmation screenshot or email**

---

## Step 5: Post-Submission

### 5.1 Monitor Email

**Watch these inboxes:**
- ceo@kallyintelligence.com (author email)
- support@kallyai.com (support email)
- engineering@kallyai.com (technical contact)

### 5.2 Keep Account Active

- Test account must remain active during review
- Keep subscription unlimited
- Do not delete or modify account
- Ensure quota remains high

### 5.3 Respond Promptly

- Typical review time: 2-4 weeks
- Respond to Anthropic within 24-48 hours
- Be ready to provide additional info
- Answer technical questions

### 5.4 Avoid Breaking Changes

During review period:
- ❌ Do not change API endpoints
- ❌ Do not modify tool signatures
- ❌ Do not break authentication
- ✅ Can fix critical bugs
- ✅ Can update documentation
- ✅ Can improve security

---

## Troubleshooting

### Test Account Issues

**Problem:** Cannot create account
- Try different email address
- Use different sign-in method (Google vs Apple)
- Check if email is already registered

**Problem:** Subscription not updating
- Verify Firebase permissions
- Check Firestore rules
- Confirm user_id is correct
- Wait 5 minutes for cache refresh

### Submission Issues

**Problem:** Form not accepting upload
- Check file size (must be < 10 MB)
- Verify .mcpb extension
- Try different browser
- Clear browser cache

**Problem:** Missing required fields
- All fields marked with * are required
- Include minimum 3 examples
- Privacy policy must be in both README and manifest.json
- Test credentials must be provided

---

## Success Criteria

✅ Test account created
✅ Unlimited subscription granted
✅ Test call completed successfully
✅ Credentials document prepared
✅ Form submitted with all materials
✅ Confirmation received
✅ Monitoring email for response

---

## Timeline

| Step | Estimated Time |
|------|----------------|
| Create test account | 5 minutes |
| Grant subscription | 10-30 minutes (depending on method) |
| Prepare credentials | 10 minutes |
| Submit form | 15 minutes |
| Anthropic review | 2-4 weeks |

---

## Contacts

**For Help During This Process:**
- Author: ceo@kallyintelligence.com
- Technical: engineering@kallyai.com
- Support: support@kallyai.com

**For Anthropic Questions:**
- Directory Support: https://support.claude.com/
- Form Issues: Check form page for support contact

---

**Good luck with the submission! 🚀**
