import { useState, useCallback, useEffect } from 'react';
import { Skill } from '../types';
import { categories } from '../themes';
import { X, FolderOpen, Plus, Search, Loader2 } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface Category { id: string; name: string; icon: LucideIcon; }
interface SearchResult {
  id: string; name: string; owner: string; repo: string;
  description: string; installs: number; url?: string;
}

interface AddSkillModalProps {
  colors: { bg: string; card: string; border: string; primary: string; text: string; muted: string; accent: string; };
  categories: Category[];
  onClose: () => void;
  onAdd: (skill: Skill) => void;
  onRefresh?: () => void;
}

export default function AddSkillModal({ colors, categories, onClose, onAdd, onRefresh }: AddSkillModalProps) {
  const [mode, setMode] = useState<'path' | 'create' | 'search'>('path');
  const [skillPath, setSkillPath] = useState('');
  const [skillName, setSkillName] = useState('');
  const [skillDesc, setSkillDesc] = useState('');
  const [skillCategory, setSkillCategory] = useState('Other');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [installingRepo, setInstallingRepo] = useState<string | null>(null);
  const [skillsShInstalled, setSkillsShInstalled] = useState<boolean | null>(null);

  useEffect(() => { window.electronAPI?.checkSkillsSh().then(r => setSkillsShInstalled(r.installed)); }, []);

  const handleBrowse = async () => {
    const result = await window.electronAPI?.selectDirectory();
    if (result?.success && result.path) { setSkillPath(result.path); }
  };

  const handleAddFromPath = async () => {
    if (!skillPath) return;
    setIsLoading(true);
    const result = await window.electronAPI?.scanSkills(skillPath);
    if (result?.success && result.skills?.length) onAdd({ ...result.skills[0], id: skillPath, source: 'project' });
    else onAdd({ id: skillPath, name: skillPath.split('/').pop() || 'skill', description: skillDesc, version: '1.0.0', category: skillCategory, tags: [], tools: [], path: skillPath, content: `# ${skillName}\n\n${skillDesc}`, source: 'project' });
    setIsLoading(false);
  };

  const handleCreate = async () => {
    if (!skillName.trim()) return;
    setIsLoading(true);
    const homeDir = await window.electronAPI?.getHomeDir() || '';
    const newPath = `${homeDir}/.config/alma/skills/${skillName.toLowerCase().replace(/\s+/g, '-')}`;
    await window.electronAPI?.createDirectory(newPath);
    await window.electronAPI?.writeFile(`${newPath}/SKILL.md`, `# ${skillName}\n\n${skillDesc || 'Add your skill description here...'}`);
    onAdd({ id: newPath, name: skillName, description: skillDesc, version: '1.0.0', category: skillCategory, tags: [], tools: [], path: newPath, content: '', source: 'global' });
    setIsLoading(false);
  };

  const searchSkills = useCallback(async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchResults([]);
    try {
      const result = await window.electronAPI?.searchSkillsSh(searchQuery, 20);
      if (result?.success && result.results) {
        setSearchResults(result.results.map((r: any) => ({ id: r.id, name: r.name, owner: r.owner, repo: r.repo, description: r.description || '', installs: r.installs || 0 })));
      } else {
        const res = await fetch(`https://api.github.com/search/repositories?q=skill+${encodeURIComponent(searchQuery)}&sort=stars&per_page=10`);
        if (res.ok) { const data = await res.json(); setSearchResults(data.items.map((r: any) => ({ id: r.full_name, name: r.name, owner: r.owner.login, repo: r.name, description: r.description || '', installs: r.stargazers_count }))); }
      }
    } catch { console.error('Search failed'); }
    setIsSearching(false);
  }, [searchQuery]);

  const installSkill = async (repo: SearchResult) => {
    setInstallingRepo(repo.id);
    const result = await window.electronAPI?.installSkillsSh(repo.id);
    if (result?.success) {
      onAdd({ id: repo.id, name: repo.name, description: repo.description, version: '1.0.0', category: 'Other', tags: ['skills-sh'], tools: [], path: result.installedTo || '', content: `# ${repo.name}\n\n${repo.description}`, source: 'global' });
      alert(`Installed "${repo.name}"!`);
      if (onRefresh) onRefresh();
    } else alert(`Failed: ${result?.error}`);
    setInstallingRepo(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* 模糊背景 */}
      <div className="absolute inset-0" style={{ backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', backgroundColor: 'rgba(0,0,0,0.5)' }} />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col max-h-[90vh]"
        style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}`, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
        onClick={(e) => e.stopPropagation()}>
        
        {/* 固定头部 - 带羽化 */}
        <div className="relative px-6 py-4 border-b flex-shrink-0" style={{ borderColor: colors.border + '60' }}>
          <div className="absolute inset-0 -bottom-4 h-10 pointer-events-none" style={{ backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', backgroundColor: colors.bg + 'CC', WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)', maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)' }} />
          <div className="relative flex items-center justify-between">
            <h2 className="text-xl font-semibold" style={{ color: colors.text }}>Add Skill</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: colors.card + '80', color: colors.muted }}>
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 滚动内容 */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Tabs */}
          <div className="flex rounded-xl p-1 mb-6" style={{ backgroundColor: colors.card }}>
            {(['path', 'search', 'create'] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)} className="flex-1 p-2 rounded-lg text-sm font-medium transition-colors"
                style={{ backgroundColor: mode === m ? colors.primary : 'transparent', color: mode === m ? '#fff' : colors.text }}>
                {m === 'path' ? 'From Path' : m === 'search' ? 'Search Online' : 'Create New'}
              </button>
            ))}
          </div>

          {/* Path Mode */}
          {mode === 'path' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>Skill Path</label>
                <div className="flex gap-2">
                  <input type="text" value={skillPath} onChange={(e) => setSkillPath(e.target.value)} placeholder="Select or enter path..."
                    className="flex-1 px-4 py-2 rounded-xl text-sm border outline-none" style={{ backgroundColor: colors.card, borderColor: colors.border, color: colors.text }} />
                  <button onClick={handleBrowse} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium" style={{ backgroundColor: colors.card, color: colors.text }}>
                    <FolderOpen className="w-4 h-4" />
                    Browse
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>Category</label>
                <select value={skillCategory} onChange={(e) => setSkillCategory(e.target.value)} className="w-full px-4 py-2 rounded-xl text-sm border outline-none"
                  style={{ backgroundColor: colors.card, borderColor: colors.border, color: colors.text }}>
                  {categories.map((c) => {
                    const Icon = c.icon;
                    return <option key={c.id} value={c.name}><Icon className="w-4 h-4 inline mr-1" />{c.name}</option>;
                  })}
                </select>
              </div>
            </div>
          )}

          {/* Search Mode */}
          {mode === 'search' && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium" style={{ color: colors.text }}>Search Skills.sh</label>
                  {skillsShInstalled === false && <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: colors.accent + '20', color: colors.accent }}>GitHub fallback</span>}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && searchSkills()}
                    placeholder="e.g., golang, react..." className="flex-1 px-4 py-2 rounded-xl text-sm border outline-none" style={{ backgroundColor: colors.card, borderColor: colors.border, color: colors.text }} />
                  <button onClick={searchSkills} disabled={isSearching} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50"
                    style={{ backgroundColor: colors.primary, color: '#fff' }}>
                    {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    Search
                  </button>
                </div>
              </div>
              {searchResults.length > 0 && (
                <div className="space-y-2">
                  {searchResults.map((repo) => (
                    <div key={repo.id} className="p-3 rounded-xl" style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}` }}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm truncate" style={{ color: colors.text }}>{repo.name}</h4>
                            {repo.installs > 0 && <span className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: colors.bg, color: colors.accent }}>{repo.installs.toLocaleString()}</span>}
                          </div>
                          <p className="text-xs truncate" style={{ color: colors.muted }}>{repo.owner}/{repo.repo}</p>
                          <p className="text-xs line-clamp-2 mt-1" style={{ color: colors.muted }}>{repo.description}</p>
                        </div>
                        <button onClick={() => installSkill(repo)} disabled={installingRepo === repo.id}
                          className="px-3 py-1.5 rounded-xl text-sm font-medium flex-shrink-0 disabled:opacity-50" style={{ backgroundColor: colors.primary, color: '#fff' }}>
                          {installingRepo === repo.id ? '...' : 'Install'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {!searchResults.length && !isSearching && (
                <div className="text-center py-8" style={{ color: colors.muted }}>
                  <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Search for skills</p>
                </div>
              )}
            </div>
          )}

          {/* Create Mode */}
          {mode === 'create' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>Name</label>
                <input type="text" value={skillName} onChange={(e) => setSkillName(e.target.value)} placeholder="my-awesome-skill"
                  className="w-full px-4 py-2 rounded-xl text-sm border outline-none" style={{ backgroundColor: colors.card, borderColor: colors.border, color: colors.text }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>Description</label>
                <textarea value={skillDesc} onChange={(e) => setSkillDesc(e.target.value)} placeholder="What does this skill do?" rows={3}
                  className="w-full px-4 py-2 rounded-xl text-sm border outline-none resize-none" style={{ backgroundColor: colors.card, borderColor: colors.border, color: colors.text }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>Category</label>
                <select value={skillCategory} onChange={(e) => setSkillCategory(e.target.value)} className="w-full px-4 py-2 rounded-xl text-sm border outline-none"
                  style={{ backgroundColor: colors.card, borderColor: colors.border, color: colors.text }}>
                  {categories.map((c) => {
                    const Icon = c.icon;
                    return <option key={c.id} value={c.name}><Icon className="w-4 h-4 inline mr-1" />{c.name}</option>;
                  })}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* 固定底部 */}
        {mode !== 'search' && (
          <div className="px-6 py-4 border-t flex-shrink-0" style={{ borderColor: colors.border + '60' }}>
            {/* 羽化顶部 */}
            <div className="absolute -top-4 h-8 -mt-8 w-full pointer-events-none" style={{ backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', backgroundColor: colors.bg + 'CC', WebkitMaskImage: 'linear-gradient(to top, black 40%, transparent 100%)', maskImage: 'linear-gradient(to top, black 40%, transparent 100%)' }} />
            <div className="flex gap-3 relative">
              <button onClick={onClose} className="flex-1 p-3 rounded-xl text-sm font-medium" style={{ backgroundColor: colors.card, color: colors.text }}>Cancel</button>
              <button onClick={mode === 'path' ? handleAddFromPath : handleCreate} disabled={isLoading || (mode === 'create' && !skillName.trim())}
                className="flex items-center gap-2 flex-1 p-3 rounded-xl text-sm font-medium disabled:opacity-50" style={{ backgroundColor: colors.primary, color: '#fff' }}>
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isLoading ? 'Adding...' : <><Plus className="w-4 h-4" /> Add Skill</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
