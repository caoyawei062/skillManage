import { ViewMode } from '../types';
import { Search, Grid3X3, List, Plus, Settings } from 'lucide-react';

interface TopBarProps {
  colors: {
    bg: string;
    card: string;
    border: string;
    primary: string;
    text: string;
    muted: string;
    accent: string;
  };
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  onAddSkill: () => void;
  onOpenSettings: () => void;
}

export default function TopBar({
  colors,
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  onAddSkill,
  onOpenSettings,
}: TopBarProps) {
  return (
    <header 
      className="h-12 flex items-center justify-between px-4 border-b"
      style={{ backgroundColor: colors.bg, borderColor: colors.border }}
    >
      {/* Search */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
          style={{ color: colors.muted }}
        />
        <input
          type="text"
          placeholder="Search skills..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-64 pl-10 pr-4 py-2 rounded-lg text-sm border outline-none transition-colors"
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border,
            color: colors.text,
          }}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* View Mode Toggle */}
        <div 
          className="flex items-center rounded-lg p-1"
          style={{ backgroundColor: colors.card }}
        >
          <button
            onClick={() => setViewMode('grid')}
            className="p-2 rounded-md transition-colors"
            style={{ backgroundColor: viewMode === 'grid' ? colors.primary : 'transparent', color: '#fff' }}
            title="Grid view"
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className="p-2 rounded-md transition-colors"
            style={{ backgroundColor: viewMode === 'list' ? colors.primary : 'transparent', color: '#fff' }}
            title="List view"
          >
            <List className="w-4 h-4" />
          </button>
        </div>

        {/* Add Skill Button */}
        <button
          onClick={onAddSkill}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{ backgroundColor: colors.primary, color: '#fff' }}
        >
          <Plus className="w-4 h-4" />
          Add
        </button>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-lg transition-colors"
          style={{ backgroundColor: colors.card, color: colors.muted }}
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
