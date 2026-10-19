import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

// Verified before an account is created, so a bad code never leaves a stray account behind.
export async function checkInvite(code: string): Promise<void> {
  await httpsCallable(functions!, 'checkInvite')({ code });
}

// Called once signed in: marks the code used and the account activated server-side.
export async function redeemInvite(code: string): Promise<void> {
  await httpsCallable(functions!, 'redeemInvite')({ code });
}
