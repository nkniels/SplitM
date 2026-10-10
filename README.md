# SplitM — Smart Group Expense & Settlement Platform

SplitM is a Progressive Web Application (PWA) designed for collaborative group expense tracking, integer-cent debt simplification, and group purchasing.

---

## Key Features

1. **Shared Expense Tracking**:
   - Split expenses equally, proportionally by weight, by percentage, or with custom exact amounts.
   - Multi-payer support per transaction.
   - Built-in budget tracking and progress indicators.
2. **Greedy Debt-Settlement Engine (`FinanceEngine`)**:
   - Minimizes the total number of reimbursement transactions across group members.
   - Strictly enforces integer-cent precision with penny-remainder distribution (never corrupted by floating-point math).
   - Zero-sum ledger invariant ($\sum \text{Paid} \equiv \sum \text{Owed}$, net group balance $\equiv 0.00$).
3. **Offline-First Resilience**:
   - Local persistence via IndexedDB (`idb`).
   - Seamless background synchronization when online connectivity is restored.
   - Dedicated service worker (`sw.js`) with cache busting and offline asset availability.
4. **Adaptive Theme**:
   - Modern Fintech Obsidian dark mode (default) and crisp light mode.
   - 1-tap theme switcher in the app navigation bar.
5. **Multi-Platform Support**:
   - Responsive layouts optimized for desktop and mobile viewports (375px+).
   - Installable PWA with web app manifest and asset caching.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite 8, React Router v7
- **State Management**: Redux Toolkit (`@reduxjs/toolkit`), React-Redux
- **Styling**: Tailwind CSS v4, Lucide React icons
- **Backend & Auth**: Google Firebase (Authentication, Cloud Firestore, Firebase Hosting)
- **Offline Storage**: IndexedDB via `idb`

---

## Repository Structure

```
SplitM/
├── docs/                     # Technical specifications and setup documentation
│   ├── kiro-specs/           # Expense management functional specs
│   └── setup-walkthrough.md  # CI/CD and deployment notes
├── legacy/                   # Archived legacy artifacts
│   └── v1/                   # Archived vanilla JS PWA (v1)
├── tests/                    # Algorithmic & financial regression tests
│   └── test_finance_engine.mjs
├── splitm-v2/                # Core application (React + Vite + TypeScript)
│   ├── public/               # Static assets, manifest.json, sw.js
│   ├── src/
│   │   ├── components/       # UI components (expenses, groups, layout, settlements, ui)
│   │   ├── core/             # Configuration, store, FinanceEngine, types, helpers
│   │   ├── modules/          # Redux slices, thunks, services (auth, expenses, groups, sync)
│   │   ├── pages/            # Dashboard and Login views
│   │   └── services/         # IndexedDB storage provider
│   ├── firebase.json         # Firebase Hosting & Firestore configuration
│   ├── firestore.rules       # Firestore security rules
│   └── package.json
└── README.md
```

---

## Local Development

### Prerequisites
- Node.js 20+
- npm 10+

### 1. Install Dependencies
```bash
cd splitm-v2
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` inside `splitm-v2/`:
```bash
cp .env.example .env
```
Populate with your Firebase project credentials:
```ini
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Testing

Run the financial engine regression tests (verifies exact penny splits, integer-cent arithmetic, and zero-sum balance settlements):
```bash
node tests/test_finance_engine.mjs
```

---

## Building and Deployment

### Production Build
```bash
cd splitm-v2
npm run build
```
This produces optimized production bundles in `splitm-v2/dist/`.

### Preview Production Build Locally
```bash
npm run preview
```

### Deploy to Firebase Hosting
Deploy using the Firebase CLI:
```bash
cd splitm-v2
firebase deploy --only hosting --project splitm-a1f60
```

Deploying Firestore rules:
```bash
firebase deploy --only firestore:rules --project splitm-a1f60
```
