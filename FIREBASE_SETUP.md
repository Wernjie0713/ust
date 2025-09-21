# Firebase Hosting Setup Guide

## Prerequisites
- Firebase CLI installed (`npm install -g firebase-tools`)
- Firebase project created (using `eco-go-ust`)
- GitHub repository

## Setup Steps

### 1. Firebase Project Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select the `eco-go-ust` project
3. Enable Firebase Hosting and Cloud Functions
4. Project ID is already configured as `eco-go-ust`

### 2. Firebase Authentication
1. Run `firebase login` to authenticate
2. Run `firebase use eco-go-ust` to select the project
3. Run `firebase init hosting` and `firebase init functions` to initialize

### 3. GitHub Secrets Setup
1. Go to your GitHub repository
2. Navigate to Settings > Secrets and variables > Actions
3. Add the following secret:
   - `FIREBASE_SERVICE_ACCOUNT_UST`: Your Firebase service account JSON

### 4. Get Firebase Service Account Key
1. Go to Firebase Console > Project Settings > Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Copy the entire JSON content and paste it as the value for `FIREBASE_SERVICE_ACCOUNT_UST` secret

### 5. Environment Variables
Set up the following environment variables in Firebase Functions:
- `OPENAI_API_KEY`: Your OpenAI API key for image analysis
- `MAPBOX_ACCESS_TOKEN`: Your Mapbox access token for maps

### 6. Test Local Deployment
```bash
# Build the project
npm run build

# Build functions
cd functions
npm ci
npm run build
cd ..

# Deploy to Firebase
firebase deploy
```

### 7. Automatic Deployment
- Push to `main` or `master` branch → Deploys to production
- Create a pull request → Creates a preview deployment

## Architecture
The project uses a hybrid approach:
- **Frontend**: Static Next.js export hosted on Firebase Hosting
- **API Routes**: Converted to Cloud Functions for server-side functionality
- **Functions**: Located in `/functions` directory with TypeScript support

## API Endpoints
Your API routes have been converted to Cloud Functions:
- `/api/hello` → `https://us-central1-eco-go-ust.cloudfunctions.net/hello`
- `/api/analyze` → `https://us-central1-eco-go-ust.cloudfunctions.net/analyze`
- `/api/vouchers` → `https://us-central1-eco-go-ust.cloudfunctions.net/vouchers`
- `/api/map/token` → `https://us-central1-eco-go-ust.cloudfunctions.net/mapToken`

## Build Configuration
The project is configured for static export with:
- `output: 'export'` in next.config.ts
- `trailingSlash: true` for proper routing
- `images: { unoptimized: true }` for static hosting

## Troubleshooting
- Ensure all environment variables are set in Firebase Functions
- Check Firebase project permissions
- Verify GitHub Actions secrets are properly configured
- Make sure both frontend and functions build successfully
- Check Firebase Functions logs for API issues
