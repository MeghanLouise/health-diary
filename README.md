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
5. Upgrade the Firebase project to the **Blaze (pay-as-you-go)** plan — required for Cloud
   Functions, which is how invite codes are enforced (still free at this scale, but needs a card
   on file). Then set an invite code: `npm run invite` to generate one, add it to
   `functions/.env` as `INVITE_CODES=<the code>` (see `functions/.env.example`; comma-separate
   several codes), and deploy the functions: `npx firebase-tools deploy --only functions`.
6. `npm run dev`

## Invite-only sign-up

New accounts need an invite code (set via `INVITE_CODES` — see step 5 above). The code is checked
and redeemed by Cloud Functions (`functions/index.js`), not the client, so it can't be bypassed by
reading the app's source: an account only gets marked "activated" in Firestore
(`users/{uid}/meta/activation`) once a valid, unused code is redeemed, and only the functions'
Admin SDK can write that field — see `firestore.rules`. Each code is single-use. Signing up with
Google skips straight to account creation (no code prompt up front), then asks for a code once
signed in, same as email/password.

## Features

- Email/password and Google sign-in (Firebase Auth), gated by an invite code
- Daily log: overall feeling, symptoms, mood, period, foods and other triggers, notes
- Calendar view, colour-coded by how the day felt, with a filter to highlight every day a
  chosen symptom showed up
- A simple patterns view that surfaces foods/triggers that show up more often on low-feeling days
- A different motivational quote each day
- Export a plain-text summary to take to a doctor's appointment

Each person's data lives at `users/{uid}/entries/{date}` in Firestore, locked down so only that
signed-in user can read or write it.

## Encryption

Firestore already encrypts everything at rest and in transit by default (Google-managed).
On top of that, entry content (symptoms, mood, notes, gratitude, etc.) is also encrypted in the
browser with AES-256-GCM before it's ever sent, using a random key generated the first time an
account saves anything. That key is stored in Firestore too (`users/{uid}/meta/encryptionKey`),
protected by the same per-user security rule as everything else.

This guards against exposure of the raw documents — a leaked export, a misconfigured security
rule, someone browsing the Firestore console — not against someone with full Firebase/Google Cloud
project access, since the key lives in the same project. It's not zero-knowledge end-to-end
encryption (that would require deriving the key from a password, which would break Google sign-in
and make a forgotten password unrecoverable); this trades some of that guarantee for keeping
sign-in and account recovery simple.
