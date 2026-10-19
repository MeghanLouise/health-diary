import { collection, doc, getDocs, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { Entry } from './types';

const entriesRef = (uid: string) => collection(db!, 'users', uid, 'entries');

export async function loadEntries(uid: string): Promise<Record<string, Entry>> {
  const snap = await getDocs(entriesRef(uid));
  const entries: Record<string, Entry> = {};
  snap.forEach((d) => {
    entries[d.id] = d.data() as Entry;
  });
  return entries;
}

export async function saveEntry(uid: string, entry: Entry): Promise<void> {
  await setDoc(doc(entriesRef(uid), entry.date), { ...entry, updatedAt: Date.now() });
}
