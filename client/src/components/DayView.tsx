import { Angry, ChevronLeft, ChevronRight, Droplet, Frown, Laugh, Meh, Smile } from 'lucide-react';
import { useEffect, useState } from 'react';
import { addDays, formatLong, todayKey } from '../dates';
import { quoteForDate } from '../quotes';
import { COMMON_SYMPTOMS, emptyEntry, MOOD_OPTIONS, type Entry } from '../types';
import Spinner from './Spinner';
import SymptomDropdown from './SymptomDropdown';
import TagPicker from './TagPicker';

interface Props {
  date: string;
  entries: Record<string, Entry>;
  onSave: (entry: Entry) => Promise<void>;
  onNavigateDate: (date: string) => void;
  onGoToCalendar: () => void;
}

const FEELINGS = [
  { value: 1, label: 'Rough', Icon: Angry },
  { value: 2, label: 'Low', Icon: Frown },
  { value: 3, label: 'Okay', Icon: Meh },
  { value: 4, label: 'Good', Icon: Smile },
  { value: 5, label: 'Great', Icon: Laugh },
];

export default function DayView({ date, entries, onSave, onNavigateDate, onGoToCalendar }: Props) {
  const stored = entries[date] ?? emptyEntry(date);
  const [entry, setEntry] = useState<Entry>(stored);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Re-sync from stored data only when the date changes — not on every `entries` update,
  // since saving an entry changes `entries` too and would otherwise instantly clear "Saved ✓".
  useEffect(() => {
    setEntry(entries[date] ?? emptyEntry(date));
    setSaved(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

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
          <ChevronLeft size={20} />
        </button>
        <div className="day-nav-label">
          <strong>{isToday ? 'Today' : formatLong(date)}</strong>
        </div>
        <button
          type="button"
          onClick={() => onNavigateDate(addDays(date, 1))}
          aria-label="Next day"
          disabled={date >= todayKey()}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {!isToday && (
        <button type="button" className="back-to-today" onClick={() => onNavigateDate(todayKey())}>
          Back to today
        </button>
      )}

      <section className="card">
        <h3>Overall feeling</h3>
        <div className="feeling-row">
          {FEELINGS.map(({ value, label, Icon }) => (
            <button
              key={value}
              type="button"
              className={`feeling feeling-${value} ${entry.overallFeeling === value ? 'feeling-selected' : ''}`}
              onClick={() => update({ overallFeeling: value })}
            >
              <Icon className="icon" size={22} strokeWidth={1.75} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="card period-card">
        <span className="period-card-label">Period today</span>
        <button
          type="button"
          className={`period-circle ${entry.period ? 'period-circle-active' : ''}`}
          aria-pressed={entry.period}
          onClick={() => update({ period: !entry.period })}
        >
          <Droplet size={22} strokeWidth={1.75} />
        </button>
      </section>

      <section className="card">
        <span className="tag-picker-label">Symptoms</span>
        <SymptomDropdown
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

      <section className="card gratitude-card">
        <h3>What are you grateful for today?</h3>
        <textarea
          rows={3}
          value={entry.gratitude}
          placeholder="Big or small, anything that made today a little better…"
          onChange={(e) => update({ gratitude: e.target.value })}
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
