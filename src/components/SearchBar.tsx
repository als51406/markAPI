import type { SearchFilters } from '../types/trademark';

interface SearchBarProps {
  filters: SearchFilters;
  onFilterChange: <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => void;
  onReset: () => void;
  totalCount: number;
  filteredCount: number;
}

const SearchBar = ({ 
  filters, 
  onFilterChange, 
  onReset, 
  totalCount, 
  filteredCount 
}: SearchBarProps) => {
  return (
    <div className="search-bar">
      <div className="search-row">
        {/* 상표명 검색 */}
        <div className="search-field">
          <label htmlFor="query">상표명 검색</label>
          <input
            id="query"
            type="text"
            placeholder="상표명을 입력하세요 (한글/영문)"
            value={filters.query}
            onChange={(e) => onFilterChange('query', e.target.value)}
          />
        </div>

        {/* 출원번호 검색 */}
        <div className="search-field">
          <label htmlFor="applicationNumber">출원번호 검색</label>
          <input
            id="applicationNumber"
            type="text"
            placeholder="출원번호를 입력하세요"
            value={filters.applicationNumber}
            onChange={(e) => onFilterChange('applicationNumber', e.target.value)}
          />
        </div>
      </div>

      <div className="search-row">
        {/* 출원일 시작 */}
        <div className="search-field">
          <label htmlFor="dateFrom">출원일 (시작)</label>
          <input
            id="dateFrom"
            type="date"
            value={filters.dateFrom}
            onChange={(e) => onFilterChange('dateFrom', e.target.value)}
          />
        </div>

        {/* 출원일 종료 */}
        <div className="search-field">
          <label htmlFor="dateTo">출원일 (종료)</label>
          <input
            id="dateTo"
            type="date"
            value={filters.dateTo}
            onChange={(e) => onFilterChange('dateTo', e.target.value)}
          />
        </div>

        {/* 초기화 버튼 */}
        <div className="search-field search-actions">
          <button onClick={onReset} className="reset-btn">
            초기화
          </button>
        </div>
      </div>

      {/* 검색 결과 카운트 */}
      <div className="search-result-count">
        {filters.query || filters.applicationNumber || filters.dateFrom || filters.dateTo ? (
          <span>
            검색 결과: <strong>{filteredCount}</strong>건 / 전체 {totalCount}건
          </span>
        ) : (
          <span>전체 <strong>{totalCount}</strong>건</span>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
