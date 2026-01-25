# Firebase Configuration Fix

## Error: auth/api-key-not-valid

This error occurs when the Firebase API key in your configuration is invalid, expired, or has restrictions.

## Steps to Fix:

1. **Go to Firebase Console**:
   - Visit https://console.firebase.google.com
   - Select your project: `lufel-shop-dev`

2. **Get Your Web App Config**:
   - Click the gear icon (⚙️) next to "Project Overview"
   - Select "Project settings"
   - Scroll down to "Your apps" section
   - If you don't have a web app, click "Add app" → Web (</> icon)
   - Copy the `firebaseConfig` object

3. **Check API Key Restrictions**:
   - Go to Google Cloud Console: https://console.cloud.google.com
   - Select your project: `lufel-shop-dev`
   - Navigate to "APIs & Services" → "Credentials"
   - Find your API key (the one starting with `AIzaSy...`)
   - Click on it to edit
   - Under "API restrictions":
     - Make sure "Don't restrict key" is selected, OR
     - If restricted, ensure "Firebase Authentication API" is enabled
   - Under "Application restrictions":
     - Make sure "None" is selected, OR
     - If "HTTP referrers" is selected, add your domain (localhost for development)

4. **Update firebase.js**:
   - Replace the config in `src/services/firebase.js` with your actual config from step 2
   - Make sure all values are correct and match your Firebase project

5. **Restart Your Dev Server**:
   - Stop the server (Ctrl+C)
   - Run `npm.cmd run dev` again

## Quick Check:

Your current config shows:
- Project ID: `lufel-shop-dev`
- API Key: `AIzaSyDi3k3Giq_owteogk7dLl86-T1PSsgooMU`

Verify these match what's in your Firebase Console. If they don't match, update them.



