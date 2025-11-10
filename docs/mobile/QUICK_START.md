# Quick Start - Android Studio Testing

## 🚀 Fast Setup (5 minutes)

### 1. Install Dependencies
```bash
cd mobile
npm install
```

### 2. Configure Environment
```bash
# Copy example file
cp .env.example .env

# Edit .env with your settings:
# - API_URL: http://10.0.2.2:3000/api (for emulator)
# - Or use your computer's IP for physical device
# - Add your AWS Cognito credentials
```

### 3. Start Metro Bundler
```bash
npm start
```
Keep this terminal open!

### 4. Open in Android Studio
1. Open Android Studio
2. **File → Open** → Select `mobile/android` folder
3. Wait for Gradle sync to complete

### 5. Run the App
- Click the **Run** button (green play icon)
- Or press `Shift+F10`
- Select your emulator or connected device

## 📱 Testing Checklist

- [ ] App builds successfully
- [ ] App launches on emulator/device
- [ ] Can connect to backend API
- [ ] Login screen appears
- [ ] Can navigate between screens

## 🔧 Common Quick Fixes

**Build fails?**
```bash
cd mobile/android
./gradlew clean
cd ..
npm start -- --reset-cache
```

**Can't connect to API?**
- Emulator: Use `http://10.0.2.2:3000/api` in `.env`
- Physical device: Use your computer's IP address

**Metro bundler issues?**
```bash
npm start -- --reset-cache
```

## 📚 Full Documentation

See `ANDROID_STUDIO_SETUP.md` for detailed setup instructions.

