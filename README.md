# BeFit - Fitness Tracking Web App

A comprehensive fitness tracking web application built with Nuxt 3, Vue 3, TypeScript, and Firebase. This app replicates the core functionality of a fitness tracking iOS app with features for nutrition logging, exercise tracking, weight monitoring, and more.

## 🚀 Features

- **Authentication**: Email/password login, registration, password reset
- **Multi-step Onboarding**: Personalized setup with BMR/TDEE calculations
- **Nutrition Tracking**: Meal logging with verified food database and barcode scanning
- **Exercise Tracking**: Workout logging with sets, reps, and duration
- **Weight Tracking**: Progress charts and goal monitoring
- **Admin Panel**: Food verification system for custom entries
- **Responsive Design**: Mobile-first approach with PWA capabilities
- **Multi-language Support**: I18n integration
- **Dark Mode**: Full dark mode support

## 🛠 Tech Stack

- **Frontend**: Nuxt 3, Vue 3 (Composition API), TypeScript
- **Styling**: Tailwind CSS, Nuxt UI, Headless UI
- **State Management**: Pinia
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Build/Deploy**: Vercel (Nitro preset)
- **Testing**: Vitest, Vue Test Utils
- **Linting**: ESLint, Prettier

## 📋 Prerequisites

- Node.js 18+ and pnpm
- Firebase project with Auth, Firestore, and Storage enabled
- Vercel account (for deployment)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd befit-nuxt
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up Firebase**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication (Email/Password method)
   - Create Firestore database
   - Enable Storage
   - Get your Firebase configuration

4. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your Firebase configuration:
   ```env
   # Firebase Client Configuration (Public)
   NUXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NUXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NUXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

   # Firebase Admin Configuration (Server Only - for admin features)
   FIREBASE_ADMIN_PROJECT_ID=your-project-id
   FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
   FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"

   # App Configuration
   NUXT_PUBLIC_APP_VERSION=1.0.0
   ```

5. **Firebase Security Rules**
   Deploy the Firestore security rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

6. **Run the development server**
   ```bash
   pnpm dev
   ```

## 🚀 Deployment to Vercel

1. **Connect to Vercel**
   - Import your project in Vercel dashboard
   - Connect your Git repository

2. **Environment Variables**
   Add all environment variables from your `.env` file to Vercel

3. **Deploy**
   ```bash
   vercel --prod
   ```

## 🧪 Development Scripts

```bash
# Development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Type checking
pnpm typecheck

# Linting and formatting
pnpm lint
pnpm lint:fix

# Testing
pnpm test
pnpm test:ui

# Database seeding
pnpm seed
```

## 📂 Project Structure

```
├── assets/              # Static assets and styles
├── components/          # Vue components
├── composables/         # Vue composables
├── data/               # Static data files
├── layouts/            # Nuxt layouts
├── locales/            # I18n translations
├── middleware/         # Route middleware
├── pages/              # File-based routing
├── plugins/            # Nuxt plugins
├── scripts/            # Build and utility scripts
├── server/             # Server-side code
├── stores/             # Pinia stores
├── types/              # TypeScript definitions
├── utils/              # Utility functions
├── firestore.rules    # Firestore security rules
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
