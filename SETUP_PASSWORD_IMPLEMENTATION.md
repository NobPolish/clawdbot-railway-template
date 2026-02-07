# SETUP_PASSWORD Implementation

## Overview

This document describes the implementation of SETUP_PASSWORD authentication for the OpenClaw Railway Template, addressing a critical security gap where the `/setup` configuration panel was completely unprotected when GitHub OAuth was not configured.

## Problem Statement

Previously, the application documented SETUP_PASSWORD extensively across multiple files (README.md, .env.example, DEPLOYMENT.md, etc.) but did not actually implement password-based authentication. The setup panel was only protected when GitHub OAuth was configured, leaving deployments without OAuth completely unprotected.

## Solution

Implemented a complete password authentication system with the following features:

### 1. Password Configuration
- **Environment Variable**: Reads from `SETUP_PASSWORD` env var if provided
- **Auto-Generation**: If not provided, generates a secure 32-character hex password using `crypto.randomBytes(16)`
- **Persistence**: Auto-generated passwords are saved to `{STATE_DIR}/setup.password` with 0600 permissions
- **Visibility**: Auto-generated password is prominently displayed in startup logs

### 2. Authentication Flow
- **Password Form**: Added password input as the primary authentication method on login page
- **GitHub OAuth**: Remains available as an alternative (shown below password form with divider)
- **Session Management**: Password authentication sets `passwordAuth` flag in session
- **Dual Auth Support**: Both password and OAuth authentication methods work simultaneously

### 3. Security Features
- **Timing-Safe Comparison**: Uses `crypto.timingSafeEqual()` for constant-time password verification
- **File Permissions**: Password files created with mode 0600 (owner read/write only)
- **Session Security**: HttpOnly cookies with secure flag in production
- **No Password Storage**: Password only stored in env var or auto-generated file, never in database

## Files Modified

### src/server.js
- Added `resolveSetupPassword()` function (lines ~34-59)
- Updated `requireAuth()` middleware to support password auth (lines ~374-405)
- Redesigned `loginPageHTML()` with password form (lines ~419-584)
- Added `POST /auth/password` route handler (lines ~690-714)
- Updated session checks in `/auth/login` and `/auth/me`

## Usage

### With Custom Password
```bash
SETUP_PASSWORD=mySecurePassword123 node src/server.js
```

### With Auto-Generated Password
```bash
node src/server.js
# Check logs for: "Auto-generated password: abc123..."
```

### In Railway
Set the `SETUP_PASSWORD` environment variable in your Railway project settings, or let it auto-generate (check deployment logs for the password).

## Testing

Verified functionality:
- ✅ Auto-generated password displayed in logs
- ✅ Auto-generated password persisted to file with correct permissions (0600)
- ✅ Custom password from env var works correctly
- ✅ Correct password grants access to /setup
- ✅ Incorrect password redirects to login with error
- ✅ Unauthenticated requests to /setup/api/* return 401
- ✅ Authenticated requests can access protected routes
- ✅ GitHub OAuth still works when configured
- ✅ Both auth methods can coexist

## Security Considerations

### Implemented
- ✅ Timing-safe password comparison using `crypto.timingSafeEqual()`
- ✅ Secure password generation using `crypto.randomBytes()`
- ✅ Restrictive file permissions (0600) on password file
- ✅ HttpOnly session cookies
- ✅ Secure cookies in production environments
- ✅ No password stored in plain text in code or database

### Known Limitations (CodeQL Findings)
- ⚠️ **Rate Limiting**: Password authentication endpoint is not rate-limited. Consider adding `express-rate-limit` middleware for production deployments to prevent brute-force attacks.
- ⚠️ **CSRF Protection**: Application does not implement CSRF tokens. Consider adding `csurf` middleware if supporting multi-user scenarios.

These limitations are acceptable for a single-user setup tool but should be addressed for production multi-user deployments.

## Backward Compatibility

The implementation maintains full backward compatibility:
- GitHub OAuth authentication continues to work unchanged
- Existing deployments with OAuth configured will continue to function
- Both authentication methods can be used simultaneously
- Session structure extended (added `passwordAuth` flag) but doesn't break existing sessions

## Migration Path

For existing deployments:
1. **If using GitHub OAuth**: No changes needed, OAuth continues to work
2. **If not using OAuth**: Set `SETUP_PASSWORD` env var or use auto-generated password from logs
3. **Transitioning from OAuth to password**: Simply set `SETUP_PASSWORD` and use password form
4. **Disabling OAuth**: Remove `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`, password auth takes over

## Future Improvements

Potential enhancements for future releases:
- [ ] Add rate limiting middleware to prevent brute-force attacks
- [ ] Add CSRF protection for POST requests
- [ ] Support password rotation/change via UI
- [ ] Add optional 2FA/TOTP support
- [ ] Implement password strength requirements
- [ ] Add audit logging for authentication attempts
