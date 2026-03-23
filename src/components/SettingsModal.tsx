import { useState } from 'react';
import { Theme, SkillSource, ColorMode, ThemeColors } from '../types';
import { X, Moon, Sun, Monitor, Pencil, Trash2, FolderPlus, Plus, Check, Palette, Sliders } from 'lucide-react';

interface SettingsModalProps {
  colors: {
    bg: string;
    card: string;
    border: string;
    primary: string;
    text: string;
    muted: string;
    accent: string;
  };
  themes: Theme[];
  theme: Theme;
  setTheme: (theme: Theme) => void;
  mode: ColorMode;
  setMode: (mode: ColorMode) => void;
  customThemes: Theme[];
  setCustomThemes: (themes: Theme[]) => void;
  onAddCustomTheme: (theme: Theme) => void;
  onUpdateCustomTheme: (theme: Theme) => void;
  onDeleteCustomTheme: (themeId: string) => void;
  sources: SkillSource[];
  setSources: (sources: SkillSource[]) => void;
  onClose: () => void;
  onAddSource: (type: 'global' | 'project') => void;
}

// 从 primary 颜色生成协调的调色板
function generatePaletteFromPrimary(primary: string, isDark: boolean): ThemeColors {
  // 简单的颜色工具函数
  const hexToHsl = (hex: string): [number, number, number] => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return [h * 360, s * 100, l * 100];
  };

  const hslToHex = (h: number, s: number, l: number): string => {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  const [h, s] = hexToHsl(primary);

  if (isDark) {
    return {
      bg: hslToHex(h, s * 0.3, 8),
      card: hslToHex(h, s * 0.3, 13),
      border: hslToHex(h, s * 0.4, 22),
      primary: primary,
      text: hslToHex(h, s * 0.15, 95),
      muted: hslToHex(h, s * 0.2, 60),
      accent: hslToHex(h, s * 0.5, 30),
    };
  } else {
    return {
      bg: hslToHex(h, s * 0.2, 98),
      card: '#FFFFFF',
      border: hslToHex(h, s * 0.3, 90),
      primary: primary,
      text: hslToHex(h, s * 0.4, 10),
      muted: hslToHex(h, s * 0.2, 45),
      accent: hslToHex(h, s * 0.4, 88),
    };
  }
}

// 预设的 primary 颜色
const primaryPresets = [
  '#EF4444', '#F97316', '#EAB308', '#22C55E', '#14B8A6', 
  '#3B82F6', '#8B5CF6', '#EC4899', '#6366F1', '#06B6D4',
  '#84CC16', '#F43F5E',
];

