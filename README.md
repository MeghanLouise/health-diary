# Nourish

A personal health diary: log symptoms, mood, period days and possible triggers (food or
otherwise), see them on a calendar, and spot patterns between what you log and how you feel.

## Setup

1. `npm install`
2. Create a Firebase project (console.firebase.google.com), enable **Authentication** (Email/Password
   and Google), and enable **Firestore**.
3. Copy `.env.example` to `.env` and fill in the `VITE_FIREBASE_*` values from
   Project settings > Your apps > Web app.
4. Deploy the security rules once: `npx firebase-tools deploy --only firestore:rules` (after
   `npx firebase-tools use --add` to pick your project, or edit `.firebaserc`).
5. `npm run dev`

## Features

- Email/password and Google sign-in (Firebase Auth)
- Daily log: overall feeling, symptoms, mood, period, foods and other triggers, notes
- Calendar view, colour-coded by how the day felt, with a filter to highlight every day a
  chosen symptom showed up
- A simple patterns view that surfaces foods/triggers that show up more often on low-feeling days
- A different motivational quote each day
- Export a plain-text summary to take to a doctor's appointment

Each person's data lives at `users/{uid}/entries/{date}` in Firestore, locked down so only that
signed-in user can read or write it.
