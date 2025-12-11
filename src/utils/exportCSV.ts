import type { Trademark } from '../types/trademark';

/**
 * 날짜 포맷팅 (YYYYMMDD -> YYYY-MM-DD)
 */
const formatDateForCSV = (dateStr: string): string => {
  if (!dateStr || dateStr.length !== 8) return dateStr || '';
  return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
};

/**
 * CSV 특수문자 이스케이프 처리
 */
const escapeCSV = (value: string | null | undefined): string => {
  if (value === null || value === undefined) return '';
  const str = String(value);
  // 쉼표, 줄바꿈, 따옴표가 포함된 경우 따옴표로 감싸기
  if (str.includes(',') || str.includes('\n') || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

/**
 * 배열을 문자열로 변환
 */
const arrayToString = (arr: string[]): string => {
  if (!arr || arr.length === 0) return '';
  return arr.join('; ');
};

/**
 * Trademark 배열을 CSV 문자열로 변환
 */
export const convertToCSV = (data: Trademark[]): string => {
  if (data.length === 0) return '';

  // CSV 헤더
  const headers = [
    '국가',
    '상표명',
    '한글명',
    '영문명',
    '출원번호',
    '출원일',
    '등록상태',
    '공고번호',
    '공고일',
    '등록번호',
    '등록일',
    '국제등록일',
    '국제등록번호',
    '우선권번호',
    '우선권일',
    '분류코드',
    '비엔나코드',
  ];

  // 데이터 행 생성
  const rows = data.map((item) => [
    escapeCSV(item.country === 'KR' ? '한국' : '미국'),
    escapeCSV(item.productName),
    escapeCSV(item.productNameKr),
    escapeCSV(item.productNameEng),
    escapeCSV(item.applicationNumber),
    escapeCSV(formatDateForCSV(item.applicationDate)),
    escapeCSV(item.registerStatus),
    escapeCSV(item.publicationNumber),
    escapeCSV(formatDateForCSV(item.publicationDate || '')),
    escapeCSV(arrayToString(item.registrationNumber)),
    escapeCSV(arrayToString(item.registrationDate.map(formatDateForCSV))),
    escapeCSV(formatDateForCSV(item.internationalRegDate || '')),
    escapeCSV(arrayToString(item.internationalRegNumbers)),
    escapeCSV(arrayToString(item.priorityClaimNumList)),
    escapeCSV(arrayToString(item.priorityClaimDateList.map(formatDateForCSV))),
    escapeCSV(arrayToString(item.classificationCodes)),
    escapeCSV(arrayToString(item.viennaCodeList)),
  ]);

  // BOM + 헤더 + 데이터
  const BOM = '\uFEFF'; // UTF-8 BOM for Excel compatibility
  return BOM + [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
};

/**
 * CSV 파일 다운로드
 */
export const downloadCSV = (data: Trademark[], filename: string = 'trademarks'): void => {
  const csv = convertToCSV(data);
  
  if (!csv) {
    alert('내보낼 데이터가 없습니다.');
    return;
  }

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};
