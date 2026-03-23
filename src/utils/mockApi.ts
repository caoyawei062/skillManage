// Mock API for browser development
// This file provides a fallback when running in the browser without Electron

const mockSkills = [
  {
    id: 'mock-1',
    name: 'coding-agent',
    description: 'Delegate complex coding tasks to Claude Code',
    version: '1.0.0',
    category: 'Development',
    tags: ['coding', 'agent'],
    tools: ['bash', 'edit', 'read'],
    path: '~/.config/alma/skills/coding-agent',
    content: '# Coding Agent\n\nUse Claude Code to delegate complex coding tasks.\n\n## Usage\n\nWhen users ask you to perform complex coding tasks...',
    source: 'global' as const,
  },
  {
    id: 'mock-2',
    name: 'skill-creator',
    description: 'Guide for creating effective skills',
    version: '1.2.0',
    category: 'Development',
    tags: ['skills', 'creation'],
    tools: ['write', 'edit'],
    path: '~/.config/alma/skills/skill-creator',
    content: '# Skill Creator\n\nCreate new skills to extend your capabilities.\n\n## Overview\n\nThis skill helps you create effective skills...',
    source: 'global' as const,
  },
  {
    id: 'mock-3',
    name: 'frontend-design',
    description: 'Create distinctive, production-grade frontend interfaces',
    version: '1.0.0',
    category: 'Design',
    tags: ['ui', 'frontend', 'design'],
    tools: ['write', 'preview'],
    path: '~/.config/alma/skills/frontend-design',
    content: '# Frontend Design\n\nCreate beautiful frontend interfaces.\n\n## Features\n\n- Landing pages\n- Dashboards\n- Components',
    source: 'global' as const,
  },
  {
    id: 'mock-4',
    name: 'pdf',
    description: 'Generate and parse PDF documents',
    version: '2.1.0',
    category: 'Documentation',
    tags: ['pdf', 'documents'],
    tools: ['write', 'read'],
    path: '~/.config/alma/skills/pdf',
    content: '# PDF Skill\n\nWork with PDF documents.\n\n## Features\n\n- Generate PDFs\n- Parse PDF content',
    source: 'global' as const,
  },
];

export const mockElectronAPI = {
  scanSkills: async (dirPath: string) => {
    // Simulate scanning - return mock skills for any path
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, skills: mockSkills };
  },
  readFile: async (filePath: string) => {
    const skill = mockSkills.find(s => filePath.includes(s.name));
    return { success: true, content: skill?.content || '' };
  },
  writeFile: async (filePath: string, content: string) => {
    console.log('Mock write:', filePath);
    await new Promise(resolve => setTimeout(resolve, 200));
    return { success: true };
  },
  selectDirectory: async () => {
    return { success: false, canceled: true };
  },
  openExternal: async (url: string) => {
    window.open(url, '_blank');
  },
  getHomeDir: async () => {
    return '/Users/demo';
  },
  pathExists: async (path: string) => {
    return true;
  },
  deleteDirectory: async (path: string) => {
    console.log('Mock delete:', path);
    return { success: true };
  },
  copyDirectory: async (src: string, dest: string) => {
    console.log('Mock copy:', src, '->', dest);
    return { success: true };
  },
  createDirectory: async (path: string) => {
    console.log('Mock create dir:', path);
    return { success: true };
  },
  listDirectory: async (path: string) => {
    return { 
      success: true, 
      entries: mockSkills.map(s => ({
        name: s.name,
        isDirectory: true,
        isFile: false,
      }))
    };
  },
  downloadGitHubRepo: async (repoUrl: string, destPath: string) => {
    console.log('Mock download:', repoUrl, '->', destPath);
    await new Promise(resolve => setTimeout(resolve, 2000));
    return { success: true };
  },
  searchSkillsSh: async (query: string, limit: number) => {
    console.log('Mock search:', query);
    await new Promise(resolve => setTimeout(resolve, 500));
    return { 
      success: true, 
      results: [
        {
          id: 'jeffallan/claude-skills/golang-pro',
          name: 'golang-pro',
          owner: 'jeffallan',
          repo: 'claude-skills',
          description: 'Advanced Go programming skills',
          installs: 1250,
        },
        {
          id: 'claude-code/skills/react',
          name: 'react',
          owner: 'claude-code',
          repo: 'skills',
          description: 'React development skills for Claude',
          installs: 890,
        },
      ]
    };
  },
  showSkillsSh: async (skillId: string) => {
    console.log('Mock show:', skillId);
    await new Promise(resolve => setTimeout(resolve, 300));
    return { 
      success: true, 
      details: {
        name: skillId.split('/').pop(),
        description: 'Skill description from skills.sh',
        installCommand: `npx skillsadd ${skillId}`,
      }
    };
  },
  installSkillsSh: async (skillId: string) => {
    console.log('Mock install:', skillId);
    await new Promise(resolve => setTimeout(resolve, 2000));
    return { success: true, installedTo: '/Users/demo/.config/alma/skills' };
  },
  checkSkillsSh: async () => {
    return { installed: false, viaNpx: true };
  },
  // Window controls
  windowMinimize: async () => {},
  windowMaximize: async () => {},
  windowClose: async () => {},
  windowIsMaximized: async () => false,
  // Config store
  storeGet: async (key: string) => {
    const mockConfig: Record<string, any> = { theme: 'classic', mode: 'dark', sources: [] };
    return key ? mockConfig[key] : mockConfig;
  },
  storeSet: async (key: string, value: any) => {
    console.log('Mock store set:', key, value);
    return true;
  },
  storeGetAll: async () => ({ theme: 'classic', mode: 'dark', sources: [] }),
  storeDelete: async (key: string) => true,
};

// Check if we're in Electron or browser
if (typeof window !== 'undefined' && !window.electronAPI) {
  (window as any).electronAPI = mockElectronAPI;
  console.log('Using mock Electron API for browser development');
}
