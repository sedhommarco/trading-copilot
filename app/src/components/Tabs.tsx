import { TabId } from '../types';

interface Props {
  tabs: readonly TabId[];
  labels: Record<TabId, string>;
  active: TabId;
  onChange: (tab: TabId) => void;
}

export default function Tabs({ tabs, labels, active, onChange }: Props) {
  return (
    <div className="tabs">
      {tabs.map(tab => (
        <button
          key={tab}
          className={`tab${tab === active ? ' active' : ''}`}
          onClick={() => onChange(tab)}
        >
          {labels[tab]}
        </button>
      ))}
    </div>
  );
}
