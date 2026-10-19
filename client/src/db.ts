import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { decryptJSON, encryptJSON, exportKey, generateKey, importKey, type EncryptedPayload } from './crypto';
import { db } from './firebase';
import type { Entry } from './types';

const entriesRef = (uid: string) => collection(db!, 'users', uid, 'entries');
const keyDocRef = (uid: string) => doc(db!, 'users', uid, 'meta', 'encryptionKey');

// Cached per uid for the life of the tab, so we don't re-fetch it before every save.
const keyCache = new Map<string, CryptoKey>();

async function getKey(uid: string): Promise<CryptoKey> {
  const cached = keyCache.get(uid);
  if (cached) return cached;

  const snap = await getDoc(keyDocRef(uid));
  let key: CryptoKey;
  if (snap.exists()) {
    key = await importKey((snap.data() as { key: string }).key);
  } else {
    // First time this account has saved anything — mint a key and store it
    // alongside the data it protects. See crypto.ts for what this does and doesn't guard against.
    key = await generateKey();
    await setDoc(keyDocRef(uid), { key: await exportKey(key) });
  }
  keyCache.set(uid, key);
  return key;
}

export async function loadEntries(uid: string): Promise<Record<string, Entry>> {
  const key = await getKey(uid);
  const snap = await getDocs(entriesRef(uid));
  const entries: Record<string, Entry> = {};
  await Promise.all(
    snap.docs.map(async (d) => {
      try {
        entries[d.id] = await decryptJSON<Entry>(key, d.data() as EncryptedPayload);
      } catch (err) {
        // Shouldn't happen for entries this key wrote, but one unreadable doc
        // (e.g. corrupted, or written before encryption was added) shouldn't
        // take the whole day's data down with it.
        console.error(`Could not decrypt entry ${d.id}`, err);
      }
    }),
  );
  return entries;
}

export async function saveEntry(uid: string, entry: Entry): Promise<void> {
  const key = await getKey(uid);
  const payload = await encryptJSON(key, { ...entry, updatedAt: Date.now() });
  await setDoc(doc(entriesRef(uid), entry.date), payload);
}
