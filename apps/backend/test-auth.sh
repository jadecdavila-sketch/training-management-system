#!/bin/bash

# Test Authentication Flow
echo "========================================="
echo "Testing Authentication System"
echo "========================================="
echo ""

# Base URL
BASE_URL="http://localhost:4000/api"

echo "1. Test registration (should succeed)"
echo "-----------------------------------"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#abc",
    "name": "Test User",
    "role": "FACILITATOR"
  }')
echo "$REGISTER_RESPONSE" | jq '.'

# Extract access token from registration
ACCESS_TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.data.accessToken // empty')
echo ""
echo "Access Token: ${ACCESS_TOKEN:0:50}..."
echo ""

echo "2. Test login (should succeed)"
echo "-----------------------------------"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#abc"
  }')
echo "$LOGIN_RESPONSE" | jq '.'

# Extract access token from login
ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.accessToken // empty')
echo ""

echo "3. Test /auth/me with token (should succeed)"
echo "-----------------------------------"
curl -s -X GET "$BASE_URL/auth/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.'
echo ""

echo "4. Test protected route (GET /participants) with token (should succeed)"
echo "-----------------------------------"
curl -s -X GET "$BASE_URL/participants?page=1&pageSize=10" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.'
echo ""

echo "5. Test protected route without token (should fail)"
echo "-----------------------------------"
curl -s -X GET "$BASE_URL/participants" | jq '.'
echo ""

echo "6. Test login with wrong password (should fail)"
echo "-----------------------------------"
curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "WrongPassword123!"
  }' | jq '.'
echo ""

echo "7. Test role-based access (try to create program as FACILITATOR - should fail)"
echo "-----------------------------------"
curl -s -X POST "$BASE_URL/programs" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Program",
    "duration": 5,
    "sessions": [
      {
        "title": "Test Session",
        "duration": 60,
        "order": 1
      }
    ],
    "cohorts": [
      {
        "name": "Test Cohort",
        "startDate": "2025-11-01T09:00:00Z",
        "endDate": "2025-11-05T17:00:00Z",
        "capacity": 20
      }
    ]
  }' | jq '.'
echo ""

echo "========================================="
echo "Authentication Tests Complete"
echo "========================================="
