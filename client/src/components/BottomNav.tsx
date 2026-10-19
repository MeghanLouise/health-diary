import { CalendarDays, House, Sparkles } from 'lucide-react';

interface Props {
  currentPath?: string;
  onNavigate: (path: string) => void;
}

const ITEMS = [
  { path: '/', label: 'Today', Icon: House },
  { path: '/calendar', label: 'Calendar', Icon: CalendarDays },
  { path: '/insights', label: 'Patterns', Icon: Sparkles },
];

export default function BottomNav({ currentPath, onNavigate }: Props) {
  if (!currentPath) return null;
  return (
    <nav className="bottom-nav">
      {ITEMS.map(({ path, label, Icon }) => (
        <button
          key={path}
          type="button"
          className={path === currentPath ? 'active' : ''}
          onClick={() => onNavigate(path)}
        >
          <Icon className="icon" size={20} strokeWidth={2} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
