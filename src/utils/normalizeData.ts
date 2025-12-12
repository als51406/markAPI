import type { KRTrademark, USTrademark, JPTrademark, Trademark } from '../types/trademark';

// 한국 데이터를 통합 형식으로 변환
export const normalizeKRTrademark = (data: KRTrademark): Trademark => {
  // 표시용 상표명: 한글이 있으면 한글, 없으면 영문
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
    registrationNumber: data.registrationNumber || [],
    registrationDate: (data.registrationDate || []).filter((d): d is string => d !== null),
    registrationPubNumber: data.registrationPubNumber,
    registrationPubDate: data.registrationPubDate,
    internationalRegDate: data.internationalRegDate,
    internationalRegNumbers: data.internationalRegNumbers || [],
    priorityClaimNumList: data.priorityClaimNumList || [],
    priorityClaimDateList: data.priorityClaimDateList || [],
    classificationCodes: data.asignProductMainCodeList || [],
    subClassificationCodes: data.asignProductSubCodeList || [],
    viennaCodeList: data.viennaCodeList || [],
  };
};

// 미국 데이터를 통합 형식으로 변환
export const normalizeUSTrademark = (data: USTrademark): Trademark => {
  return {
    id: `US-${data.applicationNumber}`,
    country: 'US',
    productName: data.productName || '(No Name)',
    productNameKr: null, // 미국은 한글명 없음
    productNameEng: data.productName,
    applicationNumber: data.applicationNumber,
    applicationDate: data.applicationDate,
    registerStatus: data.registerStatus,
    publicationNumber: null, // 미국은 공고번호 없음
    publicationDate: data.publicationDate,
    registrationNumber: data.registrationNumber || [],
    registrationDate: (data.registrationDate || []).filter((d): d is string => d !== null),
    registrationPubNumber: null, // 미국은 등록공고 없음
    registrationPubDate: null,
    internationalRegDate: data.internationalRegDate,
    internationalRegNumbers: data.internationalRegNumbers || [],
    priorityClaimNumList: data.priorityClaimNumList || [],
    priorityClaimDateList: data.priorityClaimDateList || [],
    classificationCodes: data.asignProductMainCodeList || [],
    subClassificationCodes: data.usClassCodeList || [], // US 코드
    viennaCodeList: data.viennaCodeList || [],
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

// 일본 데이터를 통합 형식으로 변환
export const normalizeJPTrademark = (data: JPTrademark): Trademark => {
  // 일본 날짜 형식 (YYYY-MM-DD) -> YYYYMMDD 변환
  const formatDate = (date: string | null): string => {
    if (!date) return '';
    return date.replace(/-/g, '');
  };

  return {
    id: `JP-${data.applicationNumber}`,
    country: 'JP',
    productName: data.trademarkName || data.trademarkNameEn || '(商標名なし)',
    productNameKr: null, // 일본은 한글명 없음
    productNameEng: data.trademarkNameEn,
    applicationNumber: data.applicationNumber,
    applicationDate: formatDate(data.applicationDate),
    registerStatus: JP_STATUS_MAP[data.status] || data.status,
    publicationNumber: null,
    publicationDate: null,
    registrationNumber: data.registrationNumber ? [data.registrationNumber] : [],
    registrationDate: data.registrationDate ? [formatDate(data.registrationDate)] : [],
    registrationPubNumber: null,
    registrationPubDate: null,
    internationalRegDate: null,
    internationalRegNumbers: [],
    priorityClaimNumList: [],
    priorityClaimDateList: [],
    classificationCodes: data.classificationCodes || [],
    subClassificationCodes: [],
    viennaCodeList: [],
  };
};
