import { signOut } from 'firebase/auth';
import { useEffect, useState } from 'react';
import BottomNav from './components/BottomNav';
import CalendarView from './components/CalendarView';
import DayView from './components/DayView';
import InsightsView from './components/InsightsView';
import SignIn from './components/SignIn';
import Spinner from './components/Spinner';
import { todayKey } from './dates';
import { loadEntries, saveEntry } from './db';
import { auth, firebaseConfigured } from './firebase';
import type { Entry } from './types';
import { useAuth } from './useAuth';
import { usePath } from './usePath';

export default function App() {
  const { user, loading } = useAuth();
  const [path, navigate] = usePath();
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const [entries, setEntries] = useState<Record<string, Entry>>({});
  const [entriesLoading, setEntriesLoading] = useState(false);

  const uid = user?.uid;
  useEffect(() => {
    if (!uid) {
      setEntries({});
      return;
    }
    setEntriesLoading(true);
    loadEntries(uid)
      .then(setEntries)
      .finally(() => setEntriesLoading(false));
  }, [uid]);

  const handleSave = async (entry: Entry) => {
    if (!uid) return;
    await saveEntry(uid, entry);
    setEntries((prev) => ({ ...prev, [entry.date]: { ...entry, updatedAt: Date.now() } }));
  };

  let content;
  if (!firebaseConfigured) {
    content = (
      <section className="card">
        <h2>Finish setting up sign-in</h2>
        <p className="setup">
          Add your Firebase settings to <code>.env</code> (see <code>.env.example</code>), then
          restart the dev server.
        </p>
      </section>
    );
  } else if (loading) {
    content = (
      <div className="page-loading">
        <Spinner label="Loading…" />
      </div>
    );
  } else if (!user) {
    content = <SignIn />;
  } else if (entriesLoading) {
    content = (
      <div className="page-loading">
        <Spinner label="Loading your entries…" />
      </div>
    );
  } else if (path === '/calendar') {
    content = (
      <CalendarView
        entries={entries}
        onSelectDate={(date) => {
          setSelectedDate(date);
          navigate('/');
        }}
      />
    );
  } else if (path === '/insights') {
    content = <InsightsView entries={entries} />;
  } else {
    content = (
      <DayView
        date={selectedDate}
        entries={entries}
        onSave={handleSave}
        onNavigateDate={setSelectedDate}
        onGoToCalendar={() => navigate('/calendar')}
      />
    );
  }

  return (
    <div data-page={path === '/calendar' ? 'calendar' : path === '/insights' ? 'insights' : 'today'}>
      {firebaseConfigured && user && (
        <header className="masthead">
          <h1>
            Nourish
          </h1>
          <button type="button" className="sign-out" onClick={() => signOut(auth!)}>
            Sign out
          </button>
        </header>
      )}
      <main className="app">{content}</main>
      {firebaseConfigured && user && <BottomNav currentPath={path || '/'} onNavigate={navigate} />}
    </div>
  );
}
