#!/bin/bash
# Test script for Flask API with cURL commands

# Set the base URL for your API
BASE_URL="http://localhost:5001"

# Colors for better readability
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting API tests with cURL${NC}"

# Test 1: Get all profiles
echo -e "\n${BLUE}Test 1: Get all profiles${NC}"
curl -s -X GET "${BASE_URL}/api/profiles" | jq .

# Test 2: Get a specific profile (replace with an actual UserID if you have one)
echo -e "\n${BLUE}Test 2: Get a specific profile${NC}"
curl -s -X GET "${BASE_URL}/api/profile/test_user_123" | jq .

# Test 3: Create a new profile
echo -e "\n${BLUE}Test 3: Create a new profile${NC}"
curl -s -X POST \
  "${BASE_URL}/api/profile" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user_123",
    "displayName": "Test User",
    "pictureUrl": "https://example.com/pic.jpg",
    "statusMessage": "Testing the API"
  }' | jq .

# Test 4: Update an existing profile
echo -e "\n${BLUE}Test 4: Update an existing profile${NC}"
curl -s -X POST \
  "${BASE_URL}/api/profile" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user_123",
    "displayName": "Updated Test User",
    "statusMessage": "Profile has been updated"
  }' | jq .

# Test 5: Get the updated profile
echo -e "\n${BLUE}Test 5: Get the updated profile${NC}"
curl -s -X GET "${BASE_URL}/api/profile/test_user_123" | jq .

# Test 6: Batch insert profiles
echo -e "\n${BLUE}Test 6: Batch insert profiles${NC}"
curl -s -X POST \
  "${BASE_URL}/api/profiles/batch" \
  -H "Content-Type: application/json" \
  -d '[
    {
      "UserID": "batch_user_1",
      "DisplayName": "Batch User 1",
      "PictureURL": "https://example.com/batch1.jpg",
      "StatusMessage": "First batch user"
    },
    {
      "UserID": "batch_user_2",
      "DisplayName": "Batch User 2",
      "PictureURL": "https://example.com/batch2.jpg",
      "StatusMessage": "Second batch user"
    }
  ]' | jq .

# Test 7: Raw SQL query to select all
echo -e "\n${BLUE}Test 7: Raw SQL query to select all${NC}"
curl -s -X GET "${BASE_URL}/selectAll" | jq .

echo -e "\n${GREEN}All tests completed${NC}"

# Note: These tests are sequential and assume the API is running at http://localhost:5001
# Install jq for pretty JSON output: sudo apt-get install jq (Linux) or brew install jq (macOS)