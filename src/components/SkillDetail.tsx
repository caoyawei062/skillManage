import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  ArrowLeft, 
  Edit3, 
  Trash2, 
  FolderOpen, 
  ExternalLink,
  ChevronDown,
  Tag,
  X,
  Check,
  Plus
} from 'lucide-react';
import { Skill } from '../types';
import { categories, categoryIcons } from '../themes';

interface SkillDetailProps {
  skill: Skill;
  colors: { bg: string; card: string; border: string; primary: string; text: string; muted: string; accent: string; };
  onBack: () => void;
  onSave: (skill: Skill, content: string) => void;
  onDelete: (skill: Skill) => void;
  onCategoryChange?: (skill: Skill, newCategory: string) => void;
  onTagsChange?: (skill: Skill, tags: string[]) => void;
}

export default function SkillDetail({ skill, colors, onBack, onSave, onDelete, onCategoryChange, onTagsChange }: SkillDetailProps) {
  const [content, setContent] = useState(skill.content || '');
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [tags, setTags] = useState<string[]>(skill.tags || []);

  useEffect(() => {
    setContent(skill.content || '');
    setHasChanges(false);
    setShowCategoryDropdown(false);
    setIsEditing(false);
    setTags(skill.tags || []);
    setShowTagInput(false);
    setNewTag('');
  }, [skill]);

  const handleSave = () => {
    onSave(skill, content);
    setHasChanges(false);
    setIsEditing(false);
  };

  const handleCategoryChange = (newCategory: string) => {
    if (onCategoryChange && newCategory !== skill.category) onCategoryChange(skill, newCategory);
    setShowCategoryDropdown(false);
  };

  const getCategoryIcon = (categoryName: string) => {
    const cat = categories.find(c => c.name === categoryName || c.id === categoryName.toLowerCase());
    const IconComponent = cat?.icon || categoryIcons.other;
    return <IconComponent className="w-3 h-3" />;
  };

  const handleOpenPath = async () => {
    await window.electronAPI.openPath(skill.path);
  };

  const handleAddTag = () => {
    const trimmedTag = newTag.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      const newTags = [...tags, trimmedTag];
      setTags(newTags);
      if (onTagsChange) onTagsChange(skill, newTags);
    }
    setNewTag('');
    setShowTagInput(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter(t => t !== tagToRemove);
    setTags(newTags);
    if (onTagsChange) onTagsChange(skill, newTags);
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    } else if (e.key === 'Escape') {
      setShowTagInput(false);
      setNewTag('');
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Fixed Header */}
      <div className="relative px-6 py-4 border-b flex-shrink-0" style={{ borderColor: colors.border + '60' }}>
        {/* Blur fade background */}
        <div 
          className="absolute inset-0 -bottom-4 h-10 pointer-events-none"
          style={{
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            backgroundColor: colors.bg + 'DD',
            WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
            maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
          }}
        />
        
        <div className="relative flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
            style={{ color: colors.muted }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-center gap-2">
            {hasChanges && (
              <span className="px-2 py-1 rounded-md text-xs" style={{ backgroundColor: colors.accent + '20', color: colors.accent }}>
                Unsaved changes
              </span>
            )}
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors"
              style={{ backgroundColor: isEditing ? colors.primary : colors.card, color: isEditing ? '#fff' : colors.text }}
            >
              <Edit3 className="w-3.5 h-3.5" />
              {isEditing ? 'Preview' : 'Edit'}
            </button>
            {hasChanges && (
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ backgroundColor: colors.primary, color: '#fff' }}
              >
                <Check className="w-3.5 h-3.5" />
                Save
              </button>
            )}
            <button
              onClick={() => onDelete(skill)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors"
              style={{ backgroundColor: colors.card, color: '#EF4444' }}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Fixed Skill Info */}
      <div className="px-6 py-4 border-b flex-shrink-0" style={{ borderColor: colors.border + '40' }}>
        <div className="max-w-4xl mx-auto flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold flex-shrink-0"
            style={{ backgroundColor: colors.primary + '20', color: colors.primary }}>
            {skill.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-xl font-bold" style={{ color: colors.text }}>{skill.name}</h1>
              <span className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: colors.bg, color: colors.muted }}>
                v{skill.version}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Category Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className="flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors"
                  style={{ backgroundColor: colors.bg, color: colors.accent }}
                >
                  {getCategoryIcon(skill.category)} {skill.category}
                  <ChevronDown className="w-3 h-3" />
                </button>
                
                {showCategoryDropdown && (
                  <div className="absolute top-full left-0 mt-1 py-1 rounded-lg shadow-lg z-10 min-w-[140px]" style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}` }}>
                    {categories.map((cat) => {
                      const Icon = cat.icon;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => handleCategoryChange(cat.name)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors"
                          style={{ color: skill.category === cat.name ? colors.primary : colors.text }}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{cat.name}</span>
                          {skill.category === cat.name && (
                            <Check className="w-4 h-4 ml-auto" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              
              <span className="px-2 py-1 rounded text-xs" style={{ backgroundColor: colors.bg, color: colors.primary }}>
                {skill.source}
              </span>

              {/* Tags */}
              {tags.map((tag) => (
                <span 
                  key={tag} 
                  className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors group"
                  style={{ backgroundColor: colors.primary + '20', color: colors.primary }}
                >
                  <Tag className="w-3 h-3" />
                  #{tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3 hover:text-red-400" />
                  </button>
                </span>
              ))}

              {/* Add Tag Button */}
              {showTagInput ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder="tag name"
                    className="w-20 px-2 py-1 rounded text-xs outline-none"
                    style={{ 
                      backgroundColor: colors.bg, 
                      border: `1px solid ${colors.primary}`,
                      color: colors.text 
                    }}
                    autoFocus
                  />
                  <button
                    onClick={handleAddTag}
                    className="p-1 rounded transition-colors"
                    style={{ color: colors.accent }}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => { setShowTagInput(false); setNewTag(''); }}
                    className="p-1 rounded transition-colors"
                    style={{ color: colors.muted }}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowTagInput(true)}
                  className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors"
                  style={{ backgroundColor: colors.card, color: colors.muted, border: `1px dashed ${colors.border}` }}
                >
                  <Plus className="w-3 h-3" />
                  Add tag
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {skill.description && (
            <p className="mb-4" style={{ color: colors.muted }}>{skill.description}</p>
          )}

          {/* Path with Open Button */}
          <div className="p-3 rounded-lg font-mono text-sm mb-6 flex items-center gap-2" style={{ backgroundColor: colors.card, color: colors.muted }}>
            <FolderOpen className="w-4 h-4 flex-shrink-0" />
            <span className="truncate flex-1">{skill.path}</span>
            <button
              onClick={handleOpenPath}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors flex-shrink-0"
              style={{ backgroundColor: colors.bg, color: colors.primary }}
              title="Open in file manager"
            >
              <ExternalLink className="w-3 h-3" />
              Open
            </button>
          </div>

          {/* Content Card */}
          <div className="p-6 rounded-xl" style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}` }}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: colors.text }}>
              {isEditing ? 'Edit Content' : 'Instructions'}
            </h2>

            {isEditing ? (
              <textarea
                value={content}
                onChange={(e) => { setContent(e.target.value); setHasChanges(e.target.value !== skill.content); }}
                className="w-full h-96 p-4 rounded-lg font-mono text-sm resize-none outline-none border"
                style={{ backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }}
                placeholder="Enter skill content in Markdown..."
              />
            ) : (
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => <h1 className="text-2xl font-bold mb-4" style={{ color: colors.text }}>{children}</h1>,
                    h2: ({ children }) => <h2 className="text-xl font-semibold mb-3 mt-6" style={{ color: colors.text }}>{children}</h2>,
                    h3: ({ children }) => <h3 className="text-lg font-medium mb-2 mt-4" style={{ color: colors.text }}>{children}</h3>,
                    p: ({ children }) => <p className="mb-4 leading-relaxed" style={{ color: colors.muted }}>{children}</p>,
                    ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-1" style={{ color: colors.muted }}>{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-1" style={{ color: colors.muted }}>{children}</ol>,
                    code: ({ children, className }) => {
                      const isInline = !className;
                      return isInline ? (
                        <code className="px-1.5 py-0.5 rounded text-sm font-mono" style={{ backgroundColor: colors.bg, color: colors.primary }}>{children}</code>
                      ) : (
                        <code className="block p-4 rounded-lg font-mono text-sm overflow-x-auto" style={{ backgroundColor: colors.bg }}>{children}</code>
                      );
                    },
                    a: ({ href, children }) => (
                      <a href={href} className="underline" style={{ color: colors.primary }} target="_blank" rel="noopener noreferrer">{children}</a>
                    ),
                  }}
                >
                  {content || '*No content yet*'}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {showCategoryDropdown && <div className="fixed inset-0 z-0" onClick={() => setShowCategoryDropdown(false)} />}
    </div>
  );
}
