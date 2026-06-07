#!/bin/bash

# Configuration
API_URL="http://localhost:3001/api"
CONSUMER_EMAIL="consumer_$(date +%s)@example.com"
PROVIDER_EMAIL="provider_$(date +%s)@example.com"
PASSWORD="password123"

echo "--- Starting End-to-End Integration Test ---"

# 1. Register a consumer account
echo "1. Registering consumer..."
CONSUMER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"Test Consumer\", \"email\": \"$CONSUMER_EMAIL\", \"password\": \"$PASSWORD\", \"phone\": \"1234567890\", \"role\": \"consumer\"}")

CONSUMER_TOKEN=$(echo "$CONSUMER_RESPONSE" | jq -r '.token // empty')
CONSUMER_ID=$(echo "$CONSUMER_RESPONSE" | jq -r '.user.id // empty')

if [ -z "$CONSUMER_TOKEN" ]; then
  echo "FAILED: Consumer registration failed"
  echo "$CONSUMER_RESPONSE"
  exit 1
fi
echo "SUCCESS: Consumer registered (ID: $CONSUMER_ID)"

# 2. Register a provider account
echo "2. Registering provider..."
PROVIDER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"Test Provider\", \"email\": \"$PROVIDER_EMAIL\", \"password\": \"$PASSWORD\", \"phone\": \"0987654321\", \"role\": \"provider\"}")

PROVIDER_TOKEN=$(echo "$PROVIDER_RESPONSE" | jq -r '.token // empty')
PROVIDER_ID=$(echo "$PROVIDER_RESPONSE" | jq -r '.user.id // empty')

if [ -z "$PROVIDER_TOKEN" ]; then
  echo "FAILED: Provider registration failed"
  echo "$PROVIDER_RESPONSE"
  exit 1
fi
echo "SUCCESS: Provider registered (ID: $PROVIDER_ID)"

# 3. Consumer creates a service request
echo "3. Consumer creating service request..."
REQUEST_RESPONSE=$(curl -s -X POST "$API_URL/requests" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CONSUMER_TOKEN" \
  -d "{\"title\": \"Test Service\", \"description\": \"Integration test request\", \"budget\": 100, \"voice_note_url\": \"\", \"latitude\": 40.7128, \"longitude\": -74.0060}")

REQUEST_ID=$(echo "$REQUEST_RESPONSE" | jq -r '.id // empty')

if [ -z "$REQUEST_ID" ]; then
  echo "FAILED: Service request creation failed"
  echo "$REQUEST_RESPONSE"
  exit 1
fi
echo "SUCCESS: Service request created (ID: $REQUEST_ID)"

# 4. Provider sees it in their feed
echo "4. Provider checking feed..."
FEED_RESPONSE=$(curl -s -X GET "$API_URL/providers/feed" \
  -H "Authorization: Bearer $PROVIDER_TOKEN")

if echo "$FEED_RESPONSE" | jq -e ".[] | select(.id == \"$REQUEST_ID\")" > /dev/null; then
  echo "SUCCESS: Request found in provider feed"
else
  echo "FAILED: Request NOT found in provider feed"
  echo "$FEED_RESPONSE"
  exit 1
fi

# 5. Provider makes an offer
echo "5. Provider making an offer..."
OFFER_RESPONSE=$(curl -s -X POST "$API_URL/requests/$REQUEST_ID/offers" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PROVIDER_TOKEN" \
  -d "{\"price\": 90, \"message\": \"I can do it for 90\"}")

OFFER_ID=$(echo "$OFFER_RESPONSE" | jq -r '.id // empty')

if [ -z "$OFFER_ID" ]; then
  echo "FAILED: Offer creation failed"
  echo "$OFFER_RESPONSE"
  exit 1
fi
echo "SUCCESS: Offer created (ID: $OFFER_ID)"

# 6. Consumer sees the offer and accepts it
echo "6. Consumer accepting the offer..."
ACCEPT_RESPONSE=$(curl -s -X PUT "$API_URL/offers/$OFFER_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CONSUMER_TOKEN" \
  -d "{\"status\": \"accepted\"}")

if [ "$(echo "$ACCEPT_RESPONSE" | jq -r '.status')" == "accepted" ]; then
  echo "SUCCESS: Offer accepted"
else
  echo "FAILED: Offer acceptance failed"
  echo "$ACCEPT_RESPONSE"
  exit 1
fi

# 7. Verify transaction is created
echo "7. Verifying transaction..."
TRANSACTION_COUNT=$(team-db "SELECT count(*) as count FROM transactions WHERE request_id = '$REQUEST_ID'" | jq -r '.[0].count')

if [[ "$TRANSACTION_COUNT" =~ ^[0-9]+$ ]] && [ "$TRANSACTION_COUNT" -gt 0 ]; then
  echo "SUCCESS: Transaction created"
else
  echo "FAILED: Transaction NOT found in database (Count: $TRANSACTION_COUNT)"
  exit 1
fi

# 8. Messages can be sent between them
echo "8. Testing messaging..."
MESSAGE_RESPONSE=$(curl -s -X POST "$API_URL/requests/$REQUEST_ID/messages" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CONSUMER_TOKEN" \
  -d "{\"content\": \"Hello provider!\"}")

if echo "$MESSAGE_RESPONSE" | jq -e '.content == "Hello provider!"' > /dev/null; then
  echo "SUCCESS: Consumer sent message"
else
  echo "FAILED: Consumer failed to send message"
  echo "$MESSAGE_RESPONSE"
  exit 1
fi

MESSAGES_RESPONSE=$(curl -s -X GET "$API_URL/requests/$REQUEST_ID/messages" \
  -H "Authorization: Bearer $PROVIDER_TOKEN")

if echo "$MESSAGES_RESPONSE" | jq -e ".[] | select(.content == \"Hello provider!\")" > /dev/null; then
  echo "SUCCESS: Provider received message"
else
  echo "FAILED: Provider failed to receive message"
  echo "$MESSAGES_RESPONSE"
  exit 1
fi

# 9. Voice upload endpoint works
echo "9. Testing voice upload..."
# Create a minimal valid WAV file for testing (44 byte WAV header + silence)
printf 'RIFF\x24\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00\x44\xac\x00\x00\x88\x58\x01\x00\x02\x00\x10\x00data\x00\x00\x00\x00' > /tmp/dummy_audio.wav
UPLOAD_RESPONSE=$(curl -s -X POST "$API_URL/upload/voice" \
  -H "Authorization: Bearer $CONSUMER_TOKEN" \
  -F "audio=@/tmp/dummy_audio.wav;type=audio/wav")

UPLOAD_URL=$(echo "$UPLOAD_RESPONSE" | jq -r '.url // empty')

if [ -z "$UPLOAD_URL" ]; then
  echo "FAILED: Voice upload failed"
  echo "$UPLOAD_RESPONSE"
  exit 1
fi
echo "SUCCESS: Voice uploaded ($UPLOAD_URL)"

# 10. JWT auth protects all endpoints
echo "10. Verifying JWT protection..."
PROTECTED_RESPONSE=$(curl -s -X GET "$API_URL/requests")
if echo "$PROTECTED_RESPONSE" | jq -e '.message == "No token, authorization denied"' > /dev/null; then
  echo "SUCCESS: Endpoint is protected"
else
  echo "FAILED: Endpoint is NOT protected"
  echo "$PROTECTED_RESPONSE"
  exit 1
fi

echo "--- All Integration Tests Passed! ---"
