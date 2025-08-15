# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Development Server:**
```bash
pnpm dev           # Start development server
```

**Build & Preview:**
```bash
pnpm build         # Build for production  
pnpm preview       # Preview production build
pnpm generate      # Generate static site
```

**Code Quality:**
```bash
pnpm lint          # Run ESLint
pnpm lint:fix      # Fix ESLint issues automatically
pnpm typecheck     # Run TypeScript type checking
```

**Testing:**
```bash
pnpm test          # Run tests with Vitest
pnpm test:ui       # Run tests with UI interface
```

**Database:**
```bash
pnpm seed          # Seed Firestore with sample nutrition data
```

## Architecture Overview

**Tech Stack:**
- Nuxt 3 SSR application with Vue 3 Composition API and TypeScript
- Firebase backend (Auth, Firestore, Storage) with admin SDK for server operations
- Pinia for state management with composables pattern
- Tailwind CSS with Nuxt UI components and Headless UI
- Vitest for testing with Vue Test Utils

**Authentication & Authorization:**
- Firebase Auth with email/password and custom claims for admin roles
- Global middleware handles auth state and route protection
- User profiles stored in Firestore with role-based access control
- Firestore security rules enforce data isolation and admin permissions

**State Management Pattern:**
- Pinia stores for global state (auth, meals, onboarding)
- Composables for Firebase service access and utilities
- Reactive user state with loading states and error handling
- Server-side user profile synchronization with client auth state

**Data Architecture:**
- Firestore collections: users, meals/{userId}/entries, exercises/{userId}/logs, weights/{userId}/logs
- Verified meals database with admin-only write access and public read access
- Unverified meals submission system with admin approval workflow
- Comprehensive TypeScript interfaces for all data models

## Firebase Configuration

**Environment Variables Required:**
- `NUXT_PUBLIC_FIREBASE_*` - Client Firebase config (public)
- `FIREBASE_ADMIN_*` - Server-side admin SDK credentials (private)
- Firebase emulators connect automatically in development mode

**Security Rules:**
- Users can only access their own data (meals, exercises, weights)
- Admin role required for verified meal management and user administration
- Email verification required for all authenticated operations
- Comprehensive Firestore rules in `firestore.rules`

## Key Development Patterns

**Component Structure:**
- Mobile-first responsive design with Nuxt UI component library
- Global layouts with authenticated/unauthenticated routing
- Composables for Firebase services and business logic
- TypeScript interfaces for all data models and API responses

**Error Handling:**
- Try-catch blocks in all async operations with user feedback
- Toast notifications for user actions and errors
- Loading states managed in stores and components
- Firebase error codes mapped to user-friendly messages

**Testing:**
- Vitest with jsdom environment and Vue Test Utils
- Setup file configures global test utilities and mocks
- Focus on testing business logic in composables and stores
- Component testing for user interactions and state changes

## File Organization

- `components/` - Reusable Vue components (headers, navigation, cards)
- `stores/` - Pinia stores for global state management
- `composables/` - Vue composables and Firebase service wrappers
- `middleware/` - Route protection and auth state management  
- `types/` - TypeScript interfaces for all data models
- `utils/` - Helper functions and Firebase admin utilities
- `plugins/` - Nuxt plugins for Firebase initialization and global services

## Development Notes

- Firebase emulators automatically connect in development for local testing
- Admin features require custom claims set via Firebase Admin SDK
- Onboarding flow calculates BMR/TDEE and sets personalized macro goals
- Nutrition database can be seeded from CSV or uses sample data fallback
- PWA capabilities configured through Nuxt modules for offline functionality