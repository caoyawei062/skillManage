import { useState, useEffect, useCallback } from 'react';
import { Skill, ViewMode, SkillSource, ColorMode, Theme } from './types';
import { themes as defaultThemes, categories } from './themes';

// Helper: check if skill matches selected filters
const categoryIdMatches = (skillCategory: string | undefined, selectedId: string | null): boolean => {
  if (!selectedId) return true;
  if (!skillCategory) return false;
  const normalizedSkillCat = skillCategory.toLowerCase();
  const cat = categories.find(c => c.id === selectedId);
  return normalizedSkillCat === selectedId.toLowerCase() || 
         normalizedSkillCat === cat?.name.toLowerCase();
};

import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import SkillGrid from './components/SkillGrid';
import SkillDetail from './components/SkillDetail';
import SettingsModal from './components/SettingsModal';
import AddSkillModal from './components/AddSkillModal';

function App() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [sources, setSources] = useState<SkillSource[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [theme, setTheme] = useState<Theme>(defaultThemes[0]);
  const [mode, setMode] = useState<ColorMode>('dark');
  const [customThemes, setCustomThemes] = useState<Theme[]>([]);
  const [systemDark, setSystemDark] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddSkill, setShowAddSkill] = useState(false);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemDark(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Compute effective mode based on system or manual setting
  const effectiveMode = mode === 'system' 
    ? (systemDark ? 'dark' : 'light')
    : mode;
  
  const colors = effectiveMode === 'dark' ? theme.dark : theme.light;
  
  // All themes = default + custom
  const allThemes = [...defaultThemes, ...customThemes];

  // Load config and data on mount
  useEffect(() => {
    const loadData = async () => {
      console.log('Starting to load data...');
      setIsLoading(true);
      
      try {
        const homeDir = await window.electronAPI.getHomeDir();
        
        // Load saved config - get all at once
        let savedConfig: any = {};
        try {
          savedConfig = await window.electronAPI.storeGetAll() || {};
          console.log('Loaded config:', savedConfig);
        } catch (e) {
          console.error('Error loading config:', e);
        }
        
        const savedThemeRef = savedConfig.theme;
        const savedMode = savedConfig.mode as ColorMode | undefined;
        const savedSources = savedConfig.sources as SkillSource[] | undefined;
        const savedCustomThemes = (savedConfig.customThemes || []) as Theme[];
        
        // Restore custom themes first
        if (Array.isArray(savedCustomThemes) && savedCustomThemes.length > 0) {
          setCustomThemes(savedCustomThemes);
        }
        
        // Restore theme - check if it's a full theme object or just an ID
        if (savedThemeRef) {
          if (typeof savedThemeRef === 'object' && savedThemeRef.dark && savedThemeRef.light) {
            // Full theme object (custom theme)
            setTheme(savedThemeRef as Theme);
          } else if (typeof savedThemeRef === 'string') {
            // Just an ID, find in custom themes first, then default themes
            const foundCustom = savedCustomThemes.find((t: Theme) => t.id === savedThemeRef);
            if (foundCustom) {
              setTheme(foundCustom);
            } else {
              const found = defaultThemes.find(t => t.id === savedThemeRef);
              if (found) setTheme(found);
            }
          }
        }
        
        // Restore mode
        if (savedMode && ['dark', 'light', 'system'].includes(savedMode)) {
          setMode(savedMode);
        }
        
        // Default or saved sources
        const sourcesToUse: SkillSource[] = Array.isArray(savedSources) && savedSources.length > 0 ? savedSources : [
          {
            id: 'global-default',
            name: 'Global',
            path: `${homeDir}/.config/alma/skills`,
            type: 'global',
            enabled: true,
          },
        ];
        
        setSources(sourcesToUse);
        
        // Scan skills from all enabled sources
        const allSkills: Skill[] = [];
        
        for (const source of sourcesToUse) {
          if (source.enabled) {
            try {
              const result = await window.electronAPI.scanSkills(source.path);
              if (result.success && result.skills) {
                const mappedSkills = result.skills.map((s: any) => ({
                  ...s,
                  id: s.path,
                  source: source.type,
                  sourceId: source.id,
                }));
                allSkills.push(...mappedSkills);
              }
            } catch (e) {
              console.error('Error scanning source:', source.path, e);
            }
          }
        }
        
        setSkills(allSkills);
        
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Save theme when changed (save full theme object for custom, just id for default)
  useEffect(() => {
    // For custom themes, save the full object; for default themes, just save the id
    if (theme.isCustom) {
      window.electronAPI.storeSet('theme', theme);
    } else {
      window.electronAPI.storeSet('theme', theme.id);
    }
  }, [theme]);

  // Save mode when changed
  useEffect(() => {
    window.electronAPI.storeSet('mode', mode);
  }, [mode]);

  // Save custom themes
  useEffect(() => {
    window.electronAPI.storeSet('customThemes', customThemes);
  }, [customThemes]);

  // Save sources when changed
  useEffect(() => {
    window.electronAPI.storeSet('sources', sources);
  }, [sources]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.style.setProperty('--bg', colors.bg);
    document.documentElement.style.setProperty('--card', colors.card);
    document.documentElement.style.setProperty('--border', colors.border);
    document.documentElement.style.setProperty('--primary', colors.primary);
    document.documentElement.style.setProperty('--text', colors.text);
    document.documentElement.style.setProperty('--muted', colors.muted);
    document.documentElement.style.setProperty('--accent', colors.accent);
  }, [colors]);

  // Filter skills
  const filteredSkills = skills.filter((skill) => {
    const matchesSearch = searchQuery === '' || 
      skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryIdMatches(skill.category, selectedCategory);
    
    const matchesTag = !selectedTag || 
      skill.tags?.includes(selectedTag);
    
    const matchesSource = !selectedSource || 
      skill.sourceId === selectedSource;
    
    return matchesSearch && matchesCategory && matchesTag && matchesSource;
  });

  const allTags = [...new Set(skills.flatMap(s => s.tags || []))];

  const addSource = useCallback(async (type: 'global' | 'project') => {
    const result = await window.electronAPI.selectDirectory();
    if (result.success && result.path) {
      const pathName = result.path.split('/').pop() || 'New Source';
      const sourceId = `source-${Date.now()}`;
      const newSource: SkillSource = {
        id: sourceId,
        name: pathName,
        path: result.path,
        type,
        enabled: true,
      };
      
      setSources(prev => [...prev, newSource]);
      
      const scanResult = await window.electronAPI.scanSkills(result.path);
      if (scanResult.success && scanResult.skills) {
        const newSkills = scanResult.skills.map((s: any) => ({
          ...s,
          id: s.path,
          sourceId: sourceId,
          source: type,
        }));
        setSkills(prev => [...prev, ...newSkills]);
      }
    }
  }, []);

  const deleteSkill = useCallback(async (skill: Skill) => {
    if (confirm(`Delete skill "${skill.name}"?`)) {
      const result = await window.electronAPI.deleteDirectory(skill.path);
      if (result.success) {
        setSkills(prev => prev.filter(s => s.path !== skill.path));
        if (selectedSkill?.path === skill.path) {
          setSelectedSkill(null);
        }
      }
    }
  }, [selectedSkill]);

  const saveSkill = useCallback(async (skill: Skill, content: string) => {
    const skillMdPath = `${skill.path}/SKILL.md`;
    const result = await window.electronAPI.writeFile(skillMdPath, content);
    if (result.success) {
      setSkills(prev => prev.map(s => 
        s.path === skill.path ? { ...s, content } : s
      ));
      if (selectedSkill?.path === skill.path) {
        setSelectedSkill(prev => prev ? { ...prev, content } : null);
      }
    }
  }, [selectedSkill]);

  const addCustomTheme = useCallback((newTheme: Theme) => {
    setCustomThemes(prev => [...prev, newTheme]);
  }, []);

  const updateCustomTheme = useCallback((updatedTheme: Theme) => {
    setCustomThemes(prev => prev.map(t => 
      t.id === updatedTheme.id ? updatedTheme : t
    ));
    if (theme.id === updatedTheme.id) {
      setTheme(updatedTheme);
    }
  }, [theme]);

  const deleteCustomTheme = useCallback((themeId: string) => {
    setCustomThemes(prev => prev.filter(t => t.id !== themeId));
    // If currently using this theme, switch to default
    if (theme.id === themeId) {
      setTheme(defaultThemes[0]);
    }
  }, [theme]);

  return (
    <div 
      className="h-full flex flex-col"
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      {/* Drag region for traffic lights on macOS */}
      <div 
        className="h-8 flex-shrink-0"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      />
      
      <TopBar
        colors={colors}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onAddSkill={() => setShowAddSkill(true)}
        onOpenSettings={() => setShowSettings(true)}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          colors={colors}
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          tags={allTags}
          selectedTag={selectedTag}
          setSelectedTag={setSelectedTag}
          sources={sources}
          selectedSource={selectedSource}
          setSelectedSource={setSelectedSource}
          skillsCount={filteredSkills.length}
          skills={skills}
          onAddSource={addSource}
        />
        
        <main className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div 
                  className="w-8 h-8 border-2 rounded-full animate-spin mx-auto mb-4"
                  style={{ borderColor: colors.border, borderTopColor: colors.primary }}
                />
                <p style={{ color: colors.muted }}>Loading skills...</p>
              </div>
            </div>
          ) : selectedSkill ? (
            <SkillDetail
              skill={selectedSkill}
              colors={colors}
              onBack={() => setSelectedSkill(null)}
              onSave={saveSkill}
              onDelete={deleteSkill}
              onCategoryChange={async (skill, newCategory) => {
                const updatedSkill = { ...skill, category: newCategory };
                setSkills(prev => prev.map(s => 
                  s.path === skill.path ? updatedSkill : s
                ));
                setSelectedSkill(updatedSkill);
              }}
              onTagsChange={async (skill, newTags) => {
                const updatedSkill = { ...skill, tags: newTags };
                setSkills(prev => prev.map(s => 
                  s.path === skill.path ? updatedSkill : s
                ));
                setSelectedSkill(updatedSkill);
                
                const skillMdPath = `${skill.path}/SKILL.md`;
                const readResult = await window.electronAPI.readFile(skillMdPath);
                if (readResult.success && readResult.content) {
                  let content = readResult.content;
                  if (content.startsWith('---')) {
                    const endIndex = content.indexOf('---', 3);
                    if (endIndex > 0) {
                      const frontmatter = content.slice(3, endIndex).trim();
                      const lines = frontmatter.split('\n');
                      let tagsLineIndex = lines.findIndex(l => l.trim().startsWith('tags:'));
                      
                      if (tagsLineIndex >= 0) {
                        lines[tagsLineIndex] = `tags: [${newTags.map(t => `"${t}"`).join(', ')}]`;
                      } else {
                        lines.splice(1, 0, `tags: [${newTags.map(t => `"${t}"`).join(', ')}]`);
                      }
                      
                      const newFrontmatter = lines.join('\n');
                      const newContent = `---\n${newFrontmatter}\n---\n${content.slice(endIndex + 3)}`;
                      await window.electronAPI.writeFile(skillMdPath, newContent);
                    }
                  }
                }
              }}
            />
          ) : (
            <SkillGrid
              skills={filteredSkills}
              colors={colors}
              viewMode={viewMode}
              sources={sources}
              onSelectSkill={setSelectedSkill}
              onDeleteSkill={deleteSkill}
            />
          )}
        </main>
      </div>

      {showSettings && (
        <SettingsModal
          colors={colors}
          themes={allThemes}
          theme={theme}
          setTheme={setTheme}
          mode={mode}
          setMode={setMode}
          customThemes={customThemes}
          setCustomThemes={setCustomThemes}
          onAddCustomTheme={addCustomTheme}
          onUpdateCustomTheme={updateCustomTheme}
          onDeleteCustomTheme={deleteCustomTheme}
          sources={sources}
          setSources={setSources}
          onClose={() => setShowSettings(false)}
          onAddSource={addSource}
        />
      )}

      {showAddSkill && (
        <AddSkillModal
          colors={colors}
          categories={categories}
          onClose={() => setShowAddSkill(false)}
          onAdd={async (newSkill) => {
            setSkills(prev => [...prev, newSkill]);
            setShowAddSkill(false);
          }}
        />
      )}
    </div>
  );
}

export default App;
