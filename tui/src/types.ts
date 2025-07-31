export interface Profile {
  name: string;
  active: boolean;
}

export interface MenuItem {
  name: string;
  description: string;
  value: string;
}

export type ViewType = 'menu' | 'profiles' | 'create';

export interface StatusInfo {
  currentProfile: string;
  gitStatus: string;
}