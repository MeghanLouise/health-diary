const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

initializeApp();
const db = getFirestore();

// Comma-separated codes, set in functions/.env as INVITE_CODES (see .env.example).
// Generate one with: npm run invite (from the project root).
function validCodes() {
  return (process.env.INVITE_CODES || '')
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean);
}

// Checked before an account is created, so an invalid code never leaves a stray
// Firebase Auth account behind.
exports.checkInvite = onCall(async (request) => {
  const code = String(request.data?.code || '').trim();
  if (!code) throw new HttpsError('invalid-argument', 'Enter an invite code.');
  if (!validCodes().includes(code)) {
    throw new HttpsError('permission-denied', 'That invite code is not valid.');
  }
  const used = await db.collection('invites_used').doc(code).get();
  if (used.exists) {
    throw new HttpsError('permission-denied', 'That invite code has already been used.');
  }
  return { ok: true };
});

// Called once signed in (right after sign-up, or on first sign-in for an
// account that hasn't redeemed a code yet, e.g. via Google). Marks the code
// used and the account activated, both only writable here via the Admin SDK —
// Firestore rules refuse these writes from the client directly.
exports.redeemInvite = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in first.');
  const code = String(request.data?.code || '').trim();
  if (!code || !validCodes().includes(code)) {
    throw new HttpsError('permission-denied', 'That invite code is not valid.');
  }

  const uid = request.auth.uid;
  const usedRef = db.collection('invites_used').doc(code);

  await db.runTransaction(async (tx) => {
    const usedSnap = await tx.get(usedRef);
    if (usedSnap.exists) {
      throw new HttpsError('permission-denied', 'That invite code has already been used.');
    }
    tx.set(usedRef, { usedBy: uid, usedAt: FieldValue.serverTimestamp() });
    tx.set(db.doc(`users/${uid}/meta/activation`), {
      activated: true,
      activatedAt: FieldValue.serverTimestamp(),
    });
  });

  return { ok: true };
});
