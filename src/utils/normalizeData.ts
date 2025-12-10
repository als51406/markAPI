import type { KRTrademark, USTrademark, Trademark } from '../types/trademark';

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
