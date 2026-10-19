import { useMemo } from 'react';
import type { Entry } from '../types';

interface Props {
  entries: Record<string, Entry>;
}

interface Count {
  name: string;
  total: number;
  withFlare: number;
}

function correlate(entries: Entry[], pick: (e: Entry) => string[]): Count[] {
  const map = new Map<string, Count>();
  entries.forEach((e) => {
    const isLowDay = e.overallFeeling > 0 && e.overallFeeling <= 2;
    pick(e).forEach((name) => {
      const c = map.get(name) ?? { name, total: 0, withFlare: 0 };
      c.total += 1;
      if (isLowDay) c.withFlare += 1;
      map.set(name, c);
    });
  });
  return Array.from(map.values())
    .filter((c) => c.total >= 2)
    .sort((a, b) => b.withFlare / b.total - a.withFlare / a.total || b.total - a.total);
}

export default function InsightsView({ entries }: Props) {
  const logged = useMemo(
    () => Object.values(entries).filter((e) => e.overallFeeling > 0 || e.symptoms.length),
    [entries],
  );

  const foodCorrelations = useMemo(() => correlate(logged, (e) => e.foods), [logged]);
  const triggerCorrelations = useMemo(() => correlate(logged, (e) => e.triggers), [logged]);

  const loggedDays = logged.length;

  const exportText = () => {
    const rows = Object.values(entries)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((e) =>
        [
          e.date,
          `feeling:${e.overallFeeling || '-'}`,
          e.period ? 'period' : '',
          e.symptoms.length ? `symptoms:${e.symptoms.join('|')}` : '',
          e.mood.length ? `mood:${e.mood.join('|')}` : '',
          e.foods.length ? `foods:${e.foods.join('|')}` : '',
          e.triggers.length ? `triggers:${e.triggers.join('|')}` : '',
          e.notes ? `notes:${e.notes.replace(/\n/g, ' ')}` : '',
        ]
          .filter(Boolean)
          .join('  '),
      )
      .join('\n');
    const blob = new Blob([rows], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'health-diary-export.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loggedDays < 2) {
    return (
      <div className="insights-view">
        <section className="card">
          <h3>Patterns</h3>
          <p className="setup">Keep logging a few more days and patterns between foods, triggers and flare-ups will show up here.</p>
        </section>
      </div>
    );
  }

  return (
    <div className="insights-view">
      <section className="card">
        <h3>Possible food links</h3>
        {foodCorrelations.length === 0 ? (
          <p className="setup">No repeated foods logged yet.</p>
        ) : (
          <ul className="insight-list">
            {foodCorrelations.slice(0, 6).map((c) => (
              <li key={c.name}>
                <span>{c.name}</span>
                <span className="insight-ratio">{c.withFlare}/{c.total} low-feeling days</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card">
        <h3>Possible trigger links</h3>
        {triggerCorrelations.length === 0 ? (
          <p className="setup">No repeated triggers logged yet.</p>
        ) : (
          <ul className="insight-list">
            {triggerCorrelations.slice(0, 6).map((c) => (
              <li key={c.name}>
                <span>{c.name}</span>
                <span className="insight-ratio">{c.withFlare}/{c.total} low-feeling days</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card">
        <h3>For your doctor</h3>
        <p className="setup">Export a plain-text summary of everything you've logged to bring to an appointment.</p>
        <button type="button" onClick={exportText}>
          Download export
        </button>
      </section>
    </div>
  );
}
