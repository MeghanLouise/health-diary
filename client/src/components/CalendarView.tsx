import { useMemo, useState } from 'react';
import { fromKey, toKey, todayKey } from '../dates';
import type { Entry } from '../types';

interface Props {
  entries: Record<string, Entry>;
  onSelectDate: (date: string) => void;
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function CalendarView({ entries, onSelectDate }: Props) {
  const [cursor, setCursor] = useState(() => {
    const d = fromKey(todayKey());
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [matchSymptom, setMatchSymptom] = useState<string | null>(null);

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

  const today = todayKey();

  return (
    <div className="calendar-view">
      <div className="calendar-header">
        <button type="button" onClick={() => setCursor(new Date(year, month - 1, 1))} aria-label="Previous month">
          ‹
        </button>
        <strong>{cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</strong>
        <button type="button" onClick={() => setCursor(new Date(year, month + 1, 1))} aria-label="Next month">
          ›
        </button>
      </div>

      {allSymptoms.length > 0 && (
        <div className="pattern-filter">
          <span>Highlight days with:</span>
          <div className="tag-list">
            {allSymptoms.map((s) => (
              <button
                key={s}
                type="button"
                className={`tag ${matchSymptom === s ? 'tag-selected' : ''}`}
                onClick={() => setMatchSymptom(matchSymptom === s ? null : s)}
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
          const highlighted = matchSymptom ? entry?.symptoms.includes(matchSymptom) : false;
          return (
            <button
              key={key}
              type="button"
              className={`day-cell feeling-${feeling} ${key === today ? 'is-today' : ''} ${highlighted ? 'is-match' : ''}`}
              onClick={() => onSelectDate(key)}
            >
              <span className="day-number">{fromKey(key).getDate()}</span>
              {entry?.period && <span className="period-dot" aria-label="Period" />}
            </button>
          );
        })}
      </div>

      <div className="calendar-legend">
        <span className="legend-item"><i className="feeling-swatch feeling-1" />Rough</span>
        <span className="legend-item"><i className="feeling-swatch feeling-3" />Okay</span>
        <span className="legend-item"><i className="feeling-swatch feeling-5" />Great</span>
        <span className="legend-item"><i className="period-dot" />Period</span>
      </div>
    </div>
  );
}
