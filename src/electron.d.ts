export interface ElectronAPI {
  scanSkills: (dirPath: string) => Promise<{ success: boolean; skills?: any[]; error?: string }>;
  readFile: (filePath: string) => Promise<{ success: boolean; content?: string; error?: string }>;
  writeFile: (filePath: string, content: string) => Promise<{ success: boolean; error?: string }>;
  selectDirectory: () => Promise<{ success: boolean; path?: string; canceled?: boolean }>;
  openExternal: (url: string) => Promise<void>;
  openPath: (path: string) => Promise<{ success: boolean; error?: string }>;
  getHomeDir: () => Promise<string>;
  pathExists: (path: string) => Promise<boolean>;
  deleteDirectory: (path: string) => Promise<{ success: boolean; error?: string }>;
  copyDirectory: (src: string, dest: string) => Promise<{ success: boolean; error?: string }>;
  createDirectory: (path: string) => Promise<{ success: boolean; error?: string }>;
  listDirectory: (path: string) => Promise<{ success: boolean; entries?: { name: string; isDirectory: boolean; isFile: boolean }[]; error?: string }>;
  downloadGitHubRepo: (repoUrl: string, destPath: string) => Promise<{ success: boolean; error?: string }>;
  searchSkillsSh: (query: string, limit?: number) => Promise<{ success: boolean; results?: any[]; error?: string; needsInstall?: boolean }>;
  showSkillsSh: (skillId: string) => Promise<{ success: boolean; details?: any; error?: string }>;
  installSkillsSh: (skillId: string) => Promise<{ success: boolean; installedTo?: string; error?: string }>;
  checkSkillsSh: () => Promise<{ installed: boolean; viaNpx?: boolean }>;
  // Window controls
  windowMinimize: () => Promise<void>;
  windowMaximize: () => Promise<void>;
  windowClose: () => Promise<void>;
  windowIsMaximized: () => Promise<boolean>;
  // Config store
  storeGet: (key: string) => Promise<any>;
  storeSet: (key: string, value: any) => Promise<boolean>;
  storeGetAll: () => Promise<any>;
  storeDelete: (key: string) => Promise<boolean>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
