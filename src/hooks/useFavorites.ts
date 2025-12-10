import { useState, useEffect, useCallback } from 'react';

const FAVORITES_KEY = 'trademark_favorites';

interface UseFavoritesReturn {
  favorites: Set<string>;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
  addFavorite: (id: string) => void;
  removeFavorite: (id: string) => void;
  clearFavorites: () => void;
  favoritesCount: number;
}

export const useFavorites = (): UseFavoritesReturn => {
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    // localStorage에서 초기값 로드
    try {
      const saved = localStorage.getItem(FAVORITES_KEY);
      if (saved) {
        return new Set(JSON.parse(saved));
      }
    } catch (error) {
      console.error('즐겨찾기 로드 실패:', error);
    }
    return new Set();
  });

  // favorites 변경 시 localStorage에 저장
  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]));
    } catch (error) {
      console.error('즐겨찾기 저장 실패:', error);
    }
  }, [favorites]);

  // 즐겨찾기 여부 확인
  const isFavorite = useCallback((id: string) => {
    return favorites.has(id);
  }, [favorites]);

  // 즐겨찾기 토글
  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(id)) {
        newFavorites.delete(id);
      } else {
        newFavorites.add(id);
      }
      return newFavorites;
    });
  }, []);

  // 즐겨찾기 추가
  const addFavorite = useCallback((id: string) => {
    setFavorites((prev) => new Set(prev).add(id));
  }, []);

  // 즐겨찾기 제거
  const removeFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      newFavorites.delete(id);
      return newFavorites;
    });
  }, []);

  // 즐겨찾기 전체 삭제
  const clearFavorites = useCallback(() => {
    setFavorites(new Set());
  }, []);

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    addFavorite,
    removeFavorite,
    clearFavorites,
    favoritesCount: favorites.size,
  };
};
