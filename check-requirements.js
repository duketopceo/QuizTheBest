#!/usr/bin/env node

/**
 * Requirements Checker for Quiz The Best App
 * Run: node check-requirements.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 Quiz The Best - Requirements Checklist\n');
console.log('='.repeat(60));
console.log('\n📋 WHAT YOU NEED TO CONFIGURE:\n');

const requirements = {
  'Backend Setup': [
    'Create backend/.env file from backend/.env.example',
    'Configure AWS credentials (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)',
    'Set AWS_REGION (us-east-1 recommended)',
    'Configure Cognito User Pool ID and Client ID',
    'Set up Firebase credentials (PROJECT_ID, PRIVATE_KEY, CLIENT_EMAIL)',
    'Optional: Add SerpAPI key for enhanced search',
    'Configure ALLOWED_ORIGINS for CORS',
    'Set BEDROCK_MODEL_ID (default: amazon.nova-micro-v1:0)',
  ],
  'Frontend Setup': [
    'Create frontend/.env file from frontend/.env.example',
    'Set VITE_API_URL (backend API URL)',
    'Set VITE_AWS_REGION',
    'Set VITE_COGNITO_USER_POOL_ID',
    'Set VITE_COGNITO_CLIENT_ID',
    'Create PWA icons (icon-192x192.png, icon-512x512.png)',
  ],
  'Mobile App Setup': [
    'Install Node.js 18+',
    'Install Java JDK 17',
    'Install Android Studio',
    'Install Android SDK (Platform 33, Build Tools)',
    'Set ANDROID_HOME environment variable',
    'Create mobile/.env file from mobile/.env.example',
    'Set API_URL (use 10.0.2.2:3000 for emulator, your IP for physical device)',
    'Set AWS_REGION, COGNITO_USER_POOL_ID, COGNITO_CLIENT_ID',
    'Run: cd mobile && npm install',
  ],
  'AWS Services': [
    'Create AWS Cognito User Pool',
    'Enable refresh tokens in Cognito App Client',
    'Configure callback URLs in Cognito',
    'Request access to Amazon Nova models in AWS Bedrock',
    'Verify amazon.nova-micro-v1:0 is available in your region',
    'Set up IAM roles with Bedrock permissions',
    'Create Firebase project',
    'Enable Firestore database',
    'Create Firebase service account',
    'Deploy Firestore security rules: firebase deploy --only firestore:rules',
    'Deploy Firestore indexes: firebase deploy --only firestore:indexes',
  ],
  'Development Tools': [
    'Backend: cd backend && npm install',
    'Frontend: cd frontend && npm install',
    'Mobile: cd mobile && npm install',
    'Start backend: cd backend && npm run dev',
    'Start frontend: cd frontend && npm run dev',
    'Start mobile: cd mobile && npm start (then npm run android)',
  ],
  'GitHub CI/CD (Optional)': [
    'Add AWS_ACCESS_KEY_ID to GitHub Secrets',
    'Add AWS_SECRET_ACCESS_KEY to GitHub Secrets',
    'Add AWS_REGION to GitHub Secrets',
    'Add VITE_API_URL to GitHub Secrets',
    'Add VITE_COGNITO_USER_POOL_ID to GitHub Secrets',
    'Add VITE_COGNITO_CLIENT_ID to GitHub Secrets',
    'Update deploy-backend.yml with actual deployment commands',
    'Create amplify.yml for frontend deployment',
  ],
};

let totalItems = 0;
let completedItems = 0;

Object.entries(requirements).forEach(([category, items]) => {
  console.log(`\n📦 ${category}:`);
  items.forEach((item, index) => {
    totalItems++;
    const check = checkRequirement(category, item);
    const status = check ? '✅' : '⏳';
    console.log(`   ${status} ${item}`);
    if (check) completedItems++;
  });
});

console.log('\n' + '='.repeat(60));
console.log(`\n📊 Progress: ${completedItems}/${totalItems} items configured\n`);

// Check if .env files exist
function checkRequirement(category, item) {
  if (item.includes('.env')) {
    const envPath = item.match(/backend|frontend|mobile/)?.[0];
    if (envPath) {
      const envFile = path.join(__dirname, envPath, '.env');
      return fs.existsSync(envFile);
    }
  }
  
  if (item.includes('npm install')) {
    const dir = item.match(/backend|frontend|mobile/)?.[0];
    if (dir) {
      const nodeModules = path.join(__dirname, dir, 'node_modules');
      return fs.existsSync(nodeModules);
    }
  }
  
  return false;
}

console.log('💡 TIP: Read ANDROID_SETUP_CHECKLIST.md for detailed mobile setup instructions');
console.log('💡 TIP: Read MANUAL_EDIT_REQUIRED.md for detailed configuration guide');
console.log('💡 TIP: Read aws-setup.md for AWS service configuration\n');
