interface Props {
  currentPath?: string;
  onNavigate: (path: string) => void;
}

const ITEMS: { path: string; label: string; icon: string }[] = [
  { path: '/', label: 'Today', icon: '🏠' },
  { path: '/calendar', label: 'Calendar', icon: '📅' },
  { path: '/insights', label: 'Patterns', icon: '✨' },
];

export default function BottomNav({ currentPath, onNavigate }: Props) {
  if (!currentPath) return null;
  return (
    <nav className="bottom-nav">
      {ITEMS.map((item) => (
        <button
          key={item.path}
          type="button"
          className={item.path === currentPath ? 'active' : ''}
          onClick={() => onNavigate(item.path)}
        >
          <span className="icon">{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
