import { createContext, useContext } from 'react';
export const ThemeContext = createContext(null);
export function useAdminTheme() { return useContext(ThemeContext) || { theme: 'light', toggleTheme: () => {}, isDark: false }; }
