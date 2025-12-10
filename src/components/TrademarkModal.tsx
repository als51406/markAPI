import type { Trademark } from '../types/trademark';

interface TrademarkModalProps {
  trademark: Trademark;
  onClose: () => void;
}

/**
 * 날짜 포맷팅 함수 (YYYYMMDD -> YYYY.MM.DD)
 */
const formatDate = (dateStr: string | null): string => {
  if (!dateStr || dateStr.length !== 8) return dateStr || '-';
  return `${dateStr.slice(0, 4)}.${dateStr.slice(4, 6)}.${dateStr.slice(6, 8)}`;
};

/**
 * 배열 데이터를 쉼표로 연결하여 표시
 */
const formatArray = (arr: string[]): string => {
  if (!arr || arr.length === 0) return '-';
  return arr.join(', ');
};

const TrademarkModal = ({ trademark, onClose }: TrademarkModalProps) => {
  // 모달 바깥 클릭 시 닫기
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // ESC 키로 닫기
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div 
      className="modal-overlay" 
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="modal-content">
        {/* 모달 헤더 */}
        <div className="modal-header">
          <div className="modal-title-section">
            <span className="country-badge">{trademark.country === 'KR' ? '🇰🇷 한국' : '🇺🇸 미국'}</span>
            <h2>{trademark.productName}</h2>
            <span className={`status-badge large ${trademark.registerStatus}`}>
              {trademark.registerStatus}
            </span>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>

        {/* 모달 본문 */}
        <div className="modal-body">
          {/* 기본 정보 */}
          <section className="info-section">
            <h3>📋 기본 정보</h3>
            <div className="info-grid">
              {trademark.country === 'KR' && trademark.productNameKr && (
                <div className="info-item">
                  <span className="info-label">한글 상표명</span>
                  <span className="info-value">{trademark.productNameKr}</span>
                </div>
              )}
              {trademark.productNameEng && (
                <div className="info-item">
                  <span className="info-label">영문 상표명</span>
                  <span className="info-value">{trademark.productNameEng}</span>
                </div>
              )}
              <div className="info-item">
                <span className="info-label">출원번호</span>
                <span className="info-value">{trademark.applicationNumber}</span>
              </div>
              <div className="info-item">
                <span className="info-label">출원일</span>
                <span className="info-value">{formatDate(trademark.applicationDate)}</span>
              </div>
            </div>
          </section>

          {/* 등록 정보 */}
          <section className="info-section">
            <h3>📝 등록 정보</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">등록 상태</span>
                <span className="info-value">{trademark.registerStatus}</span>
              </div>
              <div className="info-item">
                <span className="info-label">등록번호</span>
                <span className="info-value">{formatArray(trademark.registrationNumber)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">등록일</span>
                <span className="info-value">
                  {trademark.registrationDate.length > 0 
                    ? trademark.registrationDate.map(formatDate).join(', ')
                    : '-'}
                </span>
              </div>
              {trademark.publicationNumber && (
                <div className="info-item">
                  <span className="info-label">공고번호</span>
                  <span className="info-value">{trademark.publicationNumber}</span>
                </div>
              )}
              {trademark.publicationDate && (
                <div className="info-item">
                  <span className="info-label">공고일</span>
                  <span className="info-value">{formatDate(trademark.publicationDate)}</span>
                </div>
              )}
              {trademark.registrationPubNumber && (
                <div className="info-item">
                  <span className="info-label">등록공고번호</span>
                  <span className="info-value">{trademark.registrationPubNumber}</span>
                </div>
              )}
              {trademark.registrationPubDate && (
                <div className="info-item">
                  <span className="info-label">등록공고일</span>
                  <span className="info-value">{formatDate(trademark.registrationPubDate)}</span>
                </div>
              )}
            </div>
          </section>

          {/* 분류 정보 */}
          <section className="info-section">
            <h3>🏷️ 분류 정보</h3>
            <div className="info-grid">
              <div className="info-item full-width">
                <span className="info-label">주 분류코드</span>
                <span className="info-value">{formatArray(trademark.classificationCodes)}</span>
              </div>
              <div className="info-item full-width">
                <span className="info-label">{trademark.country === 'KR' ? '유사군코드' : 'US 분류코드'}</span>
                <span className="info-value">{formatArray(trademark.subClassificationCodes)}</span>
              </div>
              {trademark.viennaCodeList.length > 0 && (
                <div className="info-item full-width">
                  <span className="info-label">비엔나 코드</span>
                  <span className="info-value">{formatArray(trademark.viennaCodeList)}</span>
                </div>
              )}
            </div>
          </section>

          {/* 국제 등록 정보 */}
          {(trademark.internationalRegDate || trademark.internationalRegNumbers.length > 0) && (
            <section className="info-section">
              <h3>🌍 국제 등록 정보</h3>
              <div className="info-grid">
                {trademark.internationalRegDate && (
                  <div className="info-item">
                    <span className="info-label">국제등록일</span>
                    <span className="info-value">{formatDate(trademark.internationalRegDate)}</span>
                  </div>
                )}
                {trademark.internationalRegNumbers.length > 0 && (
                  <div className="info-item">
                    <span className="info-label">국제등록번호</span>
                    <span className="info-value">{formatArray(trademark.internationalRegNumbers)}</span>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* 우선권 정보 */}
          {(trademark.priorityClaimNumList.length > 0 || trademark.priorityClaimDateList.length > 0) && (
            <section className="info-section">
              <h3>⭐ 우선권 정보</h3>
              <div className="info-grid">
                {trademark.priorityClaimNumList.length > 0 && (
                  <div className="info-item">
                    <span className="info-label">우선권 번호</span>
                    <span className="info-value">{formatArray(trademark.priorityClaimNumList)}</span>
                  </div>
                )}
                {trademark.priorityClaimDateList.length > 0 && (
                  <div className="info-item">
                    <span className="info-label">우선권 일자</span>
                    <span className="info-value">
                      {trademark.priorityClaimDateList.map(formatDate).join(', ')}
                    </span>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>

        {/* 모달 푸터 */}
        <div className="modal-footer">
          <button className="close-modal-btn" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrademarkModal;
