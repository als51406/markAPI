interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  onPageChange: (page: number) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
}

const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  startIndex,
  endIndex,
  onPageChange,
  onPrevPage,
  onNextPage,
}: PaginationProps) => {
  // 표시할 페이지 번호 계산 (최대 5개)
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // 끝에서 시작 조정
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="pagination-container">
      {/* 현재 표시 정보 */}
      <div className="pagination-info">
        <span>
          {totalItems > 0 
            ? `${startIndex + 1} - ${endIndex} / 총 ${totalItems}건`
            : '결과 없음'}
        </span>
      </div>

      {/* 페이지네이션 컨트롤 */}
      {totalPages > 1 && (
        <div className="pagination-controls">
          {/* 처음으로 */}
          <button
            className="page-btn"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            title="처음 페이지"
          >
            ««
          </button>
          
          {/* 이전 */}
          <button
            className="page-btn"
            onClick={onPrevPage}
            disabled={currentPage === 1}
            title="이전 페이지"
          >
            «
          </button>

          {/* 페이지 번호들 */}
          <div className="page-numbers">
            {getPageNumbers().map((page) => (
              <button
                key={page}
                className={`page-btn number ${currentPage === page ? 'active' : ''}`}
                onClick={() => onPageChange(page)}
              >
                {page}
              </button>
            ))}
          </div>

          {/* 다음 */}
          <button
            className="page-btn"
            onClick={onNextPage}
            disabled={currentPage === totalPages}
            title="다음 페이지"
          >
            »
          </button>

          {/* 마지막으로 */}
          <button
            className="page-btn"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            title="마지막 페이지"
          >
            »»
          </button>
        </div>
      )}
    </div>
  );
};

export default Pagination;
