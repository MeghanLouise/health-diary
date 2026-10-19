import { useEffect, useState } from 'react';
import { addDays, formatLong, todayKey } from '../dates';
import { quoteForDate } from '../quotes';
import { COMMON_SYMPTOMS, emptyEntry, MOOD_OPTIONS, type Entry } from '../types';
import Spinner from './Spinner';
import TagPicker from './TagPicker';

interface Props {
  date: string;
  entries: Record<string, Entry>;
  onSave: (entry: Entry) => Promise<void>;
  onNavigateDate: (date: string) => void;
  onGoToCalendar: () => void;
}

const FEELINGS = [
  { value: 1, label: 'Rough', icon: '😣' },
  { value: 2, label: 'Low', icon: '😕' },
  { value: 3, label: 'Okay', icon: '😐' },
  { value: 4, label: 'Good', icon: '🙂' },
  { value: 5, label: 'Great', icon: '😄' },
];

export default function DayView({ date, entries, onSave, onNavigateDate, onGoToCalendar }: Props) {
  const stored = entries[date] ?? emptyEntry(date);
  const [entry, setEntry] = useState<Entry>(stored);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setEntry(entries[date] ?? emptyEntry(date));
    setSaved(false);
  }, [date, entries]);

  const update = (patch: Partial<Entry>) => {
    setEntry((prev) => ({ ...prev, ...patch }));
    setSaved(false);
  };

  const save = async () => {
    setSaving(true);
    try {
      await onSave(entry);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  const isToday = date === todayKey();

  return (
    <div className="day-view">
      <div className="quote-card">
        <p>“{quoteForDate(date)}”</p>
      </div>

      <div className="day-nav">
        <button type="button" onClick={() => onNavigateDate(addDays(date, -1))} aria-label="Previous day">
          ‹
        </button>
        <div className="day-nav-label">
          <strong>{isToday ? 'Today' : formatLong(date)}</strong>
          {!isToday && <button className="link" type="button" onClick={() => onNavigateDate(todayKey())}>Back to today</button>}
        </div>
        <button
          type="button"
          onClick={() => onNavigateDate(addDays(date, 1))}
          aria-label="Next day"
          disabled={date >= todayKey()}
        >
          ›
        </button>
      </div>

      <section className="card">
        <h3>Overall feeling</h3>
        <div className="feeling-row">
          {FEELINGS.map((f) => (
            <button
              key={f.value}
              type="button"
              className={`feeling ${entry.overallFeeling === f.value ? 'feeling-selected' : ''}`}
              onClick={() => update({ overallFeeling: f.value })}
            >
              <span className="icon">{f.icon}</span>
              <span>{f.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="card">
        <label className="period-toggle">
          <input
            type="checkbox"
            checked={entry.period}
            onChange={(e) => update({ period: e.target.checked })}
          />
          Period today
        </label>
      </section>

      <section className="card">
        <TagPicker
          label="Symptoms"
          options={COMMON_SYMPTOMS}
          selected={entry.symptoms}
          onChange={(symptoms) => update({ symptoms })}
        />
      </section>

      <section className="card">
        <TagPicker label="Mood" options={MOOD_OPTIONS} selected={entry.mood} onChange={(mood) => update({ mood })} />
      </section>

      <section className="card">
        <TagPicker
          label="Foods"
          options={[]}
          selected={entry.foods}
          onChange={(foods) => update({ foods })}
        />
      </section>

      <section className="card">
        <TagPicker
          label="Other triggers"
          options={['Stress', 'Poor sleep', 'Alcohol', 'Travel', 'Weather change', 'Exercise']}
          selected={entry.triggers}
          onChange={(triggers) => update({ triggers })}
        />
      </section>

      <section className="card">
        <h3>Notes</h3>
        <textarea
          rows={4}
          value={entry.notes}
          placeholder="Anything else worth remembering about today…"
          onChange={(e) => update({ notes: e.target.value })}
        />
      </section>

      <button type="button" className="save-button" onClick={save} disabled={saving}>
        {saving && <Spinner />}
        {saved ? 'Saved ✓' : 'Save entry'}
      </button>

      <button type="button" className="link calendar-link" onClick={onGoToCalendar}>
        View on calendar →
      </button>
    </div>
  );
}
