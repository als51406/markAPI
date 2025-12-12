// 한국 상표 데이터 타입 (원본)
export interface KRTrademark {
  productName: string | null;
  productNameEng: string | null;
  applicationNumber: string;
  applicationDate: string;
  registerStatus: string;
  publicationNumber: string | null;
  publicationDate: string | null;
  registrationNumber: string[] | null;
  registrationDate: (string | null)[] | null;
  registrationPubNumber: string | null;
  registrationPubDate: string | null;
  internationalRegDate: string | null;
  internationalRegNumbers: string[] | null;
  priorityClaimNumList: string[] | null;
  priorityClaimDateList: string[] | null;
  asignProductMainCodeList: string[] | null;
  asignProductSubCodeList: string[] | null;
  viennaCodeList: string[] | null;
}

// 미국 상표 데이터 타입 (원본)
export interface USTrademark {
  productName: string;
  applicationNumber: string;
  applicationDate: string;
  registerStatus: string;
  publicationDate: string | null;
  registrationNumber: string[] | null;
  registrationDate: (string | null)[] | null;
  internationalRegDate: string | null;
  internationalRegNumbers: string[] | null;
  priorityClaimNumList: string[] | null;
  priorityClaimDateList: string[] | null;
  asignProductMainCodeList: string[] | null;
  usClassCodeList: string[] | null;
  viennaCodeList: string[] | null;
}

// 일본 상표 데이터 타입 (원본)
export interface JPTrademark {
  registrationNumber: string;
  applicationNumber: string;
  applicationDate: string;
  registrationDate: string | null;
  trademarkName: string;
  trademarkNameEn: string | null;
  applicant: string;
  status: string;
  classificationCodes: string[];
}

// 국가 타입
export type Country = 'KR' | 'US' | 'JP';

// 통합 상표 타입 (정규화된 데이터)
export interface Trademark {
  id: string; // applicationNumber를 기반으로 생성
  country: Country;
  productName: string; // 표시용 상표명
  productNameKr: string | null; // 한글 상표명 (한국만)
  productNameEng: string | null; // 영문 상표명
  applicationNumber: string;
  applicationDate: string; // YYYYMMDD 형식 유지
  registerStatus: string; // 원본 상태 유지
  publicationNumber: string | null;
  publicationDate: string | null;
  registrationNumber: string[];
  registrationDate: string[];
  registrationPubNumber: string | null; // 한국만
  registrationPubDate: string | null; // 한국만
  internationalRegDate: string | null;
  internationalRegNumbers: string[];
  priorityClaimNumList: string[];
  priorityClaimDateList: string[];
  classificationCodes: string[]; // 주 분류 코드
  subClassificationCodes: string[]; // 유사군(KR) 또는 US코드
  viennaCodeList: string[];
}

// 검색 필터 타입
export interface SearchFilters {
  query: string; // 상표명 검색어
  applicationNumber: string; // 출원번호 검색
  statuses: string[]; // 선택된 상태들
  dateFrom: string; // 시작일
  dateTo: string; // 종료일
}

// 초기 필터 상태
export const initialFilters: SearchFilters = {
  query: '',
  applicationNumber: '',
  statuses: [],
  dateFrom: '',
  dateTo: '',
};
