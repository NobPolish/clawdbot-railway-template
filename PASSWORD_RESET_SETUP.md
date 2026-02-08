# Password Reset Configuration Guide

## Overview

The OpenClaw setup includes a complete password recovery system that allows locked-out users to reset their password without requiring direct admin intervention.

## How It Works

1. User clicks "Forgot password?" on the login page
2. User enters their email address
3. System generates a secure, time-limited token (valid for 1 hour)
4. Token is sent via configured delivery method (webhook, console, or email service)
5. User clicks the reset link and enters a new password
6. System validates and updates the password

## Setup Instructions

### Option 1: Console Mode (Development/Testing)

**Best for:** Local development, testing, and troubleshooting

1. Set environment variable:
   ```bash
   PASSWORD_RESET_CONSOLE_MODE=true
   ```

2. When users request a password reset, the reset link will be logged to the server console:
   ```
   [reset] PASSWORD RESET LINK FOR user@example.com:
   http://localhost:3000/setup/reset-password?token=abc123...
   ```

3. Copy the link and share with the user, or use it directly for testing

### Option 2: Webhook Mode (Production)

**Best for:** Production deployments with email services like SendGrid, Mailgun, or custom webhook handlers

1. Set environment variables:
   ```bash
   PASSWORD_RESET_WEBHOOK_URL=https://your-email-service.com/send
   ```

2. When a reset is requested, the system POSTs to your webhook with this payload:
   ```json
   {
     "to": "user@example.com",
     "subject": "Password Reset Request - OpenClaw Setup",
     "html": "<h2>Password Reset Request</h2><p>Click to reset: <a href=\"...\">Reset Password</a></p>...",
     "resetUrl": "https://your-domain.com/setup/reset-password?token=abc123...",
     "expiresAt": 1707123456789
   }
   ```

3. Your webhook handler should:
   - Parse the reset URL and send it to the user via email
   - Respect the `expiresAt` timestamp (token is valid for 1 hour from request)
   - Handle errors gracefully

**Example webhook handler (Node.js):**
```javascript
app.post('/send-reset-email', (req, res) => {
  const { to, subject, html, resetUrl, expiresAt } = req.body;
  
  // Send email using your service (SendGrid, Mailgun, etc.)
  emailService.send({
    to,
    subject,
    html,
  }).then(() => {
    res.json({ success: true });
  }).catch((err) => {
    console.error('Email send failed:', err);
    res.status(500).json({ error: 'Failed to send email' });
  });
});
```

### Option 3: No Configuration (Manual Admin Reset)

If neither console mode nor webhook is configured, users can still request a reset, but will see a message to contact their administrator. The admin can then manually reset the password or provide a reset link.

## Environment Variables Reference

| Variable | Purpose | Example | Required |
|----------|---------|---------|----------|
| `PASSWORD_RESET_CONSOLE_MODE` | Enable console logging of reset links | `true` | No |
| `PASSWORD_RESET_WEBHOOK_URL` | Webhook endpoint for sending reset emails | `https://api.sendgrid.com/v3/mail/send` | No |

**Note:** You only need ONE of the above configured. Console mode takes priority if both are set.

## Security Features

- **Time-limited tokens**: Each reset token expires after 1 hour
- **Single-use tokens**: Tokens are deleted after successful password reset
- **Timing-safe comparison**: Password verification uses crypto.timingSafeEqual() to prevent timing attacks
- **Server-side storage**: Tokens are stored on disk, not sent to client
- **Secure password requirements**: Minimum 8 characters, confirmation validation

## Testing the Password Reset Flow

### Manual Testing Steps

1. **Start the server** with console mode enabled:
   ```bash
   PASSWORD_RESET_CONSOLE_MODE=true npm start
   ```

2. **Navigate to login page** and click "Forgot password?"

3. **Enter test email** (any email address will work in console mode):
   ```
   testuser@example.com
   ```

4. **Check server console** for the reset link output:
   ```
   [reset] PASSWORD RESET LINK FOR testuser@example.com:
   http://localhost:3000/setup/reset-password?token=abc123def456...
   ```

5. **Click the link or copy-paste** to your browser

6. **Set new password**:
   - Must be at least 8 characters
   - Must match confirmation field
   - No special requirements

7. **Verify the reset worked**:
   - Try logging in with the new password
   - Try the old password (should fail)

### Testing Token Expiration

1. Generate a reset token (follow steps 1-4 above)
2. Wait for token to expire (1 hour)
3. Try to use the expired token
4. Should see: "Reset link has expired. Please request a new one."

### Testing in Production (with webhook)

1. Set `PASSWORD_RESET_WEBHOOK_URL` to your email service endpoint
2. Request a password reset
3. Check that your email service received the webhook POST
4. Verify the reset link works when sent to user
5. Monitor server logs for any webhook failures

## Troubleshooting

### "Email service not configured"

**Problem:** User sees this error when requesting a reset

**Solution:** 
- For development: Set `PASSWORD_RESET_CONSOLE_MODE=true`
- For production: Set `PASSWORD_RESET_WEBHOOK_URL` to your email endpoint

### Reset link appears malformed or has wrong domain

**Problem:** Links in console log or email have incorrect domain

**Solution:**
- Ensure your app is accessible at the domain shown in the link
- Check `X-Forwarded-Proto` and `X-Forwarded-Host` headers if behind a proxy
- Verify Railway/hosting environment is configured correctly

### Tokens not being deleted after successful reset

**Problem:** Old reset tokens accumulate on disk

**Solution:**
- This is normal; tokens are cleaned up when used
- Expired tokens are only removed when someone tries to use them
- To manually clean up: Delete `~/.openclaw/reset-tokens.json` (will be recreated on next reset)

### Reset tokens disappear between server restarts

**Problem:** Tokens generated before restart can't be used

**Solution:**
- This is expected behavior
- Tokens are persisted to disk but lost if server storage is ephemeral
- For production: Use persistent storage or implement token database persistence

## Next Steps

1. Choose your delivery method (console, webhook, or manual)
2. Set the appropriate environment variable
3. Test the flow following the testing steps above
4. Deploy to production with your chosen configuration

## Additional Resources

- OpenClaw Repository: https://github.com/NobPolish/clawdbot-railway-template
- Railway Documentation: https://docs.railway.app/
- Security Best Practices: https://owasp.org/www-community/attacks/Password_Reset_Token_Attacks
