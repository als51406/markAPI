import { useState, useMemo } from 'react';
import type { Trademark, SearchFilters } from '../types/trademark';
import { initialFilters } from '../types/trademark';

interface UseSearchReturn {
  filters: SearchFilters;
  setFilters: React.Dispatch<React.SetStateAction<SearchFilters>>;
  filteredData: Trademark[];
  resetFilters: () => void;
  updateFilter: <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => void;
}

export const useSearch = (data: Trademark[]): UseSearchReturn => {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);

  // 필터링된 데이터
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // 1. 상표명 검색 (한글 + 영문)
      if (filters.query.trim()) {
        const query = filters.query.toLowerCase().trim();
        const nameMatch = item.productName?.toLowerCase().includes(query);
        const engNameMatch = item.productNameEng?.toLowerCase().includes(query);
        const krNameMatch = item.productNameKr?.toLowerCase().includes(query);
        
        if (!nameMatch && !engNameMatch && !krNameMatch) {
          return false;
        }
      }

      // 2. 출원번호 검색 (정확 검색 또는 부분 검색)
      if (filters.applicationNumber.trim()) {
        const appNum = filters.applicationNumber.trim();
        if (!item.applicationNumber.includes(appNum)) {
          return false;
        }
      }

      // 3. 등록 상태 필터
      if (filters.statuses.length > 0) {
        if (!filters.statuses.includes(item.registerStatus)) {
          return false;
        }
      }

      // 4. 출원일 시작일
      if (filters.dateFrom) {
        const fromDate = filters.dateFrom.replace(/-/g, ''); // YYYY-MM-DD -> YYYYMMDD
        if (item.applicationDate < fromDate) {
          return false;
        }
      }

      // 5. 출원일 종료일
      if (filters.dateTo) {
        const toDate = filters.dateTo.replace(/-/g, ''); // YYYY-MM-DD -> YYYYMMDD
        if (item.applicationDate > toDate) {
          return false;
        }
      }

      return true;
    });
  }, [data, filters]);

  // 필터 초기화
  const resetFilters = () => {
    setFilters(initialFilters);
  };

  // 개별 필터 업데이트
  const updateFilter = <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return {
    filters,
    setFilters,
    filteredData,
    resetFilters,
    updateFilter,
  };
};
