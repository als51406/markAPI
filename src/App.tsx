import { useTrademarks } from './hooks/useTrademarks';
import './App.css';

function App() {
  const { trademarks, isLoading, error, selectedCountry, setSelectedCountry } = useTrademarks();

  // 로딩 중
  if (isLoading) {
    return (
      <div className="app">
        <h1>상표 검색 서비스</h1>
        <p>데이터를 불러오는 중...</p>
      </div>
    );
  }

  // 에러 발생
  if (error) {
    return (
      <div className="app">
        <h1>상표 검색 서비스</h1>
        <p style={{ color: 'red' }}>오류: {error}</p>
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
          onClick={() => setSelectedCountry('KR')}
        >
          🇰🇷 한국
        </button>
        <button
          className={selectedCountry === 'US' ? 'active' : ''}
          onClick={() => setSelectedCountry('US')}
        >
          🇺🇸 미국
        </button>
      </div>

      {/* 데이터 개수 표시 */}
      <p>총 {trademarks.length}건의 상표가 있습니다.</p>

      {/* 상표 리스트 (일단 10개만 표시) */}
      <div className="trademark-list">
        {trademarks.slice(0, 10).map((trademark) => (
          <div key={trademark.id} className="trademark-card">
            <h3>{trademark.productName}</h3>
            {trademark.productNameEng && trademark.country === 'KR' && (
              <p className="eng-name">{trademark.productNameEng}</p>
            )}
            <p>출원번호: {trademark.applicationNumber}</p>
            <p>출원일: {trademark.applicationDate}</p>
            <p>상태: {trademark.registerStatus}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
