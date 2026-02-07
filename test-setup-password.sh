#!/bin/bash
# Test script for SETUP_PASSWORD authentication
# This script validates the implementation of password-based authentication

set -e

echo "========================================"
echo "SETUP_PASSWORD Authentication Tests"
echo "========================================"
echo ""

# Cleanup
echo "1. Cleaning up test environment..."
rm -rf /tmp/openclaw-test-data
mkdir -p /tmp/openclaw-test-data
echo "   ✓ Test environment clean"
echo ""

# Test 1: Auto-generated password
echo "2. Testing auto-generated password..."
PORT=8081 \
OPENCLAW_STATE_DIR=/tmp/openclaw-test-data/.openclaw \
OPENCLAW_WORKSPACE_DIR=/tmp/openclaw-test-data/workspace \
node src/server.js > /tmp/server-output.log 2>&1 &
SERVER_PID=$!

# Wait for server to start
sleep 3

# Check if password file was created
if [ ! -f /tmp/openclaw-test-data/.openclaw/setup.password ]; then
    echo "   ✗ Password file not created"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi

# Check file permissions
PERMS=$(stat -c "%a" /tmp/openclaw-test-data/.openclaw/setup.password)
if [ "$PERMS" != "600" ]; then
    echo "   ✗ Incorrect file permissions: $PERMS (expected 600)"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi

echo "   ✓ Password file created with correct permissions (600)"

# Get the auto-generated password
AUTO_PASSWORD=$(cat /tmp/openclaw-test-data/.openclaw/setup.password)
echo "   ✓ Auto-generated password: $AUTO_PASSWORD"

# Test wrong password
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:8081/auth/password -d "password=wrongpassword")
if [ "$RESPONSE" != "302" ]; then
    echo "   ✗ Wrong password test failed (expected 302 redirect, got $RESPONSE)"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi
echo "   ✓ Wrong password correctly rejected"

# Test correct password
RESPONSE=$(curl -s -c /tmp/cookies.txt -o /dev/null -w "%{http_code}" -X POST http://localhost:8081/auth/password -d "password=$AUTO_PASSWORD")
if [ "$RESPONSE" != "302" ]; then
    echo "   ✗ Correct password test failed (expected 302 redirect, got $RESPONSE)"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi
echo "   ✓ Correct password accepted"

# Test authenticated access
RESPONSE=$(curl -s -b /tmp/cookies.txt http://localhost:8081/auth/me)
if [[ "$RESPONSE" != *"passwordAuth"* ]]; then
    echo "   ✗ Authenticated session not established"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi
echo "   ✓ Authenticated session established"

# Cleanup
kill $SERVER_PID 2>/dev/null || true
sleep 1
echo ""

# Test 2: Custom password
echo "3. Testing custom SETUP_PASSWORD..."
rm -rf /tmp/openclaw-test-data
mkdir -p /tmp/openclaw-test-data

CUSTOM_PASSWORD="myCustomPassword123"
PORT=8082 \
SETUP_PASSWORD="$CUSTOM_PASSWORD" \
OPENCLAW_STATE_DIR=/tmp/openclaw-test-data/.openclaw \
OPENCLAW_WORKSPACE_DIR=/tmp/openclaw-test-data/workspace \
node src/server.js > /tmp/server-output2.log 2>&1 &
SERVER_PID=$!

# Wait for server to start
sleep 3

# Check that no password file was created (using env var)
if [ -f /tmp/openclaw-test-data/.openclaw/setup.password ]; then
    echo "   ✗ Password file should not be created when using env var"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi
echo "   ✓ No password file created (using env var)"

# Test custom password
RESPONSE=$(curl -s -c /tmp/cookies2.txt -o /dev/null -w "%{http_code}" -X POST http://localhost:8082/auth/password -d "password=$CUSTOM_PASSWORD")
if [ "$RESPONSE" != "302" ]; then
    echo "   ✗ Custom password test failed (expected 302 redirect, got $RESPONSE)"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi
echo "   ✓ Custom password works correctly"

# Cleanup
kill $SERVER_PID 2>/dev/null || true
sleep 1
echo ""

# Test 3: Unauthenticated access protection
echo "4. Testing unauthenticated access protection..."
PORT=8083 \
SETUP_PASSWORD="testpass" \
OPENCLAW_STATE_DIR=/tmp/openclaw-test-data/.openclaw \
OPENCLAW_WORKSPACE_DIR=/tmp/openclaw-test-data/workspace \
node src/server.js > /tmp/server-output3.log 2>&1 &
SERVER_PID=$!

sleep 3

# Test unauthenticated API access
RESPONSE=$(curl -s http://localhost:8083/setup/api/status)
if [[ "$RESPONSE" != *"Not authenticated"* ]]; then
    echo "   ✗ Unauthenticated API access not blocked"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi
echo "   ✓ Unauthenticated API access blocked"

# Test healthcheck (should be public)
RESPONSE=$(curl -s http://localhost:8083/setup/healthz)
if [[ "$RESPONSE" != *"\"ok\":true"* ]]; then
    echo "   ✗ Healthcheck endpoint not accessible"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi
echo "   ✓ Healthcheck endpoint is public"

# Cleanup
kill $SERVER_PID 2>/dev/null || true
sleep 1
rm -rf /tmp/openclaw-test-data
rm -f /tmp/cookies.txt /tmp/cookies2.txt
rm -f /tmp/server-output.log /tmp/server-output2.log /tmp/server-output3.log
echo ""

echo "========================================"
echo "All tests passed! ✓"
echo "========================================"
