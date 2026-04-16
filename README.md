# RimInvoice

Web app for creating and managing invoices with support for Mauritanian context (MRU, local payment methods such as Bankily, Seddad, Masrvi, BimBank). Authentication and user records use **Firebase**; invoices and business branding profiles are stored **in the browser** (`localStorage`) per signed-in user.

## Features

- **Authentication**: Google sign-in (and hooks for email, phone OTP, Facebook where enabled in Firebase).
- **Dashboard**: Overview and quick access to invoices.
- **Invoices**: Create drafts, list and search, open detail view, delete. Line items, tax, discount, payment method and notes.
- **Business profiles**: Multiple businesses per account, default profile for new invoices, logo upload (stored as base64 in local storage).
- **Export**: Download invoice as **PNG** or **PDF** from the preview dialog (`html-to-image` + `jspdf`).
- **Internationalization**: Arabic (default RTL), French, English, Spanish, Portuguese, German; theme (light / dark / system) and language persisted locally.
- **Feedback**: Toast notifications for auth, profile changes, invoice actions, and downloads.

## Tech stack

| Area | Choice |
|------|--------|
| Framework | [Next.js](https://nextjs.org/) 16 (App Router) |
| UI | React 19, [Tailwind CSS](https://tailwindcss.com/) 4, [Radix UI](https://www.radix-ui.com/), [shadcn-style](https://ui.shadcn.com/) components |
| Auth & cloud | [Firebase](https://firebase.google.com/) Auth + Firestore |
| Local data | `localStorage` via `lib/local-invoices.ts` and `lib/local-business-profiles.ts` |
| Forms | `react-hook-form`, `zod` |
| Charts | `recharts` (where used) |
| Analytics | `@vercel/analytics` (production only) |

## Requirements

- **Node.js** 20+ (or current LTS) and npm  
- A **Firebase** project with **Authentication** (e.g. Google provider) and **Firestore** enabled

## Getting started

```bash
git clone <repository-url>
cd riminvoice
npm install
```

Create a **`.env.local`** file in the project root (Next.js loads it automatically; do not commit it—see `.gitignore`).

### Environment variables

Copy the keys below and fill values from **Firebase Console → Project settings → Your apps → Web app** (`firebaseConfig`).

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Web API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Usually `your-project.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Storage bucket (as shown in Firebase config) |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | App ID |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Optional; Google Analytics / measurement ID |

**`.env.local` format** (no spaces around `=`, no quotes unless the value itself needs them):

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123:web:abc
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Firebase checklist

1. Enable **Google** (or other) sign-in under **Authentication → Sign-in method**.
2. Create a **Firestore** database. The app expects a `users` collection and user documents (see `services/firebase/firestore.ts`). Adjust **security rules** for production so users can only read/write their own data.
3. If the API key is restricted in Google Cloud Console, allow your dev origin (e.g. `http://localhost:3000`) and production domain for the **Web API key** used by Firebase Auth.

### Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in from `/login`; the dashboard lives under `/dashboard`.

### Production build

```bash
npm run build
npm start
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |

## Project layout (high level)

```
app/                    # Next.js App Router pages (auth, dashboard, invoices, profile)
components/             # UI components (invoice, layout, auth, ui primitives)
config/                 # Static config (e.g. payment methods)
hooks/                  # React hooks (auth, language, invoices, business profiles)
lib/                    # Utilities, local storage, PDF/image export
locales/                # JSON translation files
services/firebase/      # Firebase app, auth helpers, Firestore user helpers
styles/                 # Global CSS
types/                  # TypeScript types
```

## Data model notes

- **User profile** in Firestore (`users/{uid}`) is used after sign-in (see `getUserDocument` / `createUserDocument`).
- **Invoices** and **business profiles** are **not** synced to Firestore in the current codebase; they live in `localStorage` keyed by Firebase `uid`. Clearing site data or using another browser loses that local data unless you add cloud sync later.

## Invoice export

Export is triggered from the invoice preview dialog (`components/invoice/invoice-pdf.tsx`). Implementation lives in `lib/pdf-generator.ts` (PNG via `html-to-image`, PDF by embedding that image in `jspdf`).

## Contributing

1. Follow existing patterns (client components where Firebase or `window` is used).
2. Add or update strings in **all** files under `locales/` when introducing new user-facing copy (see `hooks/use-language.tsx` for supported languages).

## License

Private project (`"private": true` in `package.json`). Add a `LICENSE` file if you intend to open-source.
