import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'trademark-search-theme';

export function useDarkMode() {
  // 초기값: localStorage에서 불러오거나 시스템 설정 확인
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (savedTheme) {
      return savedTheme;
    }
    // 시스템 다크 모드 설정 확인
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  // 테마 변경 시 DOM과 localStorage에 반영
  useEffect(() => {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  // 테마 토글 함수
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const isDark = theme === 'dark';

  return { theme, isDark, toggleTheme };
}
