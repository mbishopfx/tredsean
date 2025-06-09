# TRD Team Login & Personal SMS Setup Guide

## 🔐 Team Member Credentials

### Current User Accounts:
| Name  | Username  | Password            | Role         | Status  |
|-------|-----------|---------------------|------------- |---------|
| Jon   | `Jontrd`  | `Babydeathstroke11!`| team_member  | ✅ Ready|
| Jesse | `Jessetrd`| `Truerankprezzy123!`| team_member  | ✅ Ready|
| Danny | `Dantrd`  | `TrdPakistan123!`   | team_member  | ✅ Ready|
| Jose  | `Josetrd` | `TeamUSA123!`       | team_member  | ✅ Ready|
| Matt  | `Matttrd` | `admin123!`         | admin        | 🧪 Testing|

## 📱 Personal SMS API Setup

### Step 1: Test Matt's Account
1. **Visit the app**: `http://localhost:3000`
2. **Login with**:
   - Username: `Matttrd`
   - Password: `admin123!`
3. **You'll automatically be set to "Personal Phone" mode**

### Step 2: Get SMS Gateway API Keys

#### Option A: SMSMobileAPI (Recommended)
1. **Download SMSMobileAPI app** from Play Store/App Store
2. **Get API credentials**:
   - Open app → Settings → API Settings
   - Note down your `API Key` and `Device ID`
3. **Update Matt's credentials in** `src/app/api/auth/route.ts`:
   ```javascript
   'Matttrd': {
     password: 'admin123!',
     displayName: 'Matt',
     role: 'admin',
     personalSMS: {
       provider: 'smsmobileapi',
       apiKey: 'YOUR_ACTUAL_API_KEY_HERE',     // Replace this
       deviceId: 'YOUR_ACTUAL_DEVICE_ID_HERE' // Replace this
     }
   }
   ```

#### Option B: SMS Dove
1. **Download SMS Dove app**
2. **Get API credentials** from app settings
3. **Update provider to**: `'smsdove'`

### Step 3: Test Personal SMS
1. **Login as Matt**
2. **Go to SMS Conversations** tab
3. **You should see**: "SMS Provider: Personal Phone" selected
4. **Green checkmark**: "✓ SMSMobileAPI" (when API keys are valid)

### Step 4: Configure Other Team Members
Once Matt's setup works:
1. **Get API keys for each team member**
2. **Update their credentials** in `src/app/api/auth/route.ts`
3. **Each user will auto-login to Personal SMS mode**

## 🔍 Monitoring & Security

### Super Admin Access
- **URL**: `http://localhost:3000/admin`
- **Password**: `Babydeathstroke11!`
- **Shows**: All login attempts, passwords tried, IP addresses, user activity

### What Gets Tracked:
- ✅ Every login attempt (success/failure)
- ✅ Username used for login
- ✅ IP addresses and devices
- ✅ Personal SMS usage per user
- ✅ All message activity by team member

### User Activity Logging:
- Each team member's SMS usage is tracked separately
- Personal SMS vs Twilio usage monitored
- Cost analysis per user available

## 🚀 Quick Test Steps for Matt:

1. **Clear browser data** (to reset any cached auth)
2. **Visit**: `http://localhost:3000`
3. **Login**:
   - Username: `Matttrd` 
   - Password: `admin123!`
4. **Check SMS Conversations tab**:
   - Should show "Personal Phone" selected
   - Should show placeholder API settings
5. **Update API keys** once you get them from SMSMobileAPI
6. **Test sending a message** through Personal SMS

## 📝 Next Steps:
1. ✅ Test Matt's login
2. 🔄 Get SMSMobileAPI credentials 
3. 🔄 Update API keys in code
4. 🔄 Test personal SMS sending
5. 🔄 Roll out to other team members

---
**Note**: Each user automatically gets their personal SMS credentials loaded when they login, no manual setup needed on their end! 