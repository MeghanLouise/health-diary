import { ChevronLeft, ChevronRight, Droplet } from 'lucide-react';
import { useMemo, useState } from 'react';
import { fromKey, toKey, todayKey } from '../dates';
import type { Entry } from '../types';

interface Props {
  entries: Record<string, Entry>;
  onSelectDate: (date: string) => void;
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const FEELING_LABELS: Record<number, string> = {
  1: 'Rough',
  2: 'Low',
  3: 'Okay',
  4: 'Good',
  5: 'Great',
};

export default function CalendarView({ entries, onSelectDate }: Props) {
  const [cursor, setCursor] = useState(() => {
    const d = fromKey(todayKey());
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [matchSymptoms, setMatchSymptoms] = useState<Set<string>>(new Set());
  const [detailDate, setDetailDate] = useState<string | null>(null);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (string | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => toKey(new Date(year, month, i + 1))),
  ];

  const allSymptoms = useMemo(() => {
    const set = new Set<string>();
    Object.values(entries).forEach((e) => e.symptoms.forEach((s) => set.add(s)));
    return Array.from(set).sort();
  }, [entries]);

  const toggleMatch = (symptom: string) => {
    setMatchSymptoms((prev) => {
      const next = new Set(prev);
      if (next.has(symptom)) next.delete(symptom);
      else next.add(symptom);
      return next;
    });
  };

  const today = todayKey();
  const detailEntry = detailDate ? entries[detailDate] : undefined;

  return (
    <div className="calendar-view">
      <div className="calendar-header">
        <button type="button" onClick={() => setCursor(new Date(year, month - 1, 1))} aria-label="Previous month">
          <ChevronLeft size={20} />
        </button>
        <strong>{cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</strong>
        <button type="button" onClick={() => setCursor(new Date(year, month + 1, 1))} aria-label="Next month">
          <ChevronRight size={20} />
        </button>
      </div>

      {allSymptoms.length > 0 && (
        <div className="pattern-filter">
          <span>Highlight days with (pick as many as you like):</span>
          <div className="tag-list">
            {allSymptoms.map((s) => (
              <button
                key={s}
                type="button"
                className={`tag ${matchSymptoms.has(s) ? 'tag-selected' : ''}`}
                onClick={() => toggleMatch(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="calendar-grid weekday-row">
        {WEEKDAYS.map((w, i) => (
          <div key={i} className="weekday">
            {w}
          </div>
        ))}
      </div>
      <div className="calendar-grid">
        {cells.map((key, i) => {
          if (!key) return <div key={i} className="day-cell empty" />;
          const entry = entries[key];
          const feeling = entry?.overallFeeling ?? 0;
          const highlighted = matchSymptoms.size > 0 && entry?.symptoms.some((s) => matchSymptoms.has(s));
          return (
            <button
              key={key}
              type="button"
              className={`day-cell feeling-${feeling} ${key === today ? 'is-today' : ''} ${highlighted ? 'is-match' : ''} ${key === detailDate ? 'is-selected' : ''}`}
              onClick={() => setDetailDate(key)}
            >
              {highlighted && <span className="match-flag" aria-hidden="true" />}
              <span className="day-number">{fromKey(key).getDate()}</span>
              {entry?.period && <Droplet className="period-dot" size={10} strokeWidth={0} fill="currentColor" />}
            </button>
          );
        })}
      </div>

      <div className="calendar-legend">
        <span className="legend-item"><i className="feeling-swatch feeling-1" />Rough</span>
        <span className="legend-item"><i className="feeling-swatch feeling-2" />Low</span>
        <span className="legend-item"><i className="feeling-swatch feeling-3" />Okay</span>
        <span className="legend-item"><i className="feeling-swatch feeling-4" />Good</span>
        <span className="legend-item"><i className="feeling-swatch feeling-5" />Great</span>
        <span className="legend-item"><Droplet size={12} strokeWidth={0} fill="currentColor" />Period</span>
      </div>

      {detailDate && (
        <section className="card day-detail">
          <h3>{fromKey(detailDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
          {detailEntry && (detailEntry.overallFeeling || detailEntry.symptoms.length || detailEntry.mood.length || detailEntry.period || detailEntry.notes || detailEntry.gratitude) ? (
            <div className="day-detail-body">
              {detailEntry.overallFeeling > 0 && (
                <p>
                  <strong>Feeling:</strong> {FEELING_LABELS[detailEntry.overallFeeling]}
                </p>
              )}
              {detailEntry.period && <p className="period-note"><Droplet size={14} strokeWidth={0} fill="currentColor" /> Period day</p>}
              {detailEntry.symptoms.length > 0 && (
                <p>
                  <strong>Symptoms:</strong> {detailEntry.symptoms.join(', ')}
                </p>
              )}
              {detailEntry.mood.length > 0 && (
                <p>
                  <strong>Mood:</strong> {detailEntry.mood.join(', ')}
                </p>
              )}
              {detailEntry.foods.length > 0 && (
                <p>
                  <strong>Foods:</strong> {detailEntry.foods.join(', ')}
                </p>
              )}
              {detailEntry.triggers.length > 0 && (
                <p>
                  <strong>Triggers:</strong> {detailEntry.triggers.join(', ')}
                </p>
              )}
              {detailEntry.gratitude && (
                <p>
                  <strong>Grateful for:</strong> {detailEntry.gratitude}
                </p>
              )}
              {detailEntry.notes && (
                <p>
                  <strong>Notes:</strong> {detailEntry.notes}
                </p>
              )}
            </div>
          ) : (
            <p className="setup">Nothing logged for this day yet.</p>
          )}
          <button type="button" className="open-day-button" onClick={() => onSelectDate(detailDate)}>
            Open this day
          </button>
        </section>
      )}
    </div>
  );
}