export default function SettingsModal({
  colors,
  themes,
  theme,
  setTheme,
  mode,
  setMode,
  customThemes,
  onAddCustomTheme,
  onUpdateCustomTheme,
  onDeleteCustomTheme,
  sources,
  setSources,
  onClose,
  onAddSource,
}: SettingsModalProps) {
  const [editingSourceId, setEditingSourceId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [showCustomEditor, setShowCustomEditor] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customPrimary, setCustomPrimary] = useState('#3B82F6');
  const [editingThemeId, setEditingThemeId] = useState<string | null>(null);

  const defaultThemes = themes.filter(t => !t.isCustom);
  const effectiveMode = mode === 'system' ? 'dark' : mode;

  // 生成预览调色板
  const previewDark = generatePaletteFromPrimary(customPrimary, true);
  const previewLight = generatePaletteFromPrimary(customPrimary, false);

  const toggleSource = (index: number) => {
    setSources(sources.map((s, i) => 
      i === index ? { ...s, enabled: !s.enabled } : s
    ));
  };

  const removeSource = (index: number) => {
    setSources(sources.filter((_, i) => i !== index));
  };

  const startEditingName = (source: SkillSource) => {
    setEditingSourceId(source.id);
    setEditingName(source.name);
  };

  const saveName = (index: number) => {
    if (editingName.trim()) {
      setSources(sources.map((s, i) => 
        i === index ? { ...s, name: editingName.trim() } : s
      ));
    }
    setEditingSourceId(null);
    setEditingName('');
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter') saveName(index);
    else if (e.key === 'Escape') { setEditingSourceId(null); setEditingName(''); }
  };

  const handleOpenCustomEditor = (themeToEdit?: Theme) => {
    if (themeToEdit) {
      setCustomName(themeToEdit.name);
      setCustomPrimary(themeToEdit.dark.primary);
      setEditingThemeId(themeToEdit.id);
    } else {
      setCustomName('My Theme');
      setCustomPrimary('#3B82F6');
      setEditingThemeId(null);
    }
    setShowCustomEditor(true);
  };

  const handleSaveCustomTheme = () => {
    if (!customName.trim()) return;
    
    const newTheme: Theme = {
      id: editingThemeId || `custom-${Date.now()}`,
      name: customName.trim(),
      isCustom: true,
      dark: generatePaletteFromPrimary(customPrimary, true),
      light: generatePaletteFromPrimary(customPrimary, false),
    };
    
    if (editingThemeId) {
      onUpdateCustomTheme(newTheme);
    } else {
      onAddCustomTheme(newTheme);
    }
    
    setTheme(newTheme);
    setShowCustomEditor(false);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="absolute inset-0"
        style={{
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }}
      />
      
      <div 
        className="relative w-full max-w-lg rounded-2xl overflow-hidden flex flex-col max-h-[90vh]"
        style={{ 
          backgroundColor: colors.bg,
          border: `1px solid ${colors.border}`,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 固定头部 */}
        <div 
          className="relative px-6 py-4 border-b flex-shrink-0"
          style={{ borderColor: colors.border + '60' }}
        >
          <div 
            className="absolute inset-0 -bottom-4 h-10 pointer-events-none"
            style={{
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              backgroundColor: colors.bg + 'CC',
              WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
              maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
            }}
          />
          <div className="relative flex items-center justify-between">
            <h2 className="text-xl font-semibold" style={{ color: colors.text }}>Settings</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{ color: colors.muted, backgroundColor: colors.card + '80' }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 滚动内容区 */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Appearance */}
          <section className="mb-8">
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: colors.muted }}>Appearance</h3>
            
            {/* Theme Grid */}
            <div className="mb-4">
              <div className="grid grid-cols-4 gap-2">
                {defaultThemes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t)}
                    className="p-2 rounded-lg text-left transition-all relative group"
                    style={{
                      backgroundColor: theme.id === t.id ? colors.primary + '20' : colors.card,
                      borderWidth: 2,
                      borderColor: theme.id === t.id ? colors.primary : 'transparent',
                    }}
                  >
                    <div className="w-full h-6 rounded mb-1.5 flex items-center gap-0.5 p-0.5" style={{ backgroundColor: t[effectiveMode].bg }}>
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t[effectiveMode].card }} />
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t[effectiveMode].primary }} />
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t[effectiveMode].accent }} />
                    </div>
                    <span className="text-xs font-medium truncate block" style={{ color: colors.text }}>{t.name}</span>
                  </button>
                ))}
                
                {customThemes.map((t) => (
                  <div key={t.id} className="relative group">
                    <button
                      onClick={() => setTheme(t)}
                      className="w-full p-2 rounded-lg text-left transition-all"
                      style={{
                        backgroundColor: theme.id === t.id ? colors.primary + '20' : colors.card,
                        borderWidth: 2,
                        borderColor: theme.id === t.id ? colors.primary : 'transparent',
                      }}
                    >
                      <div className="w-full h-6 rounded mb-1.5 flex items-center gap-0.5 p-0.5" style={{ backgroundColor: t[effectiveMode].bg }}>
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t[effectiveMode].card }} />
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t[effectiveMode].primary }} />
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t[effectiveMode].accent }} />
                      </div>
                      <span className="text-xs font-medium truncate block" style={{ color: colors.text }}>{t.name}</span>
                    </button>
                    <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleOpenCustomEditor(t); }}
                        className="w-4 h-4 rounded flex items-center justify-center"
                        style={{ backgroundColor: colors.muted }}
                      >
                        <Sliders className="w-2.5 h-2.5 text-white" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onDeleteCustomTheme(t.id); }}
                        className="w-4 h-4 rounded flex items-center justify-center"
                        style={{ backgroundColor: '#EF4444' }}
                      >
                        <X className="w-2.5 h-2.5 text-white" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add Custom Theme Button */}
                <button
                  onClick={() => handleOpenCustomEditor()}
                  className="p-2 rounded-lg text-left transition-all flex flex-col items-center justify-center gap-1 h-[62px]"
                  style={{
                    backgroundColor: colors.card,
                    borderWidth: 2,
                    borderColor: colors.border,
                    borderStyle: 'dashed',
                  }}
                >
                  <Plus className="w-5 h-5" style={{ color: colors.muted }} />
                  <span className="text-xs" style={{ color: colors.muted }}>Custom</span>
                </button>
              </div>
            </div>

            {/* Mode */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>Mode</label>
              <div className="flex gap-2">
                {([
                  { value: 'dark', icon: Moon, label: 'Dark' },
                  { value: 'light', icon: Sun, label: 'Light' },
                  { value: 'system', icon: Monitor, label: 'System' },
                ] as const).map(({ value, icon: Icon, label }) => (
                  <button
                    key={value}
                    onClick={() => setMode(value)}
                    className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl transition-colors"
                    style={{ 
                      backgroundColor: mode === value ? colors.primary : colors.card, 
                      color: mode === value ? '#fff' : colors.text 
                    }}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Custom Theme Editor */}
          {showCustomEditor && (
            <section className="mb-8 p-4 rounded-xl" style={{ backgroundColor: colors.card }}>
              <div className="flex items-center gap-2 mb-4">
                <Palette className="w-4 h-4" style={{ color: colors.primary }} />
                <h3 className="text-sm font-semibold" style={{ color: colors.text }}>
                  {editingThemeId ? 'Edit Custom Theme' : 'Create Custom Theme'}
                </h3>
              </div>
              
              {/* Theme Name */}
              <div className="mb-4">
                <label className="block text-xs font-medium mb-2" style={{ color: colors.muted }}>Theme Name</label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="My Theme"
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ 
                    backgroundColor: colors.bg, 
                    color: colors.text, 
                    border: `1px solid ${colors.border}` 
                  }}
                  autoFocus
                />
              </div>

              {/* Primary Color */}
              <div className="mb-4">
                <label className="block text-xs font-medium mb-2" style={{ color: colors.muted }}>
                  Primary Color <span className="text-[10px] opacity-60">(other colors auto-generate)</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={customPrimary}
                    onChange={(e) => setCustomPrimary(e.target.value)}
                    className="w-12 h-12 rounded-lg cursor-pointer"
                    style={{ border: 'none', padding: 0 }}
                  />
                  <input
                    type="text"
                    value={customPrimary}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                        setCustomPrimary(val);
                      }
                    }}
                    className="flex-1 px-3 py-2 rounded-lg text-sm font-mono outline-none"
                    style={{ 
                      backgroundColor: colors.bg, 
                      color: colors.text, 
                      border: `1px solid ${colors.border}` 
                    }}
                  />
                </div>
              </div>

              {/* Quick Presets */}
              <div className="mb-4">
                <label className="block text-xs font-medium mb-2" style={{ color: colors.muted }}>Quick Select</label>
                <div className="flex flex-wrap gap-2">
                  {primaryPresets.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCustomPrimary(c)}
                      className="w-8 h-8 rounded-lg transition-transform hover:scale-110"
                      style={{ 
                        backgroundColor: c,
                        boxShadow: customPrimary === c ? `0 0 0 2px ${colors.bg}, 0 0 0 4px ${c}` : 'none',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="mb-4">
                <label className="block text-xs font-medium mb-2" style={{ color: colors.muted }}>Preview</label>
                <div className="grid grid-cols-2 gap-3">
                  {/* Dark Mode Preview */}
                  <div className="p-3 rounded-lg" style={{ backgroundColor: previewDark.bg }}>
                    <div className="flex items-center gap-1 mb-2">
                      <Moon className="w-3 h-3" style={{ color: previewDark.muted }} />
                      <span className="text-[10px]" style={{ color: previewDark.muted }}>Dark</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: previewDark.primary }} />
                        <div className="text-[10px]" style={{ color: previewDark.text }}>Primary</div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: previewDark.card }} />
                        <div className="text-[10px]" style={{ color: previewDark.text }}>Card</div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: previewDark.accent }} />
                        <div className="text-[10px]" style={{ color: previewDark.text }}>Accent</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Light Mode Preview */}
                  <div className="p-3 rounded-lg" style={{ backgroundColor: previewLight.bg }}>
                    <div className="flex items-center gap-1 mb-2">
                      <Sun className="w-3 h-3" style={{ color: previewLight.muted }} />
                      <span className="text-[10px]" style={{ color: previewLight.muted }}>Light</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: previewLight.primary }} />
                        <div className="text-[10px]" style={{ color: previewLight.text }}>Primary</div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: previewLight.card }} />
                        <div className="text-[10px]" style={{ color: previewLight.text }}>Card</div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: previewLight.accent }} />
                        <div className="text-[10px]" style={{ color: previewLight.text }}>Accent</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCustomEditor(false)}
                  className="flex-1 py-2 rounded-lg text-sm"
                  style={{ backgroundColor: colors.border, color: colors.text }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCustomTheme}
                  disabled={!customName.trim()}
                  className="flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ backgroundColor: colors.primary, color: '#fff' }}
                >
                  <Check className="w-4 h-4" />
                  {editingThemeId ? 'Update' : 'Create'}
                </button>
              </div>
            </section>
          )}

          {/* Sources */}
          <section className="mb-8">
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: colors.muted }}>Skill Sources</h3>
            <div className="space-y-2 mb-4">
              {sources.map((source, index) => (
                <div key={source.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: colors.card }}>
                  <button
                    onClick={() => toggleSource(index)}
                    className="w-10 h-6 rounded-full relative flex-shrink-0"
                    style={{ backgroundColor: source.enabled ? colors.primary : colors.border }}
                  >
                    <div className="absolute top-1 w-4 h-4 rounded-full bg-white transition-transform" style={{ left: source.enabled ? '20px' : '4px' }} />
                  </button>
                  <div className="flex-1 min-w-0">
                    {editingSourceId === source.id ? (
                      <input
                        type="text" value={editingName} onChange={(e) => setEditingName(e.target.value)}
                        onBlur={() => saveName(index)} onKeyDown={(e) => handleKeyDown(e, index)}
                        className="w-full px-2 py-1 rounded-lg text-sm font-medium outline-none border"
                        style={{ backgroundColor: colors.bg, borderColor: colors.primary, color: colors.text }}
                        autoFocus
                      />
                    ) : (
                      <div className="flex items-center gap-2 text-sm font-medium cursor-pointer" style={{ color: colors.text }} onClick={() => startEditingName(source)}>
                        {source.name}
                        <Pencil className="w-3 h-3 opacity-40" />
                      </div>
                    )}
                    <div className="text-xs truncate" style={{ color: colors.muted }} title={source.path}>{source.path}</div>
                  </div>
                  {source.type !== 'global' && (
                    <button onClick={() => removeSource(index)} className="p-2 rounded-lg flex-shrink-0 transition-colors hover:text-red-500" style={{ color: colors.muted }}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={() => onAddSource('project')}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl text-sm transition-colors"
              style={{ backgroundColor: colors.card, color: colors.muted, border: `1px solid ${colors.border}` }}
            >
              <FolderPlus className="w-4 h-4" />
              Add Project Path
            </button>
          </section>

          {/* About */}
          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: colors.muted }}>About</h3>
            <div className="p-4 rounded-xl" style={{ backgroundColor: colors.card }}>
              <div className="text-sm font-medium" style={{ color: colors.text }}>Skill Manager v1.0.0</div>
              <div className="text-xs mt-1" style={{ color: colors.muted }}>Manage your Alma skills with ease</div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
