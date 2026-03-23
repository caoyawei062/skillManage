const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');

// ========== JSON DB ==========
class JsonDB {
  constructor(filename) {
    this.filePath = path.join(app.getPath('userData'), filename);
    this.data = this._load();
  }

  _load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const content = fs.readFileSync(this.filePath, 'utf-8');
        return JSON.parse(content);
      }
    } catch (e) {
      console.error('Failed to load DB:', e);
    }
    return {};
  }

  _save() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to save DB:', e);
    }
  }

  get(key) {
    return key ? this.data[key] : this.data;
  }

  set(key, value) {
    this.data[key] = value;
    this._save();
    return true;
  }

  delete(key) {
    delete this.data[key];
    this._save();
    return true;
  }
}

const db = new JsonDB('config.json');
console.log('JSON DB path:', db.filePath);

// ========== Category Detection ==========
const categoryKeywords = {
  'Development': ['coding', 'code', 'developer', 'programming', 'script', 'build', 'api', 'git', 'agent', 'tool', 'mcp'],
  'Design': ['design', 'ui', 'ux', 'interface', 'layout', 'component', 'style', 'css', 'animation'],
  'Documentation': ['doc', 'document', 'readme', 'markdown', 'write', 'pdf', 'pptx'],
  'AI/ML': ['ai', 'ml', 'gpt', 'llm', 'prompt', 'nlp', 'rag'],
  'Utilities': ['util', 'tool', 'helper', 'file', 'calendar', 'email', 'sync'],
  'Other': [],
};

function detectCategory(name, description, content = '') {
  const text = `${name} ${description} ${content}`.toLowerCase();
  let maxScore = 0;
  let bestCategory = 'Other';
  
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (category === 'Other') continue;
    let score = 0;
    for (const keyword of keywords) {
      if (text.includes(keyword)) score++;
    }
    if (score > maxScore) {
      maxScore = score;
      bestCategory = category;
    }
  }
  return maxScore >= 1 ? bestCategory : 'Other';
}

// ========== Window ==========
let mainWindow = null;

