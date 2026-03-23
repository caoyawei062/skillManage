import { SkillSource, Skill } from '../types';
import { Tag as TagIcon, FolderPlus } from 'lucide-react';
import { categories } from '../themes';
import { LucideIcon } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  icon: LucideIcon;
}

interface SidebarProps {
  colors: {
    bg: string;
    card: string;
    border: string;
    primary: string;
    text: string;
    muted: string;
    accent: string;
  };
  categories: Category[];
  selectedCategory: string | null;
  setSelectedCategory: (id: string | null) => void;
  tags: string[];
  selectedTag: string | null;
  setSelectedTag: (tag: string | null) => void;
  sources: SkillSource[];
  selectedSource: string | null;
  setSelectedSource: (source: string | null) => void;
  skillsCount: number;
  skills: Skill[];
  onAddSource: (type: 'global' | 'project') => void;
}

export default function Sidebar({
  colors,
  categories,
  selectedCategory,
  setSelectedCategory,
  tags,
  selectedTag,
  setSelectedTag,
  sources,
  selectedSource,
  setSelectedSource,
  skillsCount,
  skills,
  onAddSource,
}: SidebarProps) {
  // Filter skills based on selected source
  const filteredSkills = selectedSource
    ? skills.filter(s => s.sourceId === selectedSource)
    : skills;

  // Count skills by source
  const skillsBySource = skills.reduce((acc, skill) => {
    const sourceId = skill.sourceId || skill.source || 'unknown';
    acc[sourceId] = (acc[sourceId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Get count by category - based on filtered skills
  const getCategoryCount = (catId: string) => {
    const cat = categories.find(c => c.id === catId);
    if (!cat) return 0;
    return filteredSkills.filter(s => 
      s.category?.toLowerCase() === cat.name.toLowerCase()
    ).length;
  };

  // Get count by tag - based on filtered skills
  const getTagCount = (tag: string) => {
    return filteredSkills.filter(s => s.tags?.includes(tag)).length;
  };

  return (
    <aside 
      className="w-56 flex flex-col border-r overflow-hidden"
      style={{ backgroundColor: colors.bg, borderColor: colors.border }}
    >
      {/* All Skills */}
      <div className="p-4">
        <button
          onClick={() => {
            setSelectedCategory(null);
            setSelectedTag(null);
            setSelectedSource(null);
          }}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{
            backgroundColor: !selectedCategory && !selectedTag && !selectedSource ? colors.card : 'transparent',
            color: colors.text,
          }}
        >
          <span>All Skills</span>
          <span 
            className="px-2 py-0.5 rounded-full text-xs"
            style={{ backgroundColor: colors.primary, color: '#fff' }}
          >
            {skillsCount}
          </span>
        </button>
      </div>

      {/* Categories */}
      <div className="px-4 mb-4">
        <h3 
          className="text-xs font-semibold uppercase tracking-wider mb-2"
          style={{ color: colors.muted }}
        >
          Category
        </h3>
        <div className="space-y-1">
          {categories.map((cat) => {
            const count = getCategoryCount(cat.id);
            if (count === 0) return null;
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(selectedCategory === cat.id ? null : cat.id);
                  setSelectedTag(null);
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors"
                style={{
                  backgroundColor: selectedCategory === cat.id ? colors.card : 'transparent',
                  color: selectedCategory === cat.id ? colors.primary : colors.text,
                }}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span>{cat.name}</span>
                </div>
                <span 
                  className="px-1.5 py-0.5 rounded text-xs"
                  style={{ 
                    backgroundColor: selectedCategory === cat.id ? colors.primary + '20' : colors.bg, 
                    color: selectedCategory === cat.id ? colors.primary : colors.muted 
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tags */}
      {filteredSkills.length > 0 && (
        <div className="px-4 mb-4">
          <h3 
            className="text-xs font-semibold uppercase tracking-wider mb-2"
            style={{ color: colors.muted }}
          >
            Tags
          </h3>
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 10).map((tag) => {
              const tagCount = getTagCount(tag);
              return (
                <button
                  key={tag}
                  onClick={() => {
                    setSelectedTag(selectedTag === tag ? null : tag);
                    setSelectedCategory(null);
                  }}
                  className="flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors"
                  style={{
                    backgroundColor: selectedTag === tag ? colors.primary : colors.card,
                    color: selectedTag === tag ? '#fff' : colors.muted,
                  }}
                >
                  <TagIcon className="w-3 h-3" />
                  #{tag} {tagCount > 1 && <span className="opacity-60">({tagCount})</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Sources */}
      <div className="px-4 mb-4 flex-1">
        <h3 
          className="text-xs font-semibold uppercase tracking-wider mb-2"
          style={{ color: colors.muted }}
        >
          Source
        </h3>
        <div className="space-y-1">
          {sources.map((source) => {
            const count = skillsBySource[source.id] || 0;
            // Only show sources with skills
            if (count === 0 && source.id !== selectedSource) return null;
            return (
              <button
                key={source.id}
                onClick={() => {
                  setSelectedSource(selectedSource === source.id ? null : source.id);
                  setSelectedCategory(null);
                  setSelectedTag(null);
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors"
                style={{
                  backgroundColor: selectedSource === source.id ? colors.card : 'transparent',
                  color: selectedSource === source.id ? colors.primary : colors.text,
                }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span>◎</span>
                  <span className="truncate flex-1 text-left" title={source.path}>
                    {source.name}
                  </span>
                </div>
                <span 
                  className="px-1.5 py-0.5 rounded text-xs flex-shrink-0"
                  style={{ 
                    backgroundColor: selectedSource === source.id ? colors.primary + '20' : colors.bg, 
                    color: selectedSource === source.id ? colors.primary : colors.muted 
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Add Source Button */}
      <div className="p-4 border-t" style={{ borderColor: colors.border }}>
        <button
          onClick={() => onAddSource('project')}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
          style={{ 
            backgroundColor: colors.card, 
            color: colors.muted,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <FolderPlus className="w-4 h-4" />
          Add Project
        </button>
      </div>
    </aside>
  );
}
