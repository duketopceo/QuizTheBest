# Android Studio Setup Guide

This guide will help you set up and test the QuizTheBest mobile app in Android Studio.

## Prerequisites

### 1. Install Required Software

- [ ] **Node.js 18+** - [Download](https://nodejs.org/)
- [ ] **Java Development Kit (JDK) 17** - [Download](https://adoptium.net/)
- [ ] **Android Studio** - [Download](https://developer.android.com/studio)
- [ ] **Android SDK** - Installed via Android Studio

### 2. Verify Installations

```bash
node --version   # Should be 18+
java -version    # Should be 17+
adb version      # Android Debug Bridge
```

### 3. Set Environment Variables

#### Windows (PowerShell)
```powershell
[System.Environment]::SetEnvironmentVariable("ANDROID_HOME", "$env:LOCALAPPDATA\Android\Sdk", "User")
[System.Environment]::SetEnvironmentVariable("PATH", "$env:PATH;$env:LOCALAPPDATA\Android\Sdk\platform-tools", "User")
[System.Environment]::SetEnvironmentVariable("PATH", "$env:PATH;$env:LOCALAPPDATA\Android\Sdk\tools", "User")
```

#### macOS/Linux
Add to `~/.bashrc` or `~/.zshrc`:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk  # macOS
# OR
export ANDROID_HOME=$HOME/Android/Sdk          # Linux

export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
```

## Quick Setup Steps

### Step 1: Install Dependencies

```bash
cd mobile
npm install
```

### Step 2: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your configuration:
   ```env
   # For Android Emulator (default)
   API_URL=http://10.0.2.2:3000/api
   
   # For Physical Device - Use your computer's IP
   # Find your IP: ipconfig (Windows) or ifconfig (macOS/Linux)
   # API_URL=http://192.168.1.100:3000/api
   
   # AWS Configuration
   AWS_REGION=us-east-1
   COGNITO_USER_POOL_ID=your-user-pool-id
   COGNITO_CLIENT_ID=your-client-id
   ```

### Step 3: Start Metro Bundler

In the `mobile` directory:
```bash
npm start
```

Keep this terminal open. Metro bundler serves your JavaScript code.

### Step 4: Open in Android Studio

1. Open Android Studio
2. Select **File → Open**
3. Navigate to `mobile/android` folder
4. Click **OK**

### Step 5: Configure Android Studio

1. **Wait for Gradle Sync** - Android Studio will automatically sync Gradle files
2. **Install SDK Components** (if prompted):
   - Android SDK Platform 33
   - Android SDK Build-Tools
   - Android Emulator

3. **Set up Emulator** (if needed):
   - Tools → Device Manager
   - Create Virtual Device
   - Select a device (e.g., Pixel 5)
   - Select system image (API 33 recommended)
   - Finish

### Step 6: Build and Run

#### Option A: Using Android Studio
1. Select your emulator or connected device from the device dropdown
2. Click the **Run** button (green play icon) or press `Shift+F10`
3. Wait for the build to complete and app to launch

#### Option B: Using Command Line
```bash
cd mobile
npm run android
```

## Testing with Physical Device

### 1. Enable Developer Options

1. Go to **Settings → About Phone**
2. Tap **Build Number** 7 times
3. Go back to **Settings → Developer Options**
4. Enable **USB Debugging**

### 2. Connect Device

1. Connect device via USB
2. Accept USB debugging prompt on device
3. Verify connection:
   ```bash
   adb devices
   ```

### 3. Update API URL

For physical devices, you need to use your computer's IP address:

1. Find your computer's IP:
   - **Windows**: `ipconfig` (look for IPv4 Address)
   - **macOS/Linux**: `ifconfig` or `ip addr`

2. Update `.env`:
   ```env
   API_URL=http://YOUR_IP_ADDRESS:3000/api
   ```

3. Restart Metro bundler:
   ```bash
   npm start -- --reset-cache
   ```

### 4. Port Forwarding (Alternative)

If you prefer to use localhost:
```bash
adb reverse tcp:8081 tcp:8081  # Metro bundler
adb reverse tcp:3000 tcp:3000  # Backend API
```

Then use `http://localhost:3000/api` in your `.env`

## Backend Setup

### 1. Start Backend Server

```bash
cd backend
npm install
npm run dev
```

The backend should run on `http://localhost:3000`

### 2. Verify Backend is Accessible

- **From Emulator**: `http://10.0.2.2:3000`
- **From Physical Device**: `http://YOUR_IP:3000`

Test in browser or:
```bash
curl http://localhost:3000/health
```

### 3. Update CORS (if needed)

If you get CORS errors, update `backend/src/middleware/cors.ts` to allow your device's origin.

## Common Issues & Solutions

### Issue: "SDK location not found"

**Solution:**
1. Set `ANDROID_HOME` environment variable
2. In Android Studio: **File → Project Structure → SDK Location**
3. Set Android SDK location

### Issue: "Could not connect to development server"

**Solutions:**
1. Ensure Metro bundler is running (`npm start`)
2. For physical device: Use your computer's IP in API_URL
3. Check firewall isn't blocking connections
4. Try: `adb reverse tcp:8081 tcp:8081`

### Issue: "Build failed - Gradle error"

**Solutions:**
```bash
cd mobile/android
./gradlew clean
cd ..
npm start -- --reset-cache
```

### Issue: "Module not found"

**Solutions:**
```bash
cd mobile
rm -rf node_modules
npm install
cd android
./gradlew clean
```

### Issue: "Network request failed" or "CORS error"

**Solutions:**
1. Verify backend is running
2. Check API_URL in `.env` is correct
3. For emulator: Use `10.0.2.2` instead of `localhost`
4. For physical device: Use your computer's IP address
5. Check backend CORS configuration

### Issue: "Cleartext HTTP traffic not permitted"

**Solution:**
The `network_security_config.xml` file is already configured to allow HTTP in development. If you still see this error:
1. Clean and rebuild: `./gradlew clean`
2. Verify `network_security_config.xml` exists in `android/app/src/main/res/xml/`
3. Check `AndroidManifest.xml` references it

### Issue: "Gradle sync failed"

**Solutions:**
1. **File → Invalidate Caches / Restart**
2. Check internet connection (Gradle downloads dependencies)
3. Update Gradle wrapper if needed
4. Check `gradle.properties` for proxy settings if behind corporate firewall

## Debugging Tips

### 1. View Logs

**In Android Studio:**
- **View → Tool Windows → Logcat**
- Filter by your app package: `com.quizthebest`

**Command Line:**
```bash
adb logcat | grep -i quizthebest
```

### 2. React Native Debugger

1. Shake device or press `Ctrl+M` (emulator)
2. Select **Debug**
3. Opens Chrome DevTools

### 3. Network Debugging

Enable network inspection:
```bash
adb shell settings put global http_proxy :8888
```

### 4. Reload App

- Press `R` twice in Metro bundler terminal
- Or shake device → **Reload**

## Project Structure

```
mobile/
├── android/              # Android native code
│   └── app/
│       └── src/main/
│           ├── AndroidManifest.xml
│           └── res/      # Resources (strings, styles, etc.)
├── src/                  # React Native source code
├── .env                  # Environment variables (create from .env.example)
├── package.json
└── babel.config.js
```

## Build Variants

### Debug Build (Development)
- Includes debugging tools
- Allows HTTP connections
- Faster build times

### Release Build (Production)
- Optimized and minified
- Requires signing configuration
- Only HTTPS connections

To build release:
```bash
cd mobile/android
./gradlew assembleRelease
```

## Next Steps

1. ✅ App builds and runs
2. ✅ Test login functionality
3. ✅ Test API connectivity
4. ✅ Test study set generation
5. ✅ Test on multiple devices/emulators

## Additional Resources

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Android Studio Guide](https://developer.android.com/studio)
- [React Native Troubleshooting](https://reactnative.dev/docs/troubleshooting)
- [AWS Amplify React Native](https://docs.amplify.aws/react-native/)

---

**Need Help?** Check `ANDROID_SETUP_CHECKLIST.md` for a comprehensive checklist.

