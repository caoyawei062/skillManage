import { Skill, ViewMode, SkillSource } from '../types';
import { Trash2, Lightbulb } from 'lucide-react';

interface SkillGridProps {
  skills: Skill[];
  colors: {
    bg: string;
    card: string;
    border: string;
    primary: string;
    text: string;
    muted: string;
    accent: string;
  };
  viewMode: ViewMode;
  sources: SkillSource[];
  onSelectSkill: (skill: Skill) => void;
  onDeleteSkill: (skill: Skill) => void;
}

export default function SkillGrid({
  skills,
  colors,
  viewMode,
  sources,
  onSelectSkill,
  onDeleteSkill,
}: SkillGridProps) {
  // Group skills by sourceId
  const skillsBySource = skills.reduce((acc, skill) => {
    const sourceId = skill.sourceId || skill.source || 'unknown';
    if (!acc[sourceId]) acc[sourceId] = [];
    acc[sourceId].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  // Get source info by id
  const getSourceInfo = (sourceId: string) => {
    const source = sources.find(s => s.id === sourceId);
    return {
      name: source?.name || (sourceId === 'global-default' ? 'Global' : sourceId),
      type: source?.type || 'global',
    };
  };

  if (skills.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: colors.card }}>
            <Lightbulb className="w-8 h-8" style={{ color: colors.muted }} />
          </div>
          <h3 className="text-lg font-medium mb-2" style={{ color: colors.text }}>No skills found</h3>
          <p style={{ color: colors.muted }}>Add a skill or adjust your filters</p>
        </div>
      </div>
    );
  }

  const sourceGroups = Object.entries(skillsBySource);

  // Grouped list view
  if (viewMode === 'list') {
    return (
      <div className="space-y-6">
        {sourceGroups.map(([sourceId, sourceSkills]) => {
          const sourceInfo = getSourceInfo(sourceId);
          return (
            <div key={sourceId}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium" style={{ color: colors.muted }}>{sourceInfo.name}</span>
                <div className="flex-1 h-px" style={{ backgroundColor: colors.border }} />
                <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: colors.card, color: colors.muted }}>
                  {sourceSkills.length}
                </span>
              </div>
              <div className="space-y-2">
                {sourceSkills.map((skill) => (
                  <div
                    key={skill.id}
                    className="flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all"
                    style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}
                    onClick={() => onSelectSkill(skill)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center font-semibold text-sm"
                        style={{ backgroundColor: colors.primary + '20', color: colors.primary }}>
                        {skill.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-medium" style={{ color: colors.text }}>{skill.name}</h3>
                        <p className="text-sm truncate max-w-md" style={{ color: colors.muted }}>
                          {skill.description || 'No description'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-1 rounded-md text-xs" style={{ backgroundColor: colors.bg, color: colors.accent }}>
                        {skill.category}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); onDeleteSkill(skill); }}
                        className="p-2 rounded-lg transition-colors hover:text-red-500"
                        style={{ color: colors.muted }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Grouped grid view
  return (
    <div className="space-y-6">
      {sourceGroups.map(([sourceId, sourceSkills]) => {
        const sourceInfo = getSourceInfo(sourceId);
        return (
          <div key={sourceId}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium" style={{ color: colors.muted }}>{sourceInfo.name}</span>
              <div className="flex-1 h-px" style={{ backgroundColor: colors.border }} />
              <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: colors.card, color: colors.muted }}>
                {sourceSkills.length}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sourceSkills.map((skill) => (
                <div
                  key={skill.id}
                  className="p-4 rounded-xl cursor-pointer transition-all hover:scale-[1.02]"
                  style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}
                  onClick={() => onSelectSkill(skill)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center font-semibold text-sm"
                      style={{ backgroundColor: colors.primary + '20', color: colors.primary }}>
                      {skill.name.slice(0, 2).toUpperCase()}
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteSkill(skill); }}
                      className="p-1.5 rounded-lg hover:text-red-500 transition-colors"
                      style={{ color: colors.muted }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="font-medium mb-1" style={{ color: colors.text }}>{skill.name}</h3>
                  <p className="text-sm mb-3 line-clamp-2" style={{ color: colors.muted }}>
                    {skill.description || 'No description'}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-1 rounded-md text-xs" style={{ backgroundColor: colors.bg, color: colors.accent }}>
                      v{skill.version}
                    </span>
                    <span className="px-2 py-1 rounded-md text-xs" style={{ backgroundColor: colors.bg, color: colors.muted }}>
                      {skill.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
