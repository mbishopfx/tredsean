#!/bin/bash

echo "🔍 SMS Gateway Device Status Monitor"
echo "===================================="

while true; do
    DEVICE_STATUS=$(curl -s -H "Authorization: Basic $(echo -n 'AUZNLR:mpx-bhqzhm8bvg' | base64)" "https://api.sms-gate.app/3rdparty/v1/device")
    
    if echo "$DEVICE_STATUS" | grep -q "lastSeen"; then
        LAST_SEEN=$(echo "$DEVICE_STATUS" | grep -o '"lastSeen":"[^"]*"' | cut -d'"' -f4)
        CURRENT_TIME=$(date -u +"%Y-%m-%dT%H:%M:%S")
        
        echo "📱 Device: motorola/fogona_g (Sean's phone)"
        echo "🕒 Last Seen: $LAST_SEEN"
        echo "🕒 Current Time: $CURRENT_TIME"
        
        # Calculate time difference (simplified check)
        if echo "$LAST_SEEN" | grep -q "$(date -u +"%Y-%m-%d")"; then
            echo "✅ Device was online today - Good!"
        else
            echo "❌ Device was NOT online today - Sean needs to open SMS Gateway app!"
        fi
        
        echo "---"
    else
        echo "❌ Could not retrieve device status"
        echo "Response: $DEVICE_STATUS"
    fi
    
    echo "Checking again in 30 seconds... (Press Ctrl+C to stop)"
    sleep 30
done 