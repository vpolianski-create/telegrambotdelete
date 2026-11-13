export type ThemeSetting = 'system' | 'light' | 'dark';

/** Какую тему показать: «Как в Windows» следует за системой, остальные — как выбрано. */
export function resolveTheme(setting: ThemeSetting, systemDark: boolean): 'light' | 'dark' {
  if (setting === 'system') return systemDark ? 'dark' : 'light';
  return setting;
}
