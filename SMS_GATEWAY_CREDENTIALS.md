# SMS Gateway Credentials - Team Overview

> **Last Updated:** December 2024  
> **Source:** Authentication system and dedicated endpoints

## 📱 **Active SMS Gateway Devices**

### ✅ **Jon (Jontrd)** - PRIMARY WORKING DEVICE
- **Cloud Username:** `AD2XA0`
- **Cloud Password:** `2nitkjiqnmrrtc`
- **Device:** Samsung (Total Wireless)
- **Status:** 🟢 **ACTIVE** - Guaranteed delivery
- **Endpoint:** `/api/sms-gateway/send-jon`
- **Notes:** Jon's Samsung device is the ONLY device that actually delivers messages consistently
- **Delivery:** ✅ Confirmed working

---

### ✅ **Juan (Juantrd)** - SECONDARY DEVICE
- **Cloud Username:** `GBNSPW`
- **Cloud Password:** `3nneo5hkbyhpti`
- **Device:** Samsung (Juan)
- **Status:** 🟢 **ACTIVE**
- **Endpoint:** Standard SMS Gateway API
- **Notes:** Juan's primary SMS Gateway device
- **Delivery:** ✅ Working

---

### ✅ **Sean (Seantrd)** - ADMIN DEVICE
- **Cloud Username:** `YH1NKV`
- **Cloud Password:** `obiwpwuzrx5lip`
- **Device Username:** `sms`
- **Device Password:** `ycs-SLwL`
- **Device:** Sean's Device
- **Phone Number:** `13473803274`
- **Status:** 🟢 **ACTIVE**
- **Endpoint:** `/api/sms-gateway/send-sean`
- **Notes:** Using dedicated endpoint with device credentials
- **Delivery:** ✅ Working

---

## ⚠️ **Inactive/Problematic Devices**

### ❌ **Jose (Josetrd)** - DELIVERY ISSUES
- **Cloud Username:** `_NNSZW`
- **Cloud Password:** `9qajexoy9ihhnl`
- **Device:** Moto-G (Jose)
- **Status:** 🔴 **INACTIVE** - False positives
- **Endpoint:** `/api/sms-gateway/send-jose`
- **Notes:** Shows "Sent" status but messages don't actually deliver
- **Delivery:** ❌ Device compatibility issue - Motorola doesn't work reliably

---

## 🚀 **Current Application Setup**

### **✅ SIMPLIFIED SYSTEM (December 2024):**
- **SMS Testing Lab** - Always uses personal Gate-SMS credentials
- **Advanced Message Sender** - Simplified to use personal credentials only
- **No more device selection** - Users automatically use their assigned credentials

### **User Assignment:**
- **Sean/Matt accounts** → Use Sean's credentials (`YH1NKV:obiwpwuzrx5lip`)
- **Other team members** → Use their assigned credentials
- **Fallback system** → Defaults to Jon's device if needed

### **Device Compatibility Notes:**
- ✅ **Samsung devices work reliably** (Jon, Juan, Sean)
- ❌ **Motorola devices have delivery problems** (Jose)
- ⚠️ **Device brand matters** for SMS Gateway app compatibility

---

## 🔧 **Default Credentials (Fallback)**

The system defaults to Jon's credentials when others fail:

```javascript
const DEFAULT_SMS_GATEWAY_CONFIG = {
  provider: 'smsgateway',
  email: 'jon@trurankdigital.com',
  password: 'WorkingDevice123!',
  cloudUsername: 'AD2XA0',
  cloudPassword: '2nitkjiqnmrrtc',
  endpoint: 'https://api.sms-gate.app/3rdparty/v1/message'
};
```

---

## 📋 **Quick Reference**

| User | Username | Password | Device | Status | Delivery |
|------|----------|----------|---------|--------|----------|
| **Jon** | `AD2XA0` | `2nitkjiqnmrrtc` | Samsung | 🟢 Active | ✅ Works |
| **Juan** | `GBNSPW` | `3nneo5hkbyhpti` | Samsung | 🟢 Active | ✅ Works |
| **Sean** | `YH1NKV` | `obiwpwuzrx5lip` | Sean's Device | 🟢 Active | ✅ Works |
| **Jose** | `_NNSZW` | `9qajexoy9ihhnl` | Moto-G | 🔴 Inactive | ❌ False positives |

---

## 🛡️ **Security Notes**

- All credentials are stored in authentication system
- Each user has dedicated API endpoints
- Credentials are Base64 encoded for API calls
- Jon's device credentials are used as system default for reliability 