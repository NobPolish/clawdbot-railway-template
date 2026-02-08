# Password Reset - Quick Test Guide

## Step 1: Configure Environment Variable

**In the v0 UI Vars section (left sidebar):**
1. Click "Vars" in the left sidebar
2. Click "Add Variable"
3. Enter Key: `PASSWORD_RESET_CONSOLE_MODE`
4. Enter Value: `true`
5. Click "Save"
6. The dev server will automatically restart

## Step 2: Verify Login Page

1. Open the Preview tab (you should see it running)
2. Navigate to: `/setup/password-prompt`
3. **Expected Result:** You should see the login form with a "Forgot password?" link at the bottom

## Step 3: Test Token Generation

1. Click "Forgot password?" link
2. You should land on: `/setup/forgot-password`
3. Enter email: `testuser@example.com`
4. Click "Send Reset Link"
5. **Check Console Output:**
   - Open the terminal/console where the dev server is running
   - Look for output like:
   ```
   [reset] PASSWORD RESET LINK FOR testuser@example.com:
   http://localhost:PORT/setup/reset-password?token=abc123def456...
   ```
6. **Copy the complete reset URL** from console output

## Step 4: Test Reset Form

1. Paste the reset URL into your browser address bar
2. **Expected:** You should see the "Reset Password" form with:
   - "New Password" field
   - "Confirm Password" field
   - "Reset Password" button

## Step 5: Validate Password Rules

### Test 5a: Too Short (Should Fail)
1. Enter: `pass` (only 4 chars)
2. Confirm: `pass`
3. Click "Reset Password"
4. **Expected Error:** "Password must be at least 8 characters"

### Test 5b: Mismatch (Should Fail)
1. Enter: `Password123`
2. Confirm: `Different456`
3. Click "Reset Password"
4. **Expected Error:** "Passwords do not match"

### Test 5c: Valid Password (Should Succeed)
1. Enter: `MyNewPassword123`
2. Confirm: `MyNewPassword123`
3. Click "Reset Password"
4. **Expected:** Redirect to login page with success message

## Step 6: Verify Password Persistence

1. You should now be on `/setup/password-prompt` with a success message
2. Enter your new password: `MyNewPassword123`
3. Click "Continue"
4. **Expected:** Successful login to setup page

## Step 7: Verify Old Password Doesn't Work

1. Navigate back to: `/setup/password-prompt`
2. Try your original password
3. Click "Continue"
4. **Expected Error:** "Incorrect password"

## Success Checklist

- [ ] "Forgot password?" link appears on login page
- [ ] Forgot password page loads and accepts email
- [ ] Reset token generates and logs to console
- [ ] Reset form validates password length (8+ chars)
- [ ] Reset form validates password match
- [ ] New password successfully logs you in
- [ ] Old password no longer works
- [ ] New password persists after logout/login

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Don't see reset link in console | Check that `PASSWORD_RESET_CONSOLE_MODE=true` is in Vars and server restarted |
| Reset URL returns 404 | Make sure you copied the entire token from console output |
| "Forgot password?" link missing | Refresh browser and hard-clear cache (Ctrl+Shift+Del) |
| Password update doesn't persist | Check file permissions on ~/.openclaw/setup.password |

## Next Steps

Once all tests pass:
1. Remove `PASSWORD_RESET_CONSOLE_MODE` from Vars
2. Set `PASSWORD_RESET_WEBHOOK_URL` to your email service webhook (SendGrid, Mailgun, etc.)
3. Test production webhook flow with actual email delivery
