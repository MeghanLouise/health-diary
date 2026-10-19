import { useState } from 'react';

interface Props {
  label: string;
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
  allowCustom?: boolean;
}

export default function TagPicker({ label, options, selected, onChange, allowCustom = true }: Props) {
  const [custom, setCustom] = useState('');

  const toggle = (value: string) => {
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
  };

  const addCustom = () => {
    const value = custom.trim();
    if (!value) return;
    if (!selected.includes(value)) onChange([...selected, value]);
    setCustom('');
  };

  // Merge custom entries already selected so they show as chips too.
  const allOptions = [...options, ...selected.filter((s) => !options.includes(s))];

  return (
    <div className="tag-picker">
      <span className="tag-picker-label">{label}</span>
      <div className="tag-list">
        {allOptions.map((opt) => (
          <button
            key={opt}
            type="button"
            className={`tag ${selected.includes(opt) ? 'tag-selected' : ''}`}
            onClick={() => toggle(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
      {allowCustom && (
        <div className="tag-add">
          <input
            type="text"
            value={custom}
            placeholder={`Add ${label.toLowerCase()}…`}
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
      )}
    </div>
  );
}
