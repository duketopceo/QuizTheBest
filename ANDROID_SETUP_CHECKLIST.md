# Android App Setup Checklist

Run this file to see what you need to configure. This checklist covers everything needed to get the Android app working.

## 🔴 CRITICAL - Must Complete Before Building

### 1. Environment Setup

#### Install Required Tools
- [ ] **Node.js 18+** - Install from https://nodejs.org/
- [ ] **Java Development Kit (JDK) 17** - Install from https://adoptium.net/
- [ ] **Android Studio** - Install from https://developer.android.com/studio
- [ ] **Android SDK** - Install via Android Studio SDK Manager
  - Android SDK Platform 33
  - Android SDK Build-Tools
  - Android Emulator (optional, for testing)

#### Verify Installation
```bash
node --version  # Should be 18+
java -version   # Should be 17+
adb version     # Android Debug Bridge
```

### 2. React Native CLI Setup

```bash
npm install -g react-native-cli
npm install -g @react-native-community/cli
```

### 3. Android Development Environment

#### Set Environment Variables
Add to your `~/.bashrc`, `~/.zshrc`, or system environment:

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk  # macOS
# OR
export ANDROID_HOME=$HOME/Android/Sdk          # Linux
# OR
export ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk # Windows

export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
```

### 4. Mobile App Configuration

#### Create `.env` file in `mobile/` directory
```bash
cd mobile
cp .env.example .env
```

Edit `mobile/.env`:
```env
API_URL=http://YOUR_BACKEND_URL/api
AWS_REGION=us-east-1
COGNITO_USER_POOL_ID=your-user-pool-id
COGNITO_CLIENT_ID=your-client-id
```

**Important:** 
- For Android emulator: Use `http://10.0.2.2:3000/api` (special IP for localhost)
- For physical device: Use your computer's IP address (e.g., `http://192.168.1.100:3000/api`)
- For production: Use your deployed backend URL

### 5. AWS Amplify Configuration

#### Configure Amplify in `mobile/src/config/amplify.ts`
Create this file:

```typescript
import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.COGNITO_USER_POOL_ID!,
      userPoolClientId: process.env.COGNITO_CLIENT_ID!,
      region: process.env.AWS_REGION || 'us-east-1',
    },
  },
});
```

### 6. Android App Configuration

#### Update `mobile/android/app/build.gradle`
- [ ] Verify `applicationId` is set to your package name (e.g., `com.quizthebest`)
- [ ] Verify `minSdkVersion` is 21 or higher
- [ ] Verify `targetSdkVersion` is 33

#### Update `mobile/android/app/src/main/AndroidManifest.xml`
- [ ] Verify package name matches `build.gradle`
- [ ] Verify internet permission is included
- [ ] Add network security config if using HTTP (development only)

### 7. Install Dependencies

```bash
cd mobile
npm install
```

### 8. Link Native Dependencies

```bash
cd mobile/android
./gradlew clean
```

### 9. Backend API Configuration

#### Ensure Backend is Running
- [ ] Backend server is running on configured port
- [ ] CORS is configured to allow mobile app origin
- [ ] API endpoints are accessible

#### Update CORS in Backend
Edit `backend/src/middleware/cors.ts` to include:
- Android emulator: `http://localhost` (handled automatically)
- Physical device: Your device's IP address
- Production: Your app's domain

### 10. Build and Run

#### Start Metro Bundler
```bash
cd mobile
npm start
```

#### Run on Android Emulator
```bash
npm run android
```

#### Run on Physical Device
1. Enable Developer Options on your Android device
2. Enable USB Debugging
3. Connect device via USB
4. Run: `npm run android`

## 🟡 RECOMMENDED - Before Production

### 11. App Signing

#### Generate Keystore
```bash
cd mobile/android/app
keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

#### Configure Signing in `android/app/build.gradle`
Add signing configs for release builds.

### 12. App Icons and Splash Screen

- [ ] Create app icon (1024x1024)
- [ ] Generate icons for all densities
- [ ] Create splash screen
- [ ] Update `android/app/src/main/res/` with icons

### 13. App Permissions

Review and update `AndroidManifest.xml`:
- [ ] Internet (already included)
- [ ] Network State (already included)
- [ ] Add any additional permissions needed

### 14. ProGuard Rules (Release Builds)

Create `android/app/proguard-rules.pro` if using code obfuscation.

### 15. Environment-Specific Builds

- [ ] Create `.env.development`
- [ ] Create `.env.production`
- [ ] Configure build variants in `build.gradle`

## 📱 Testing Checklist

### 16. Functional Testing

- [ ] Login/Logout works
- [ ] Dashboard loads topics
- [ ] Topic search generates materials
- [ ] Flashcards display and flip correctly
- [ ] Quiz questions and answers work
- [ ] Study sets save and load
- [ ] Navigation between screens works
- [ ] Theme switching works

### 17. Network Testing

- [ ] Works on WiFi
- [ ] Works on mobile data
- [ ] Handles offline gracefully
- [ ] Error messages display correctly

### 18. Device Testing

- [ ] Test on Android 8.0+ (API 26+)
- [ ] Test on different screen sizes
- [ ] Test on physical devices
- [ ] Test on emulator

## 🚨 Common Issues & Solutions

### Issue: "SDK location not found"
**Solution:** Set `ANDROID_HOME` environment variable

### Issue: "Could not connect to development server"
**Solution:** 
- Check Metro bundler is running
- For physical device: Use `adb reverse tcp:8081 tcp:8081`
- Or use your computer's IP address in API_URL

### Issue: "Build failed - Gradle error"
**Solution:**
```bash
cd mobile/android
./gradlew clean
cd ..
npm start -- --reset-cache
```

### Issue: "Module not found" errors
**Solution:**
```bash
cd mobile
rm -rf node_modules
npm install
cd android
./gradlew clean
```

### Issue: "CORS errors from API"
**Solution:** Update backend CORS to allow your device's IP or use production backend

## 📋 Quick Start Commands

```bash
# 1. Install dependencies
cd mobile
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your values

# 3. Start Metro bundler
npm start

# 4. In another terminal, run Android
npm run android

# 5. For physical device debugging
adb reverse tcp:8081 tcp:8081
```

## 🔗 Additional Resources

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Android Studio Setup](https://developer.android.com/studio)
- [AWS Amplify React Native](https://docs.amplify.aws/react-native/)
- [React Navigation](https://reactnavigation.org/)

## ✅ Final Checklist Before Release

- [ ] All environment variables configured
- [ ] Backend API is accessible
- [ ] App builds successfully
- [ ] All features tested
- [ ] App signed for release
- [ ] Icons and splash screen added
- [ ] Version number updated
- [ ] Release notes prepared

---

**Need Help?** Check the main `README.md` and `MANUAL_EDIT_REQUIRED.md` for backend setup instructions.
