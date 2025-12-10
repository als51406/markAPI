import { useState, useEffect, useCallback } from 'react';
import { useSearch } from './hooks/useSearch';
import SearchBar from './components/SearchBar';
import StatusFilter from './components/StatusFilter';
import type { KRTrademark, USTrademark, Trademark, Country } from './types/trademark';
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
  selectedCountry: 'KR',
  isLoading: true,
  error: null,
};

function App() {
  // 앱 상태 관리
  const [state, setState] = useState<AppState>(initialState);
  const { krTrademarks, usTrademarks, selectedCountry, isLoading, error } = state;

  // 현재 선택된 국가의 데이터
  const currentTrademarks = selectedCountry === 'KR' ? krTrademarks : usTrademarks;

  // 검색 훅 사용
  const { filters, filteredData, updateFilter, resetFilters } = useSearch(currentTrademarks);

  /**
   * JSON 데이터 불러오기
   */
  const fetchTrademarkData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // 한국, 미국 데이터 동시에 fetch
      const [krResponse, usResponse] = await Promise.all([
        fetch('/trademarks_kr_trademarks.json'),
        fetch('/trademarks_us_trademarks.json'),
      ]);

      // 응답 상태 확인
      if (!krResponse.ok) {
        throw new Error(`한국 데이터 로드 실패: ${krResponse.status}`);
      }
      if (!usResponse.ok) {
        throw new Error(`미국 데이터 로드 실패: ${usResponse.status}`);
      }

      // JSON 파싱 및 타입 적용
      const krRawData: KRTrademark[] = await krResponse.json();
      const usRawData: USTrademark[] = await usResponse.json();

      // 데이터 정규화 (interface 기반 변환)
      const normalizedKR: Trademark[] = krRawData.map(normalizeKRData);
      const normalizedUS: Trademark[] = usRawData.map(normalizeUSData);
     
      // 상태 업데이트
      setState(prev => ({
        ...prev,
        krTrademarks: normalizedKR,
        usTrademarks: normalizedUS,
        isLoading: false,
      }));

      console.log('✅ 데이터 로드 완료');
      console.log(`   한국: ${normalizedKR.length}건`);
      console.log(`   미국: ${normalizedUS.length}건`);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
      console.error('❌ 데이터 로드 실패:', errorMessage);
    }
  }, []);

  /**
   * 국가 선택 변경
   */
  const handleCountryChange = (country: Country) => {
    setState(prev => ({ ...prev, selectedCountry: country }));
    resetFilters(); // 국가 변경 시 필터 초기화
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchTrademarkData();
  }, [fetchTrademarkData]);

  // 로딩 중
  if (isLoading) {
    return (
      <div className="app">
        <h1>🔍 상표 검색 서비스</h1>
        <div className="loading-state">
          <p>데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 발생
  if (error) {
    return (
      <div className="app">
        <h1>🔍 상표 검색 서비스</h1>
        <div className="error-state">
          <p>⚠️ 오류가 발생했습니다</p>
          <p>{error}</p>
          <button onClick={fetchTrademarkData}>다시 시도</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <h1>🔍 상표 검색 서비스</h1>

      {/* 국가 선택 탭 */}
      <div className="country-tabs">
        <button
          className={selectedCountry === 'KR' ? 'active' : ''}
          onClick={() => handleCountryChange('KR')}
        >
          🇰🇷 한국 ({krTrademarks.length})
        </button>
        <button
          className={selectedCountry === 'US' ? 'active' : ''}
          onClick={() => handleCountryChange('US')}
        >
          🇺🇸 미국 ({usTrademarks.length})
        </button>
      </div>

      {/* 검색 바 */}
      <SearchBar
        filters={filters}
        onFilterChange={updateFilter}
        onReset={resetFilters}
        totalCount={currentTrademarks.length}
        filteredCount={filteredData.length}
      />

      {/* 상태 필터 */}
      <StatusFilter
        selectedStatuses={filters.statuses}
        onStatusChange={(statuses) => updateFilter('statuses', statuses)}
        country={selectedCountry}
      />

      {/* 상표 리스트 */}
      <div className="trademark-list">
        {filteredData.length === 0 ? (
          <div className="empty-state">
            <p>검색 결과가 없습니다.</p>
            <p>다른 검색어로 시도해보세요.</p>
          </div>
        ) : (
          filteredData.slice(0, 20).map((trademark: Trademark) => (
            <div key={trademark.id} className="trademark-card">
              <div className="card-header">
                <h3>{trademark.productName}</h3>
                <span className={`status-badge ${trademark.registerStatus}`}>
                  {trademark.registerStatus}
                </span>
              </div>
              {trademark.productNameEng && trademark.productNameKr && (
                <p className="eng-name">{trademark.productNameEng}</p>
              )}
              <div className="card-info">
                <p><span className="label">출원번호:</span> {trademark.applicationNumber}</p>
                <p><span className="label">출원일:</span> {formatDate(trademark.applicationDate)}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 더 많은 결과 표시 */}
      {filteredData.length > 20 && (
        <p className="more-results">
          외 {filteredData.length - 20}건이 더 있습니다.
        </p>
      )}
    </div>
  );
}

export default App;
