const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  scanSkills: (dirPath) => ipcRenderer.invoke('scan-skills', dirPath),
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  writeFile: (filePath, content) => ipcRenderer.invoke('write-file', filePath, content),
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  openPath: (targetPath) => ipcRenderer.invoke('open-path', targetPath),
  getHomeDir: () => ipcRenderer.invoke('get-home-dir'),
  pathExists: (path) => ipcRenderer.invoke('path-exists', path),
  deleteDirectory: (path) => ipcRenderer.invoke('delete-directory', path),
  copyDirectory: (src, dest) => ipcRenderer.invoke('copy-directory', src, dest),
  createDirectory: (path) => ipcRenderer.invoke('create-directory', path),
  listDirectory: (path) => ipcRenderer.invoke('list-directory', path),
  downloadGitHubRepo: (repoUrl, destPath) => ipcRenderer.invoke('download-git-repo', repoUrl, destPath),
  searchSkillsSh: (query, limit) => ipcRenderer.invoke('search-skills-sh', query, limit),
  showSkillsSh: (skillId) => ipcRenderer.invoke('show-skills-sh', skillId),
  installSkillsSh: (skillId) => ipcRenderer.invoke('install-skills-sh', skillId),
  checkSkillsSh: () => ipcRenderer.invoke('check-skills-sh'),
  // Window controls
  windowMinimize: () => ipcRenderer.invoke('window-minimize'),
  windowMaximize: () => ipcRenderer.invoke('window-maximize'),
  windowClose: () => ipcRenderer.invoke('window-close'),
  windowIsMaximized: () => ipcRenderer.invoke('window-is-maximized'),
  // Config store
  storeGet: (key) => ipcRenderer.invoke('store-get', key),
  storeSet: (key, value) => ipcRenderer.invoke('store-set', key, value),
  storeGetAll: () => ipcRenderer.invoke('store-get-all'),
  storeDelete: (key) => ipcRenderer.invoke('store-delete', key),
});
