# KallyAI MCP Server - Publication Guide

This guide walks you through publishing the KallyAI MCP Server to both npm and the Anthropic Connectors Directory.

## ✅ Pre-Publication Checklist

All items below are **COMPLETE** and ready for publication:

### Required Files
- ✅ `LICENSE` (MIT)
- ✅ `PRIVACY.md` (Complete privacy policy)
- ✅ `README.md` (Installation and overview)
- ✅ `USAGE.md` (Detailed examples and usage)
- ✅ `IMPLEMENTATION.md` (Technical documentation)
- ✅ `TEST-RESULTS.md` (Verification of successful test call)
- ✅ `CONNECTOR-SUBMISSION.md` (Anthropic submission documentation)
- ✅ `package.json` (Configured for npm publishing)

### Technical Requirements
- ✅ All 6 tools have safety annotations (readOnlyHint/destructiveHint)
- ✅ Production-ready code (tested with real call)
- ✅ TypeScript compilation successful (0 errors)
- ✅ Streamable HTTP and stdio transport support
- ✅ Comprehensive error handling
- ✅ Authentication via ~/.kallyai_token.json
- ✅ Auto-refresh for expired tokens

### Documentation Requirements
- ✅ Server description and capabilities
- ✅ Complete feature list
- ✅ Setup instructions
- ✅ Minimum 3 working examples
- ✅ Privacy policy
- ✅ Support contact information

---

## 📦 Step 1: Publish to npm

### 1.1 Create npm Account
If you don't have an npm account:
```bash
# Visit https://www.npmjs.com/signup
# Or create via CLI
npm adduser
```

### 1.2 Login to npm
```bash
npm login
```

### 1.3 Verify package.json
```bash
# Check package name availability
npm view kallyai-mcp-server

# If available, proceed. If taken, update name in package.json
```

### 1.4 Test Package Locally
```bash
# Create a tarball to verify contents
npm pack

# Inspect the tarball
tar -tzf kallyai-mcp-server-1.0.0.tgz

# Clean up
rm kallyai-mcp-server-1.0.0.tgz
```

### 1.5 Publish to npm
```bash
# Publish as public package
npm publish --access public

# Verify publication
npm view kallyai-mcp-server
```

### 1.6 Test Installation
```bash
# In a different directory
npx kallyai-mcp-server --help

# Should start the MCP server
```

---

## 🔌 Step 2: Submit to Anthropic Connectors Directory

### 2.1 Prerequisites Verification

**GitHub Repository**:
- ✅ Create public repository: https://github.com/kallyai/kallyai-mcp-server
- ✅ Push all code and documentation
- ✅ Add README.md as repository homepage
- ✅ Add topics: `mcp-server`, `claude`, `anthropic`, `kallyai`

```bash
# Initialize git (if not already)
cd /Users/sergei/PycharmProjects/KallyAI/kallyai-mcp-server
git init
git add .
git commit -m "feat: Initial release of KallyAI MCP Server v1.0.0

- 6 fully functional tools for phone automation
- CLI-style authentication with auto-refresh
- Production tested with real phone calls
- Complete documentation and privacy policy
- MIT license, open source"

# Add remote and push
git remote add origin git@github.com:kallyai/kallyai-mcp-server.git
git branch -M main
git push -u origin main
```

**Test Account Preparation**:
- Create a dedicated test account at https://kallyai.com/app
- Add sample data (previous calls, active subscription)
- Note credentials for Anthropic QA team
- Email to: engineering@kallyai.com with subject "MCP Test Account - Anthropic Review"

### 2.2 Fill Out Submission Form

