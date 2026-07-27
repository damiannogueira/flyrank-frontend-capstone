# ContextClip

ContextClip is a React frontend application developed for the FlyRank AI Internship Frontend track.

It helps users organize online research by converting URLs into visual cards with metadata such as the page title, description, domain, favicon, and preview image.

The Week 3 implementation adds Firebase persistence, anonymous authentication, reusable card components, routing, accessibility improvements, and a documented AI-assisted development workflow.

## Problem

Online research often results in many open browser tabs and disconnected bookmarks.

Traditional bookmark lists preserve URLs, but they provide little visual context about each resource. ContextClip creates enriched visual cards so users can identify, review, and save useful links more easily.

## Current Features

- URL input and validation.
- URL normalization.
- Metadata retrieval through Microlink.
- Title, description, domain, favicon, and preview-image display.
- Graceful handling of missing or broken metadata.
- Transient cards on the Home page.
- Navigation between Home and Saved Links.
- Firebase anonymous authentication.
- Firestore persistence scoped to the authenticated anonymous user.
- Save, duplicate detection, list, and delete operations.
- Newest-first ordering for persisted links.
- Loading, success, duplicate, empty, and error states.
- Keyboard-accessible actions and visible focus styles.
- Predictable focus placement after deleting saved links.
- Responsive layouts for desktop and mobile screens.
- Automated tests for metadata, Firebase, authentication, and persistence services.

## Technology Stack

- React 19
- JavaScript
- JSX
- CSS
- React Router
- Vite
- Vitest
- ESLint
- Firebase Authentication
- Cloud Firestore
- Microlink API
- Git and GitHub

## Project Structure

```text
src/
├── components/
│   ├── AppHeader.jsx
│   ├── Card.jsx
│   └── CardList.jsx
├── pages/
│   ├── HomePage.jsx
│   └── SavedLinksPage.jsx
├── services/
│   ├── authService.js
│   ├── firebaseClient.js
│   ├── metadataService.js
│   └── savedLinksService.js
├── App.jsx
├── App.css
└── main.jsx
```

The React components do not access Firebase directly. Firebase initialization, authentication, metadata retrieval, and persisted-link operations are isolated in service modules.

## Installation

Clone the repository:

```bash
git clone https://github.com/damiannogueira/flyrank-frontend-capstone.git
```

Enter the project directory:

```bash
cd flyrank-frontend-capstone
```

Install dependencies:

```bash
npm install
```

## Environment Configuration

Create a local environment file named `.env.local` in the project root.

Use `.env.example` as the reference:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

Do not commit `.env.local` or real Firebase credentials.

## Firebase Configuration

The application requires a Firebase project with:

- a registered Web application;
- Anonymous Authentication enabled;
- a Cloud Firestore database;
- `localhost` configured as an authorized domain;
- the repository's `firestore.rules` published in Firebase Console.

Saved links use the following Firestore path:

```text
users/{uid}/savedLinks/{linkId}
```

Each anonymous user can access only their own saved-link documents.

## Available Scripts

Start the development server:

```bash
npm run dev
```

Run ESLint:

```bash
npm run lint
```

Run the automated test suite:

```bash
npm run test
```

Create a production build:

```bash
npm run build
```

## Verification Status

The current Week 3 implementation has been verified with:

- ESLint passing;
- 87 automated tests passing;
- a successful Vite production build;
- real anonymous Firebase authentication;
- real Firestore save, list, duplicate, persistence, and delete operations;
- direct navigation to `/saved`;
- keyboard focus checks after deletion;
- responsive checks at approximately 375 px;
- route navigation without uncaught browser-console errors.

## Accessibility

ContextClip uses:

- native buttons and links;
- contextual accessible action labels;
- visible keyboard focus styles;
- disabled and busy states for pending operations;
- status and alert semantics for asynchronous feedback;
- safe external-link attributes;
- predictable focus movement after persisted deletion.

A complete screen-reader audit has not yet been performed.

## Current Limitations

- Authentication is anonymous only.
- There is no login, logout, account upgrade, or account-recovery interface.
- Saved data is associated with the anonymous Firebase user stored in the browser.
- Metadata retrieval depends on the external Microlink service.
- Persisted data is not synchronized through a real-time Firestore listener.
- The main production JavaScript bundle currently triggers Vite's non-failing chunk-size warning.
- Drag-and-drop cards, groups, connections, notes, and an infinite canvas are not included in the current assignment.

## AI-Assisted Development

The implementation was completed through a controlled AI-assisted workflow that included:

- scoped prompts;
- explicit constraints;
- code inspection;
- human review;
- manual corrections;
- automated verification;
- real browser and Firebase testing;
- separate feature and documentation commits.

The complete workflow, AI contributions, human decisions, corrections, and verification results are documented in [`AI_DEVELOPMENT_LOG.md`](./AI_DEVELOPMENT_LOG.md).

## Project Direction

Future versions may add:

- drag-and-drop organization;
- card groups and visual connections;
- notes and annotations;
- account-based authentication;
- cross-device recovery;
- real-time synchronization;
- import and export tools;
- an interactive canvas.