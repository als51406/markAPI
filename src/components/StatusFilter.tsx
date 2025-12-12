import type { Country } from '../types/trademark';

interface StatusFilterProps {
  selectedStatuses: string[];
  onStatusChange: (statuses: string[]) => void;
  country: Country;
}

// 국가별 상태 옵션
const STATUS_OPTIONS: Record<Country, { value: string; label: string }[]> = {
  KR: [
    { value: '등록', label: '등록' },
    { value: '출원', label: '출원' },
    { value: '공고', label: '공고' },
    { value: '거절', label: '거절' },
    { value: '실효', label: '실효' },
    { value: '소멸', label: '소멸' },
    { value: '취하', label: '취하' },
    { value: '포기', label: '포기' },
    { value: '무효', label: '무효' },
  ],
  US: [
    { value: 'LIVE', label: 'LIVE (유효)' },
    { value: 'DEAD', label: 'DEAD (무효)' },
  ],
  JP: [
    { value: '등록', label: '등록' },
    { value: '출원', label: '출원' },
    { value: '거절', label: '거절' },
    { value: '실효', label: '실효' },
    { value: '취하', label: '취하' },
  ],
};

const StatusFilter = ({ selectedStatuses, onStatusChange, country }: StatusFilterProps) => {
  const options = STATUS_OPTIONS[country];

  // 체크박스 토글 핸들러
  const handleToggle = (status: string) => {
    if (selectedStatuses.includes(status)) {
      // 이미 선택되어 있으면 제거
      onStatusChange(selectedStatuses.filter((s) => s !== status));
    } else {
      // 선택 안 되어 있으면 추가
      onStatusChange([...selectedStatuses, status]);
    }
  };

  // 전체 선택/해제 핸들러
  const handleSelectAll = () => {
    if (selectedStatuses.length === options.length) {
      // 전체 선택 상태면 전체 해제
      onStatusChange([]);
    } else {
      // 아니면 전체 선택
      onStatusChange(options.map((opt) => opt.value));
    }
  };

  const isAllSelected = selectedStatuses.length === options.length;

  return (
    <div className="status-filter">
      <div className="status-filter-header">
        <span className="filter-label">등록 상태:</span>
        <button
          type="button"
          className={`select-all-btn ${isAllSelected ? 'active' : ''}`}
          onClick={handleSelectAll}
        >
          {isAllSelected ? '전체 해제' : '전체 선택'}
        </button>
      </div>
      <div className="status-options">
        {options.map((option) => (
          <label key={option.value} className="status-checkbox">
            <input
              type="checkbox"
              checked={selectedStatuses.includes(option.value)}
              onChange={() => handleToggle(option.value)}
            />
            <span className={`checkbox-label ${option.value}`}>{option.label}</span>
          </label>
        ))}
      </div>
      {selectedStatuses.length > 0 && (
        <p className="selected-count">
          {selectedStatuses.length}개 상태 선택됨
        </p>
      )}
    </div>
  );
};

export default StatusFilter;
