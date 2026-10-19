import { ChevronDown, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface Props {
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
}

export default function SymptomDropdown({ options, selected, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const toggle = (value: string) => {
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
  };

  const addCustom = () => {
    const value = custom.trim();
    if (!value) return;
    if (!selected.includes(value)) onChange([...selected, value]);
    setCustom('');
  };

  const allOptions = [...options, ...selected.filter((s) => !options.includes(s))];

  return (
    <div className="dropdown" ref={ref}>
      <button type="button" className="dropdown-trigger" onClick={() => setOpen((o) => !o)}>
        <span>{selected.length ? `${selected.length} selected` : 'Select symptoms…'}</span>
        <ChevronDown size={18} className={open ? 'rotated' : ''} />
      </button>

      {selected.length > 0 && (
        <div className="tag-list dropdown-selected">
          {selected.map((s) => (
            <button key={s} type="button" className="tag tag-selected" onClick={() => toggle(s)}>
              {s}
              <X size={13} />
            </button>
          ))}
        </div>
      )}

      {open && (
        <div className="dropdown-panel">
          {allOptions.map((opt) => (
            <label key={opt} className="dropdown-option">
              <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggle(opt)} />
              {opt}
            </label>
          ))}
          <div className="tag-add dropdown-add">
            <input
              type="text"
              value={custom}
              placeholder="Add another symptom…"
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCustom();
                }
              }}
            />
            <button type="button" onClick={addCustom}>
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