Visit: [MCP Directory Server Review Form](https://docs.google.com/forms/d/e/1FAIpQLSeafJF2NDI7oYx1r8o0ycivCSVLNq92Mpc1FPxMKSw1CzDkqA/viewform)

**Form Fields** (use CONNECTOR-SUBMISSION.md as reference):

1. **Server Name**: KallyAI MCP Server

2. **Server Description**:
   > The KallyAI MCP Server enables Claude AI to make phone calls through an AI assistant. Users can schedule restaurant reservations, book medical appointments, make general business inquiries, and handle other phone-based tasks without picking up the phone.

3. **Repository URL**: https://github.com/kallyai/kallyai-mcp-server

4. **npm Package**: kallyai-mcp-server

5. **Server Type**: Remote MCP Server (Streamable HTTP + stdio)

6. **Authentication Method**: OAuth2 Bearer Token (local storage)

7. **Privacy Policy URL**:
   https://github.com/kallyai/kallyai-mcp-server/blob/main/PRIVACY.md

8. **Support Contact**:
   - Email: support@kallyai.com
   - GitHub Issues: https://github.com/kallyai/kallyai-mcp-server/issues

9. **Documentation URL**:
   https://github.com/kallyai/kallyai-mcp-server#readme

10. **Usage Examples**: (Copy from CONNECTOR-SUBMISSION.md Examples 1-3)

11. **Test Account**: Available upon request at engineering@kallyai.com

12. **Safety Annotations**: All tools have accurate readOnlyHint/destructiveHint annotations ✅

13. **Production Status**: General Availability (GA) ✅

14. **Additional Notes**:
    > Successfully tested with real phone call on January 25, 2026 (see TEST-RESULTS.md). Open source MIT licensed. All 6 tools functional and documented. No data collection by MCP server - pure pass-through to KallyAI API.

### 2.3 Submit Form

- Review all information
- Double-check links and URLs
- Click Submit

### 2.4 Post-Submission

**Timeline Expectations**:
- Anthropic reviews submissions on a rolling basis
- Due to high volume, they may not respond to all submissions
- Typical review time: 2-4 weeks (if accepted)

**What to Expect**:
- Email notification if accepted
- Request for test account credentials
- Possible feedback or revision requests
- Final approval and listing in directory

**During Review**:
- Monitor GitHub issues for questions
- Keep test account active and funded
- Respond promptly to any Anthropic emails
- Don't make breaking changes to the MCP server

---

## 📊 Step 3: Post-Publication Monitoring

### npm Package
```bash
# Check weekly downloads
npm view kallyai-mcp-server

# Monitor for issues
# Check GitHub issues regularly
```

### Anthropic Directory

Once listed:
- Monitor usage via KallyAI API analytics
- Track issues reported through support channels
- Update documentation as needed
- Plan version 2.0 features based on feedback

---

## 🔄 Version Updates

When releasing updates:

### Minor Updates (1.0.x)
```bash
# Bug fixes, documentation updates
npm version patch
git push && git push --tags
npm publish
```

### Feature Updates (1.x.0)
```bash
# New tools, enhanced features
npm version minor
git push && git push --tags
npm publish

# Notify Anthropic of significant updates
```

### Breaking Changes (x.0.0)
```bash
# Incompatible API changes
npm version major
git push && git push --tags
npm publish

# Submit update form to Anthropic
```

---

## 📞 Support & Contact

### For Publishing Issues
- **npm support**: https://www.npmjs.com/support
- **Anthropic support**: https://support.claude.com/

### For Technical Issues
- **GitHub Issues**: https://github.com/kallyai/kallyai-mcp-server/issues
- **Email**: engineering@kallyai.com

---

## 📋 Quick Reference

### Important URLs

| Resource | URL |
|----------|-----|
| npm Package | https://www.npmjs.com/package/kallyai-mcp-server |
| GitHub Repo | https://github.com/kallyai/kallyai-mcp-server |
| Submission Form | https://docs.google.com/forms/d/e/1FAIpQLSeafJF2NDI7oYx1r8o0ycivCSVLNq92Mpc1FPxMKSw1CzDkqA/viewform |
| Connector Directory | https://claude.com/connectors |
| Privacy Policy | https://github.com/kallyai/kallyai-mcp-server/blob/main/PRIVACY.md |
| Documentation | https://github.com/kallyai/kallyai-mcp-server#readme |

### Key Commands

```bash
# Build
npm run build

# Publish to npm
npm publish --access public

# Test locally
npx kallyai-mcp-server

# Verify installation
npx @modelcontextprotocol/inspector npx kallyai-mcp-server
```

---

## ✨ Success Criteria

Your submission will be successful when:

- ✅ Package available on npm
- ✅ GitHub repository public and documented
- ✅ Form submitted to Anthropic
- ✅ Test account provided (if requested)
- ✅ Listed in https://claude.com/connectors
- ✅ Users can install via Claude Desktop
- ✅ Positive user feedback and adoption

**You're ready to publish!** All requirements are met. Good luck! 🚀
