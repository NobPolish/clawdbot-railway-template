# Migration Guide: Enabling SETUP_PASSWORD Authentication

## Overview

This guide helps existing OpenClaw Railway Template users enable the new SETUP_PASSWORD authentication system.

## What Changed?

Previously, the `/setup` panel was only protected when GitHub OAuth was configured. Without OAuth, anyone could access your setup page.

Now, **SETUP_PASSWORD authentication is always active**, providing security even without GitHub OAuth configuration.

## Migration Scenarios

### Scenario 1: Currently Using GitHub OAuth

**No action required!** Your existing GitHub OAuth continues to work. You can optionally add SETUP_PASSWORD for dual authentication.

**Optional: Add Password Auth**
1. In Railway dashboard, go to your project
2. Add environment variable: `SETUP_PASSWORD=YourSecurePassword123`
3. Redeploy
4. You can now use either GitHub OAuth OR password to sign in

### Scenario 2: Not Using Any Authentication (Unsafe!)

**Action required immediately!** Your setup panel is currently unprotected.

**Option A: Let Railway Auto-Generate Password (Recommended)**
1. Redeploy your Railway project
2. Check deployment logs for: `SETUP_PASSWORD was not configured. Auto-generated password: abc123...`
3. Save this password securely
4. Use it to sign in at `/setup`

**Option B: Set Custom Password**
1. In Railway dashboard, go to your project
2. Add environment variable: `SETUP_PASSWORD=YourSecurePassword123`
   - Use at least 16 characters
   - Mix letters, numbers, and symbols
   - Keep it secret!
3. Redeploy
4. Sign in with your custom password

**Option C: Enable GitHub OAuth (Most Secure)**
1. Create a GitHub OAuth App at https://github.com/settings/developers
2. Set Authorization callback URL to: `https://your-app.railway.app/auth/github/callback`
3. In Railway dashboard, add environment variables:
   - `GITHUB_CLIENT_ID=your_client_id`
   - `GITHUB_CLIENT_SECRET=your_client_secret`
   - (Optional) `GITHUB_ALLOWED_USERS=your-github-username` to restrict access
4. Redeploy
5. Sign in via GitHub

### Scenario 3: Want to Transition from OAuth to Password

1. In Railway dashboard, add: `SETUP_PASSWORD=YourSecurePassword123`
2. Redeploy
3. You can now use password or GitHub OAuth
4. (Optional) Remove GitHub OAuth vars if you want password-only

## Railway Deployment Steps

### Adding SETUP_PASSWORD to Railway

1. **Open your Railway project**
   - Go to https://railway.app/dashboard
   - Select your OpenClaw project

2. **Add environment variable**
   - Click on your service
   - Go to "Variables" tab
   - Click "New Variable"
   - Name: `SETUP_PASSWORD`
   - Value: Your secure password (min 16 chars recommended)

3. **Redeploy**
   - Railway will automatically redeploy with the new variable
   - Or manually trigger: Settings → Redeploy

4. **Verify**
   - Visit your app: `https://your-app.railway.app/setup`
   - You should see the password login form
   - Sign in with your password

## Security Best Practices

### Password Requirements
- **Minimum 16 characters** recommended
- Mix uppercase, lowercase, numbers, and symbols
- Don't use common words or patterns
- Don't reuse passwords from other services

### Good Password Examples
```
SecureSetup2024!OpenClaw
Ry1w4y_0penCl@w_Secure
MyC0mpl3x!Setup&Password
```

### Auto-Generated Passwords
If you let Railway auto-generate a password:
- It creates a 32-character hex string
- Example: `f1c707bda35de7f993c4e2745176f456`
- Very secure but hard to remember
- **Save it immediately** - it's only shown once in logs

### Finding Your Auto-Generated Password

1. Go to Railway dashboard
2. Select your service
3. Click "Deployments"
4. Click on the latest deployment
5. View "Deploy Logs"
6. Search for: `Auto-generated password:`
7. Copy the password shown below

## Troubleshooting

### I Lost My Auto-Generated Password

**Solution 1: Check Deployment Logs**
- Railway keeps logs for recent deployments
- Look in deploy logs for "Auto-generated password:"

**Solution 2: Set a New Password**
- Add `SETUP_PASSWORD` env var with a new password
- Redeploy
- This overrides the auto-generated password

**Solution 3: Reset**
- Remove the Railway Volume
- Redeploy
- New password will be auto-generated
- ⚠️ This deletes all your configuration!

### Login Page Shows "Invalid Password"

- Double-check you're using the correct password
- Check for extra spaces or copy-paste issues
- Password is case-sensitive
- If using env var, verify it's set correctly in Railway

### I Want to Change My Password

**Option 1: Update Env Var (if using custom password)**
1. Go to Railway Variables
2. Update `SETUP_PASSWORD` value
3. Redeploy

**Option 2: Delete and Regenerate (if using auto-generated)**
1. Railway doesn't support SSH/shell access
2. Must use Railway Volume management or redeploy to reset

### GitHub OAuth Stopped Working

If you added SETUP_PASSWORD and GitHub OAuth broke:
- Check that `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are still set
- Verify the OAuth callback URL: `https://your-app.railway.app/auth/github/callback`
- Both password and OAuth should work simultaneously

## FAQ

### Can I use both password and GitHub OAuth?
**Yes!** Both authentication methods work simultaneously. Users can choose either method on the login page.

### Is the password stored in plain text?
**No.** The password is:
- Read from environment variable (Railway encrypted secrets)
- Or stored in a file with 0600 permissions (owner-only access)
- Compared using timing-safe comparison
- Never logged or exposed in responses

### Can I disable password auth and use only OAuth?
Password auth is always active (even if OAuth is configured), but you can make it very difficult by:
- Using a very long random password
- Only sharing OAuth access with your team
- Keeping the password secret

### What happens if I deploy without setting SETUP_PASSWORD?
Railway will auto-generate a secure password and show it in the deployment logs. You must retrieve it from the logs to access your setup panel.

### Is the auto-generated password stable across redeploys?
**Yes!** The auto-generated password is saved to a file in your Railway Volume, so it persists across redeploys. You only need to retrieve it once from the initial deployment logs.

### Can I rotate passwords?
Yes, update the `SETUP_PASSWORD` environment variable in Railway and redeploy. Active sessions will remain valid until they expire (30 days).

## Support

For issues or questions:
- File an issue: https://github.com/NobPolish/clawdbot-railway-template/issues
- Check documentation: README.md, SETUP_PASSWORD_IMPLEMENTATION.md
- Railway docs: https://docs.railway.app
