#!/bin/bash
# Password Reset Testing Script
# This script helps you test the password reset flow end-to-end

echo "================================"
echo "OpenClaw Password Reset Test"
echo "================================"
echo ""

# Check if PASSWORD_RESET_CONSOLE_MODE is set
if [ -z "$PASSWORD_RESET_CONSOLE_MODE" ]; then
  echo "⚠️  PASSWORD_RESET_CONSOLE_MODE not set"
  echo "Setting it now for testing..."
  export PASSWORD_RESET_CONSOLE_MODE=true
  echo "✅ Console mode enabled"
else
  echo "✅ Console mode already enabled"
fi

echo ""
echo "Starting server..."
echo "Once started, open your browser to:"
echo "  http://localhost:3000/setup/password-prompt"
echo ""
echo "Then click 'Forgot password?' and follow these steps:"
echo ""
echo "STEP 1: Enter any test email (e.g., test@example.com)"
echo "STEP 2: Check the server console below for the reset link"
echo "STEP 3: Copy the reset link from console output"
echo "STEP 4: Paste the link in your browser"
echo "STEP 5: Enter a new password (minimum 8 characters)"
echo "STEP 6: Verify login works with new password"
echo ""
echo "================================"
echo "Starting OpenClaw server..."
echo "================================"
echo ""

npm start