function createWindow() {
  const bounds = db.get('windowBounds') || { width: 1200, height: 800 };
  
  mainWindow = new BrowserWindow({
    width: bounds.width,
    height: bounds.height,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#0D0D0D',
    titleBarStyle: 'hiddenInset',
    title: '',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  mainWindow.on('resize', () => {
    const { width, height } = mainWindow.getBounds();
    db.set('windowBounds', { width, height });
  });

  const isDev = !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});

// ========== IPC Handlers ==========
ipcMain.handle('scan-skills', async (event, dirPath) => {
  try {
    const skills = [];
    if (!fs.existsSync(dirPath)) return { success: true, skills: [] };

    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const skillPath = path.join(dirPath, entry.name);
        const skillMdPath = path.join(skillPath, 'SKILL.md');
        
        let metadata = { name: entry.name, description: '', version: '1.0.0', category: 'Other', tags: [] };
        let content = '';
        
        if (fs.existsSync(skillMdPath)) {
          const fileContent = fs.readFileSync(skillMdPath, 'utf-8');
          const lines = fileContent.split('\n');
          let frontmatterEnd = -1;
          
          if (lines[0]?.trim() === '---') {
            for (let i = 1; i < lines.length; i++) {
              const line = lines[i].trim();
              if (line === '---') { frontmatterEnd = i; break; }
              if (line.startsWith('name:')) metadata.name = line.replace('name:', '').trim().replace(/^["']|["']$/g, '');
              if (line.startsWith('description:')) metadata.description = line.replace('description:', '').trim().replace(/^["']|["']$/g, '');
              if (line.startsWith('version:')) metadata.version = line.replace('version:', '').trim().replace(/^["']|["']$/g, '');
              if (line.startsWith('category:')) metadata.category = line.replace('category:', '').trim().replace(/^["']|["']$/g, '');
              if (line.startsWith('tags:')) metadata.tags = line.replace('tags:', '').trim().replace(/[\[\]]/g, '').split(',').map(t => t.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
            }
            if (frontmatterEnd > 0) content = lines.slice(frontmatterEnd + 1).join('\n').trim();
          } else {
            content = fileContent;
          }
        }
        
        if (!metadata.category || metadata.category === 'Other') {
          metadata.category = detectCategory(metadata.name, metadata.description, content);
        }
        
        if (metadata.tags.length === 0 && content) {
          const tagMatches = content.match(/#(\w+)/g);
          if (tagMatches) metadata.tags = [...new Set(tagMatches.map(t => t.slice(1)))].slice(0, 5);
        }
        
        skills.push({ ...metadata, path: skillPath, content: content || fileContent || '' });
      }
    }
    return { success: true, skills };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('read-file', async (event, filePath) => {
  try {
    return { success: true, content: fs.readFileSync(filePath, 'utf-8') };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('write-file', async (event, filePath, content) => {
  try {
    fs.writeFileSync(filePath, content, 'utf-8');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, { properties: ['openDirectory'] });
  if (result.canceled) return { success: false, canceled: true };
  return { success: true, path: result.filePaths[0] };
});

ipcMain.handle('open-external', async (event, url) => {
  await shell.openExternal(url);
});

ipcMain.handle('open-path', async (event, targetPath) => {
  try {
    await shell.openPath(targetPath);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-home-dir', async () => {
  return process.env.HOME || process.env.USERPROFILE;
});

ipcMain.handle('path-exists', async (event, targetPath) => {
  return fs.existsSync(targetPath);
});

ipcMain.handle('delete-directory', async (event, dirPath) => {
  try { fs.rmSync(dirPath, { recursive: true, force: true }); return { success: true }; }
  catch (error) { return { success: false, error: error.message }; }
});

ipcMain.handle('create-directory', async (event, dirPath) => {
  try { fs.mkdirSync(dirPath, { recursive: true }); return { success: true }; }
  catch (error) { return { success: false, error: error.message }; }
});

// ========== JSON DB Handlers ==========
ipcMain.handle('store-get', (event, key) => {
  return db.get(key);
});

ipcMain.handle('store-set', (event, key, value) => {
  return db.set(key, value);
});

ipcMain.handle('store-get-all', () => {
  return db.get(null);
});

ipcMain.handle('store-delete', (event, key) => {
  return db.delete(key);
});

// ========== skills-sh ==========
ipcMain.handle('search-skills-sh', async (event, query, limit = 10) => {
  try {
    const { execSync } = require('child_process');
    const cmd = `npx skills-sh search "${query}" --limit ${limit} --json`;
    const output = execSync(cmd, { stdio: 'pipe', timeout: 30000 });
    return { success: true, results: JSON.parse(output.toString()) };
  } catch (e) {
    return { success: false, error: 'skills-sh not available', needsInstall: true };
  }
});

ipcMain.handle('show-skills-sh', async (event, skillId) => {
  try {
    const { execSync } = require('child_process');
    const cmd = `npx skills-sh show "${skillId}" --json`;
    const output = execSync(cmd, { stdio: 'pipe', timeout: 30000 });
    return { success: true, details: JSON.parse(output.toString()) };
  } catch (e) {
    return { success: false, error: 'Failed to fetch details' };
  }
});

ipcMain.handle('install-skills-sh', async (event, skillId) => {
  try {
    const { execSync } = require('child_process');
    const homeDir = process.env.HOME || process.env.USERPROFILE;
    const skillsDir = `${homeDir}/.config/alma/skills`;
    if (!fs.existsSync(skillsDir)) fs.mkdirSync(skillsDir, { recursive: true });
    const cmd = `npx skills-sh install "${skillId}"`;
    execSync(cmd, { stdio: 'pipe', timeout: 60000 });
    return { success: true, installedTo: skillsDir };
  } catch (e) {
    return { success: false, error: 'Installation failed' };
  }
});

ipcMain.handle('check-skills-sh', async () => {
  try {
    const { execSync } = require('child_process');
    execSync('npx skills-sh --version', { stdio: 'pipe', timeout: 10000 });
    return { installed: true, viaNpx: true };
  } catch (e) {
    return { installed: false };
  }
});
