export interface Skill {
  id: string;
  name: string;
  description: string;
  version: string;
  category: string;
  tags: string[];
  tools: string[];
  path: string;
  content: string;
  source: 'global' | 'project' | 'remote';
  sourceId?: string; // Link to source id
}

export interface SkillSource {
  id: string;
  name: string;
  path: string;
  type: 'global' | 'project';
  enabled: boolean;
}

export interface ThemeColors {
  bg: string;
  card: string;
  border: string;
  primary: string;
  text: string;
  muted: string;
  accent: string;
}

export interface Theme {
  id: string;
  name: string;
  isCustom?: boolean;
  dark: ThemeColors;
  light: ThemeColors;
}

export type ViewMode = 'grid' | 'list' | 'tree';
export type ColorMode = 'dark' | 'light' | 'system';

export interface AppState {
  skills: Skill[];
  sources: SkillSource[];
  selectedSkill: Skill | null;
  searchQuery: string;
  selectedCategory: string | null;
  selectedTag: string | null;
  selectedSource: string | null;
  viewMode: ViewMode;
  theme: Theme;
  mode: 'dark' | 'light';
  isLoading: boolean;
}
