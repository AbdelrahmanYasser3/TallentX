export interface ThemeConfig {
  mode: 'light' | 'dark';
  preferSystem?: boolean;
}

export interface NavItem {
  label: string;
  route: string;
  icon?: string;
  requiresAuth: boolean;
  roles?: string[];
}
