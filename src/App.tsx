import { useState, useEffect, useCallback } from 'react';
import { useSearch } from './hooks/useSearch';
import { usePagination } from './hooks/usePagination';
import { useFavorites } from './hooks/useFavorites';
import { useDarkMode } from './hooks/useDarkMode';
import { downloadCSV } from './utils/exportCSV';
import SearchBar from './components/SearchBar';
import StatusFilter from './components/StatusFilter';
import Pagination from './components/Pagination';
import TrademarkModal from './components/TrademarkModal';
import YearlyComparisonChart from './components/YearlyComparisonChart';
import type { KRTrademark, USTrademark, JPTrademark, Trademark, Country } from './types/trademark';
import './App.css';

/**
 * 한국 상표 데이터를 통합 형식으로 변환
 */
const normalizeKRData = (data: KRTrademark): Trademark => {
  const displayName = data.productName || data.productNameEng || '(상표명 없음)';
  
  return {
    id: `KR-${data.applicationNumber}`,
    country: 'KR',
    productName: displayName,
    productNameKr: data.productName,
    productNameEng: data.productNameEng,
    applicationNumber: data.applicationNumber,
    applicationDate: data.applicationDate,
    registerStatus: data.registerStatus,
    publicationNumber: data.publicationNumber,
    publicationDate: data.publicationDate,
    registrationNumber: data.registrationNumber ?? [],
    registrationDate: (data.registrationDate ?? []).filter((d): d is string => d !== null),
    registrationPubNumber: data.registrationPubNumber,
    registrationPubDate: data.registrationPubDate,
    internationalRegDate: data.internationalRegDate,
    internationalRegNumbers: data.internationalRegNumbers ?? [],
    priorityClaimNumList: data.priorityClaimNumList ?? [],
    priorityClaimDateList: data.priorityClaimDateList ?? [],
    classificationCodes: data.asignProductMainCodeList ?? [],
    subClassificationCodes: data.asignProductSubCodeList ?? [],
    viennaCodeList: data.viennaCodeList ?? [],
  };
};

/**
 * 미국 상표 데이터를 통합 형식으로 변환
 */
const normalizeUSData = (data: USTrademark): Trademark => {
  return {
    id: `US-${data.applicationNumber}`,
    country: 'US',
    productName: data.productName || '(No Name)',
    productNameKr: null,
    productNameEng: data.productName,
    applicationNumber: data.applicationNumber,
    applicationDate: data.applicationDate,
    registerStatus: data.registerStatus,
    publicationNumber: null,
    publicationDate: data.publicationDate,
    registrationNumber: data.registrationNumber ?? [],
    registrationDate: (data.registrationDate ?? []).filter((d): d is string => d !== null),
    registrationPubNumber: null,
    registrationPubDate: null,
    internationalRegDate: data.internationalRegDate,
    internationalRegNumbers: data.internationalRegNumbers ?? [],
    priorityClaimNumList: data.priorityClaimNumList ?? [],
    priorityClaimDateList: data.priorityClaimDateList ?? [],
    classificationCodes: data.asignProductMainCodeList ?? [],
    subClassificationCodes: data.usClassCodeList ?? [],
    viennaCodeList: data.viennaCodeList ?? [],
  };
};

// 일본 상태값 매핑
const JP_STATUS_MAP: Record<string, string> = {
  '登録': '등록',
  '出願中': '출원',
  '拒絶': '거절',
  '失効': '실효',
  '取下': '취하',
};

/**
 * 일본 상표 데이터를 통합 형식으로 변환
 */
const normalizeJPData = (data: JPTrademark): Trademark => {
  const formatJPDate = (date: string | null): string => {
    if (!date) return '';
    return date.replace(/-/g, '');
  };

  return {
    id: `JP-${data.applicationNumber}`,
    country: 'JP',
    productName: data.trademarkName || data.trademarkNameEn || '(商標名なし)',
    productNameKr: null,
    productNameEng: data.trademarkNameEn,
    applicationNumber: data.applicationNumber,
    applicationDate: formatJPDate(data.applicationDate),
    registerStatus: JP_STATUS_MAP[data.status] || data.status,
    publicationNumber: null,
    publicationDate: null,
    registrationNumber: data.registrationNumber ? [data.registrationNumber] : [],
    registrationDate: data.registrationDate ? [formatJPDate(data.registrationDate)] : [],
    registrationPubNumber: null,
    registrationPubDate: null,
    internationalRegDate: null,
    internationalRegNumbers: [],
    priorityClaimNumList: [],
    priorityClaimDateList: [],
    classificationCodes: data.classificationCodes ?? [],
    subClassificationCodes: [],
    viennaCodeList: [],
  };
};

