# Password Reset Flow - Testing Checklist

## Pre-Test Setup

- [ ] Clone the repository: `git clone https://github.com/NobPolish/clawdbot-railway-template.git`
- [ ] Install dependencies: `npm install` or `pnpm install`
- [ ] Set environment: `export PASSWORD_RESET_CONSOLE_MODE=true`
- [ ] Start server: `npm start`
- [ ] Server running at: `http://localhost:3000`

## Test 1: UI Verification

**Objective:** Verify "Forgot password?" link is visible and functional

- [ ] Navigate to `http://localhost:3000/setup/password-prompt`
- [ ] Verify login form displays
- [ ] Verify "Forgot password?" link appears below the login form
- [ ] Click "Forgot password?" link
- [ ] Verify redirect to `/setup/forgot-password` page

## Test 2: Token Generation (Console Mode)

**Objective:** Verify reset token is generated and logged to console

- [ ] On forgot-password page, enter test email: `testuser@example.com`
- [ ] Click "Send Reset Link" button
- [ ] Check server console for output:
  ```
  [reset] PASSWORD RESET LINK FOR testuser@example.com:
  http://localhost:3000/setup/reset-password?token=...
  ```
- [ ] Verify link is present and formatted correctly
- [ ] Copy the complete reset URL from console

## Test 3: Reset Page Access

**Objective:** Verify reset page loads with valid token

- [ ] Paste the reset URL from Test 2 into browser
- [ ] Verify page loads with "Reset Password" form
- [ ] Verify form has two password fields:
  - [ ] "New Password" field
  - [ ] "Confirm Password" field
- [ ] Verify there's no error message

## Test 4: Password Validation

**Objective:** Verify password validation rules

### Sub-test 4a: Too Short Password
- [ ] Enter password: `pass`
- [ ] Enter confirmation: `pass`
- [ ] Click "Reset Password"
- [ ] Verify error: "Password must be at least 8 characters"

### Sub-test 4b: Mismatched Passwords
- [ ] Enter password: `NewPassword123`
- [ ] Enter confirmation: `DifferentPassword123`
- [ ] Click "Reset Password"
- [ ] Verify error: "Passwords do not match"

### Sub-test 4c: Valid Password
- [ ] Enter password: `ValidPassword123`
- [ ] Enter confirmation: `ValidPassword123`
- [ ] Click "Reset Password"
- [ ] Verify redirect back to login page with success message

## Test 5: Password Persistence

**Objective:** Verify new password is saved and works

- [ ] You should be redirected to login page with message: "Password reset successfully..."
- [ ] Enter new password from Test 4c: `ValidPassword123`
- [ ] Click "Continue"
- [ ] Verify successful login and redirect to setup page

## Test 6: Old Password Rejection

**Objective:** Verify old password no longer works

- [ ] Navigate back to: `http://localhost:3000/setup/password-prompt`
- [ ] Try original password
- [ ] Verify error: "Incorrect password"

## Test 7: Token Expiration

**Objective:** Verify tokens expire after 1 hour

**Note:** This test requires patience or code modification

### Option A: Real-time (requires waiting)
- [ ] Generate a reset token (Test 2)
- [ ] Wait 1 hour
- [ ] Try to use the reset link
- [ ] Verify error: "Reset link has expired"

### Option B: Test with Modified Code (for quick verification)
- [ ] Modify `src/server.js` line 1218: change `3600000` to `5000` (5 seconds)
- [ ] Restart server
- [ ] Generate new reset token (Test 2)
- [ ] Wait 6 seconds
- [ ] Try to use the reset link
- [ ] Verify error: "Reset link has expired"
- [ ] Revert the code change

## Test 8: Token Uniqueness

**Objective:** Verify each reset request generates a unique token

- [ ] Generate reset token for: `test1@example.com`
- [ ] Note the token from console
- [ ] Generate another reset token for: `test1@example.com`
- [ ] Note the new token from console
- [ ] Verify tokens are different

## Test 9: Webhook Configuration (Production Testing)

**Objective:** Verify webhook integration works (if applicable)

- [ ] Stop server (Ctrl+C)
- [ ] Unset console mode: `unset PASSWORD_RESET_CONSOLE_MODE`
- [ ] Set webhook: `export PASSWORD_RESET_WEBHOOK_URL=http://localhost:3001/webhook`
- [ ] Start a test webhook receiver on port 3001
- [ ] Start OpenClaw server
- [ ] Request password reset
- [ ] Verify webhook receives POST with correct payload:
  ```json
  {
    "to": "user@example.com",
    "subject": "Password Reset Request - OpenClaw Setup",
    "html": "...",
    "resetUrl": "...",
    "expiresAt": ...
  }
  ```

## Test 10: Error Handling

### Sub-test 10a: Missing Email
- [ ] Go to forgot-password page
- [ ] Leave email field empty
- [ ] Click "Send Reset Link"
- [ ] Verify error: "Email is required"

### Sub-test 10b: Invalid Token
- [ ] Navigate to: `http://localhost:3000/setup/reset-password?token=invalid123`
- [ ] Verify error: "Invalid or missing reset token"

## Test 11: Session Security

**Objective:** Verify reset doesn't bypass session auth

- [ ] Complete password reset successfully (Test 5)
- [ ] Verify redirected to login page (not already logged in)
- [ ] Must re-enter new password to access setup page

## Success Criteria

✅ **All Tests Pass When:**
- [x] "Forgot password?" link appears on login page
- [x] Reset tokens generate and display in console
- [x] Reset page loads with valid token
- [x] Password validation works correctly
- [x] New password is persisted to disk
- [x] Old password no longer works
- [x] Tokens expire after 1 hour
- [x] Each reset generates unique token
- [x] Error messages display appropriately
- [x] Webhook receives correct payload (if configured)
- [x] Session security is maintained

## Quick Start Commands

```bash
# Terminal 1: Start OpenClaw with console mode
export PASSWORD_RESET_CONSOLE_MODE=true
npm start

# Terminal 2 (optional): Monitor reset tokens file
watch -n 1 'cat ~/.openclaw/reset-tokens.json | jq .'

# Terminal 3 (optional): Test webhook receiver (requires Node.js)
cat > webhook-test.js << 'EOF'
const http = require('http');
http.createServer((req, res) => {
  if (req.method === 'POST') {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => {
      console.log('Webhook received:', JSON.parse(data));
      res.writeHead(200);
      res.end('{"success":true}');
    });
  }
}).listen(3001);
console.log('Webhook receiver listening on :3001');
EOF
node webhook-test.js
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Password Reset Console Mode not found in logs" | Verify `PASSWORD_RESET_CONSOLE_MODE=true` is set before starting server |
| Reset link returns 404 | Verify token is copied completely from console |
| "Email service not configured" error | Make sure `PASSWORD_RESET_CONSOLE_MODE=true` is set |
| Token not found after restart | Tokens are stored in `~/.openclaw/reset-tokens.json` - ephemeral storage in containers |
| Password update not persisting | Check file permissions on `~/.openclaw/setup.password` (should be 0o600) |

