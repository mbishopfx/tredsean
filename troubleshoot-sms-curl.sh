#!/bin/bash

echo "🚀 Starting SMS Troubleshooting Tests..."
echo "============================================"

# Test configuration
MATT_PHONE="+14176297373"  # Update with your actual number
SMS_GATEWAY_AUTH="AUZNLR:mpx-bhqzhm8bvg"
BASE_URL="https://tredsean.vercel.app"

echo ""
echo "📊 Test 1: Checking SMS Gateway Device Status..."
echo "================================================"

DEVICE_STATUS=$(curl -s -w "HTTP_STATUS:%{http_code}" \
  -H "Authorization: Basic $(echo -n $SMS_GATEWAY_AUTH | base64)" \
  "https://smsgateway.me/api/v4/device")

HTTP_STATUS=$(echo $DEVICE_STATUS | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
RESPONSE_BODY=$(echo $DEVICE_STATUS | sed 's/HTTP_STATUS:[0-9]*$//')

echo "HTTP Status: $HTTP_STATUS"
echo "Response: $RESPONSE_BODY"

if [ "$HTTP_STATUS" = "200" ]; then
  echo "✅ SMS Gateway device is reachable"
else
  echo "❌ SMS Gateway device is NOT reachable"
fi

echo ""
echo "🔧 Test 2: Testing Direct SMS Gateway API..."
echo "============================================="

DIRECT_SMS=$(curl -s -w "HTTP_STATUS:%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic $(echo -n $SMS_GATEWAY_AUTH | base64)" \
  -d '{
    "message": "Direct API test message from troubleshoot script",
    "phoneNumbers": ["'$MATT_PHONE'"]
  }' \
  "https://smsgateway.me/api/v4/message/send")

HTTP_STATUS=$(echo $DIRECT_SMS | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
RESPONSE_BODY=$(echo $DIRECT_SMS | sed 's/HTTP_STATUS:[0-9]*$//')

echo "HTTP Status: $HTTP_STATUS"
echo "Response: $RESPONSE_BODY"

if [ "$HTTP_STATUS" = "200" ]; then
  echo "✅ Direct SMS Gateway API call successful"
else
  echo "❌ Direct SMS Gateway API call failed"
fi

echo ""
echo "🧪 Test 3: Testing Our SMS API Endpoint..."
echo "=========================================="

OUR_SMS=$(curl -s -w "HTTP_STATUS:%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumbers": ["'$MATT_PHONE'"],
    "message": "Single message test",
    "provider": "personal",
    "credentials": {
      "provider": "personal",
      "email": "sean@trurankdigital.com",
      "password": "Croatia5376!",
      "cloudUsername": "AUZNLR",
      "cloudPassword": "mpx-bhqzhm8bvg"
    },
    "campaignId": "single_test_'$(date +%s)'"
  }' \
  "$BASE_URL/api/sms/send")

HTTP_STATUS=$(echo $OUR_SMS | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
RESPONSE_BODY=$(echo $OUR_SMS | sed 's/HTTP_STATUS:[0-9]*$//')

echo "HTTP Status: $HTTP_STATUS"
echo "Response: $RESPONSE_BODY"

if [ "$HTTP_STATUS" = "200" ]; then
  echo "✅ Our SMS API endpoint call successful"
else
  echo "❌ Our SMS API endpoint call failed"
fi

echo ""
echo "📋 TROUBLESHOOTING SUMMARY:"
echo "=========================="

if [ "$HTTP_STATUS" != "200" ]; then
  echo "🔴 Main Issue Identified:"
  if echo "$RESPONSE_BODY" | grep -q "unauthorized\|401\|403"; then
    echo "   → Authentication/Credentials Issue"
    echo "   → Check Sean's SMS Gateway app credentials"
  elif echo "$RESPONSE_BODY" | grep -q "timeout\|503\|500"; then
    echo "   → SMS Gateway app may be offline"
    echo "   → Check Sean's phone connectivity and app status"
  elif echo "$RESPONSE_BODY" | grep -q "rate limit\|429"; then
    echo "   → Rate limiting detected"
    echo "   → Too many requests sent too quickly"
  else
    echo "   → Unknown API error"
    echo "   → Check response details above"
  fi
fi

echo ""
echo "💡 Next Steps:"
echo "1. Check Sean's SMS Gateway app is running and online"
echo "2. Verify internet connectivity on Sean's phone"
echo "3. Check if cloud server is enabled in SMS Gateway app"
echo "4. Try sending a manual test from SMS Gateway app interface"
echo "5. Check SMS Gateway app logs for any error messages" 