/**
 * 날짜 포맷팅 함수 (YYYYMMDD -> YYYY.MM.DD)
 */
const formatDate = (dateStr: string): string => {
  if (!dateStr || dateStr.length !== 8) return dateStr;
  return `${dateStr.slice(0, 4)}.${dateStr.slice(4, 6)}.${dateStr.slice(6, 8)}`;
};

/**
 * 앱 상태 인터페이스
 */
interface AppState {
  krTrademarks: Trademark[];
  usTrademarks: Trademark[];
  jpTrademarks: Trademark[];
  krRawData: KRTrademark[];
  usRawData: USTrademark[];
  jpRawData: JPTrademark[];
  selectedCountry: Country;
  isLoading: boolean;
  error: string | null;
}

/**
 * 초기 앱 상태
 */
const initialState: AppState = {
  krTrademarks: [],
  usTrademarks: [],
  jpTrademarks: [],
  krRawData: [],
  usRawData: [],
  jpRawData: [],
  selectedCountry: 'KR',
  isLoading: true,
  error: null,
};

function App() {
  // 앱 상태 관리
  const [state, setState] = useState<AppState>(initialState);
  const { krTrademarks, usTrademarks, jpTrademarks, krRawData, usRawData, jpRawData: _jpRawData, selectedCountry, isLoading, error } = state;

  // 다크 모드
  const { isDark, toggleTheme } = useDarkMode();

  // 모달에 표시할 선택된 상표
  const [selectedTrademark, setSelectedTrademark] = useState<Trademark | null>(null);

  // 즐겨찾기만 보기 모드
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // 차트 표시 여부
  const [showChart, setShowChart] = useState(false);

  // 정렬 상태 (sortBy: 정렬 기준, sortOrder: 오름차순/내림차순)
  const [sortBy, setSortBy] = useState<'applicationDate' | 'productName'>('applicationDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // 다중 선택 상태
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // 현재 선택된 국가의 데이터
  const currentTrademarks = selectedCountry === 'KR' 
    ? krTrademarks 
    : selectedCountry === 'US' 
      ? usTrademarks 
      : jpTrademarks;

  // 검색 훅 사용
  const { filters, filteredData, updateFilter, resetFilters } = useSearch(currentTrademarks);

  // 즐겨찾기 훅 사용
  const { isFavorite, toggleFavorite, favoritesCount } = useFavorites();

  // 즐겨찾기 필터 적용
  const favoritesFiltered = showFavoritesOnly
    ? filteredData.filter((item) => isFavorite(item.id))
    : filteredData;

  // 정렬 적용
  const displayData = [...favoritesFiltered].sort((a, b) => {
    let comparison = 0;
    
    if (sortBy === 'applicationDate') {
      comparison = a.applicationDate.localeCompare(b.applicationDate);
    } else if (sortBy === 'productName') {
      comparison = a.productName.localeCompare(b.productName, 'ko');
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // 페이지네이션 훅 사용
  const pagination = usePagination({ totalItems: displayData.length });

  /**
   * 국가 선택 변경
   */
  const handleCountryChange = useCallback(
    (country: Country) => {
      setState(prev => ({ ...prev, selectedCountry: country }));
      resetFilters(); // 국가 변경 시 필터 초기화
      pagination.resetPagination(); // 페이지네이션 초기화
    },
    [pagination, resetFilters],
  );

  // 현재 페이지에 표시할 데이터
  const paginatedData = displayData.slice(pagination.startIndex, pagination.endIndex);

  // 키보드 단축키 설정
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 입력 필드에서는 단축키 비활성화
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // 모달이 열려있으면 다른 단축키 비활성화 (ESC는 모달에서 처리)
      if (selectedTrademark) {
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          // 이전 페이지
          if (pagination.currentPage > 1) {
            pagination.prevPage();
          }
          break;
        case 'ArrowRight':
          // 다음 페이지
          if (pagination.currentPage < pagination.totalPages) {
            pagination.nextPage();
          }
          break;
        case '1':
          // 한국 탭
          if (!e.ctrlKey && !e.metaKey) {
            handleCountryChange('KR');
          }
          break;
        case '2':
          // 미국 탭
          if (!e.ctrlKey && !e.metaKey) {
            handleCountryChange('US');
          }
          break;
        case 'f':
        case 'F':
          // 즐겨찾기 토글
          if (!e.ctrlKey && !e.metaKey) {
            setShowFavoritesOnly(prev => !prev);
            pagination.resetPagination();
          }
          break;
        case 'c':
        case 'C':
          // 차트 토글
          if (!e.ctrlKey && !e.metaKey) {
            setShowChart(prev => !prev);
          }
          break;
        case 'd':
        case 'D':
          // 다크 모드 토글
          if (!e.ctrlKey && !e.metaKey) {
            toggleTheme();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleCountryChange, pagination, selectedTrademark, toggleTheme]);

  // 정렬 변경 핸들러
  const handleSortChange = (newSortBy: 'applicationDate' | 'productName') => {
    if (sortBy === newSortBy) {
      // 같은 기준이면 정렬 순서 토글
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // 다른 기준이면 새 기준으로 변경 (기본: 내림차순)
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
    pagination.resetPagination();
  };

  // 개별 항목 선택/해제
  const toggleSelectItem = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // 현재 페이지 전체 선택/해제
  const toggleSelectAll = () => {
    const allSelected = paginatedData.every(item => selectedIds.has(item.id));
    if (allSelected) {
      // 전체 해제
      setSelectedIds(prev => {
        const newSet = new Set(prev);
        paginatedData.forEach(item => newSet.delete(item.id));
        return newSet;
      });
    } else {
      // 전체 선택
      setSelectedIds(prev => {
        const newSet = new Set(prev);
        paginatedData.forEach(item => newSet.add(item.id));
        return newSet;
      });
    }
  };

  // 선택 초기화
  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  // 선택된 항목 내보내기
  const exportSelected = () => {
    const selectedData = displayData.filter(item => selectedIds.has(item.id));
    downloadCSV(selectedData, `trademarks_selected_${selectedCountry}`);
  };

  /**
   * JSON 데이터 불러오기
   */
  const fetchTrademarkData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // 한국, 미국, 일본 데이터 동시에 fetch
      const [krResponse, usResponse, jpResponse] = await Promise.all([
        fetch('/trademarks_kr_trademarks.json'),
        fetch('/trademarks_us_trademarks.json'),
        fetch('/trademarks_jp_trademarks.json'),
      ]);

      // 응답 상태 확인
      if (!krResponse.ok) {
        throw new Error(`한국 데이터 로드 실패: ${krResponse.status}`);
      }
      if (!usResponse.ok) {
        throw new Error(`미국 데이터 로드 실패: ${usResponse.status}`);
      }
      if (!jpResponse.ok) {
        throw new Error(`일본 데이터 로드 실패: ${jpResponse.status}`);
      }

      // JSON 파싱 및 타입 적용
      const krRawData: KRTrademark[] = await krResponse.json();
      const usRawData: USTrademark[] = await usResponse.json();
      const jpRawData: JPTrademark[] = await jpResponse.json();

      // 데이터 정규화 (interface 기반 변환)
      const normalizedKR: Trademark[] = krRawData.map(normalizeKRData);
      const normalizedUS: Trademark[] = usRawData.map(normalizeUSData);
      const normalizedJP: Trademark[] = jpRawData.map(normalizeJPData);
     
      // 상태 업데이트
      setState(prev => ({
        ...prev,
        krTrademarks: normalizedKR,
        usTrademarks: normalizedUS,
        jpTrademarks: normalizedJP,
        krRawData: krRawData,
        usRawData: usRawData,
        jpRawData: jpRawData,
        isLoading: false,
      }));

      console.log('✅ 데이터 로드 완료');
      console.log(`   한국: ${normalizedKR.length}건`);
      console.log(`   미국: ${normalizedUS.length}건`);
      console.log(`   일본: ${normalizedJP.length}건`);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
      console.error('❌ 데이터 로드 실패:', errorMessage);
    }
  }, []);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchTrademarkData();
  }, [fetchTrademarkData]);

  // 로딩 중
  if (isLoading) {
    return (
      <div className="app-container">
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px' }}>
          <p style={{ fontSize: '18px', color: 'var(--text-secondary)' }}>데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 발생
  if (error) {
    return (
      <div className="app-container">
        <div className="glass-card error-state">
          <p>⚠️ 오류가 발생했습니다</p>
          <p>{error}</p>
          <button onClick={fetchTrademarkData}>다시 시도</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* 상단 헤더 */}
      <header className="top-header">
        <div className="header-left">
          <div className="logo">
            <span>Mark<span className="logo-accent">Cloud</span></span>
          </div>
        </div>
        
        {/* 국가 선택 탭 (Primary Navigation) */}
        <nav className="country-nav">
          <button 
            className={`country-tab ${selectedCountry === 'KR' ? 'active' : ''}`}
            onClick={() => handleCountryChange('KR')}
          >
            <span className="icon">🇰🇷</span>
            <span>한국 <span className="count">({krTrademarks.length})</span></span>
          </button>
          <button 
            className={`country-tab ${selectedCountry === 'US' ? 'active' : ''}`}
            onClick={() => handleCountryChange('US')}
          >
            <span className="icon">🇺🇸</span>
            <span>미국 <span className="count">({usTrademarks.length})</span></span>
          </button>
          <button 
            className={`country-tab ${selectedCountry === 'JP' ? 'active' : ''}`}
            onClick={() => handleCountryChange('JP')}
          >
            <span className="icon">🇯🇵</span>
            <span>일본 <span className="count">({jpTrademarks.length})</span></span>
          </button>
        </nav>

        {/* 보조 기능 (Secondary Actions) */}
        <div className="header-right">
          <button 
            className={`action-btn ${showFavoritesOnly ? 'active' : ''}`}
            onClick={() => { setShowFavoritesOnly(!showFavoritesOnly); setShowChart(false); pagination.resetPagination(); }}
            title="즐겨찾기"
          >
            <span className="icon">⭐</span>
            <span className="badge">{favoritesCount}</span>
          </button>
          <button 
            className={`action-btn ${showChart ? 'active' : ''}`}
            onClick={() => setShowChart(!showChart)}
            title="출원 추이 차트"
          >
            <span className="icon">📊</span>
          </button>
          <div className="divider"></div>
          <button 
            className="action-btn"
            onClick={toggleTheme}
            title={isDark ? '라이트 모드' : '다크 모드'}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
          <div className="user-profile">
            <div className="user-avatar">U</div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="main-content-full">

        {/* 차트 영역 */}
        {showChart && (
          <div className="glass-card">
            <div className="card-header">
              <h3 className="card-title">📊 연도별 출원 추이</h3>
              <span className="card-link" onClick={() => setShowChart(false)}>닫기</span>
            </div>
            <YearlyComparisonChart
              krTrademarks={krRawData}
              usTrademarks={usRawData}
            />
          </div>
        )}

        {/* 검색 영역 */}
        <div className="glass-card">
          <div className="card-header">
            <h3 className="card-title">
              {selectedCountry === 'KR' ? '🇰🇷 한국' : '🇺🇸 미국'} 상표 검색
              {showFavoritesOnly && ' (즐겨찾기)'}
            </h3>
            <span className="card-link" onClick={resetFilters}>필터 초기화</span>
          </div>
          
          <SearchBar
            filters={filters}
            onFilterChange={(key, value) => {
              updateFilter(key, value);
              pagination.resetPagination();
            }}
            onReset={() => {
              resetFilters();
              pagination.resetPagination();
            }}
            totalCount={currentTrademarks.length}
            filteredCount={filteredData.length}
          />

          <StatusFilter
            selectedStatuses={filters.statuses}
            onStatusChange={(statuses) => {
              updateFilter('statuses', statuses);
              pagination.resetPagination();
            }}
            country={selectedCountry}
          />

          {/* 정렬 및 선택 옵션 */}
          <div className="sort-options">
            <span className="sort-label">정렬:</span>
            <button
              className={`sort-btn ${sortBy === 'applicationDate' ? 'active' : ''}`}
              onClick={() => handleSortChange('applicationDate')}
            >
              출원일순 {sortBy === 'applicationDate' && (sortOrder === 'desc' ? '↓' : '↑')}
            </button>
            <button
              className={`sort-btn ${sortBy === 'productName' ? 'active' : ''}`}
              onClick={() => handleSortChange('productName')}
            >
              상표명순 {sortBy === 'productName' && (sortOrder === 'desc' ? '↓' : '↑')}
            </button>

            {selectedIds.size > 0 ? (
              <button className="export-btn selected" onClick={exportSelected}>
                📥 선택 내보내기 ({selectedIds.size}건)
              </button>
            ) : (
              <button
                className="export-btn"
                onClick={() => downloadCSV(displayData, `trademarks_${selectedCountry}`)}
                disabled={displayData.length === 0}
              >
                📥 내보내기 ({displayData.length}건)
              </button>
            )}
          </div>

          {/* 선택 컨트롤 */}
          <div className="selection-controls">
            <label className="select-all-checkbox">
              <input
                type="checkbox"
                checked={paginatedData.length > 0 && paginatedData.every(item => selectedIds.has(item.id))}
                onChange={toggleSelectAll}
              />
              <span>현재 페이지 전체 선택</span>
            </label>
            {selectedIds.size > 0 && (
              <>
                <span className="selection-count">{selectedIds.size}개 선택됨</span>
                <button className="clear-selection-btn" onClick={clearSelection}>선택 해제</button>
              </>
            )}
          </div>
        </div>

        {/* 상표 리스트 */}
        <div className="glass-card">
          <div className="card-header">
            <h3 className="card-title">상표 목록</h3>
            <span className="card-link">
              {pagination.startIndex + 1}-{pagination.endIndex} / {displayData.length}건
            </span>
          </div>

          <div className="trademark-list">
            {displayData.length === 0 ? (
              <div className="empty-state">
                {showFavoritesOnly ? (
                  <>
                    <p>즐겨찾기한 상표가 없습니다.</p>
                    <p>상표 카드의 ⭐ 버튼을 눌러 추가해보세요.</p>
                  </>
                ) : (
                  <>
                    <p>검색 결과가 없습니다.</p>
                    <p>다른 검색어로 시도해보세요.</p>
                  </>
                )}
              </div>
            ) : (
              paginatedData.map((trademark: Trademark) => (
                <div 
                  key={trademark.id} 
                  className={`trademark-card ${isFavorite(trademark.id) ? 'favorite' : ''} ${selectedIds.has(trademark.id) ? 'selected' : ''}`}
                  onClick={() => setSelectedTrademark(trademark)}
                >
                  <div className="card-header">
                    <h3>{trademark.productName}</h3>
                    <div className="card-actions">
                      <button
                        className={`favorite-btn ${isFavorite(trademark.id) ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(trademark.id);
                        }}
                        title={isFavorite(trademark.id) ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                      >
                        {isFavorite(trademark.id) ? '★' : '☆'}
                      </button>
                      <span className={`status-badge ${trademark.registerStatus}`}>
                        {trademark.registerStatus}
                      </span>
                    </div>
                  </div>
                  {trademark.productNameEng && trademark.productNameKr && (
                    <p className="eng-name">{trademark.productNameEng}</p>
                  )}
                  <div className="card-info-row">
                    <div className="card-info">
                      <p><span className="label">출원번호:</span> {trademark.applicationNumber}</p>
                      <p><span className="label">출원일:</span> {formatDate(trademark.applicationDate)}</p>
                    </div>
                    <label 
                      className="card-select-checkbox"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.has(trademark.id)}
                        onChange={() => toggleSelectItem(trademark.id)}
                      />
                      <span>선택</span>
                    </label>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 페이지네이션 */}
          {displayData.length > 0 && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={displayData.length}
              startIndex={pagination.startIndex}
              endIndex={pagination.endIndex}
              onPageChange={pagination.goToPage}
              onPrevPage={pagination.prevPage}
              onNextPage={pagination.nextPage}
            />
          )}
        </div>

        {/* 키보드 단축키 안내 */}
        <footer className="keyboard-shortcuts">
          <span className="shortcut-title">⌨️ 단축키:</span>
          <span className="shortcut-item"><kbd>←</kbd><kbd>→</kbd> 페이지</span>
          <span className="shortcut-item"><kbd>1</kbd> 한국</span>
          <span className="shortcut-item"><kbd>2</kbd> 미국</span>
          <span className="shortcut-item"><kbd>F</kbd> 즐겨찾기</span>
          <span className="shortcut-item"><kbd>C</kbd> 차트</span>
          <span className="shortcut-item"><kbd>D</kbd> 테마</span>
        </footer>
      </main>

      {/* 상세 정보 모달 */}
      {selectedTrademark && (
        <TrademarkModal
          trademark={selectedTrademark}
          onClose={() => setSelectedTrademark(null)}
        />
      )}
    </div>
  );
}

export default App;
