/**
 * 국가별 설정 파일
 * 
 * 새로운 국가를 추가하려면:
 * 1. COUNTRY_CONFIG에 국가 설정 추가
 * 2. /public에 해당 국가 JSON 파일 추가
 * 3. types/trademark.ts에 해당 국가 원본 타입 추가 (필요시)
 * 4. utils/normalizers.ts에 정규화 함수 추가 (필요시)
 */

export interface CountryConfig {
  code: string;           // 국가 코드 (KR, US, JP 등)
  name: string;           // 표시 이름
  flag: string;           // 이모지 플래그
  dataFile: string;       // JSON 파일 경로
  normalizer: string;     // 정규화 함수 이름
  statusMapping?: Record<string, string>;  // 상태값 매핑 (필요시)
}

/**
 * 국가 설정
 * - 새 국가 추가 시 이 객체에 설정만 추가하면 됨
 */
export const COUNTRY_CONFIG: Record<string, CountryConfig> = {
  KR: {
    code: 'KR',
    name: '한국',
    flag: '🇰🇷',
    dataFile: '/trademarks_kr_trademarks.json',
    normalizer: 'normalizeKRData',
  },
  US: {
    code: 'US',
    name: '미국',
    flag: '🇺🇸',
    dataFile: '/trademarks_us_trademarks.json',
    normalizer: 'normalizeUSData',
  },
  JP: {
    code: 'JP',
    name: '일본',
    flag: '🇯🇵',
    dataFile: '/trademarks_jp_trademarks.json',
    normalizer: 'normalizeJPData',
  },
};

/**
 * 지원 국가 코드 목록
 */
export const SUPPORTED_COUNTRIES = Object.keys(COUNTRY_CONFIG) as Array<keyof typeof COUNTRY_CONFIG>;

/**
 * 국가 코드 타입 (동적 생성)
 */
export type CountryCode = keyof typeof COUNTRY_CONFIG;

/**
 * 기본 선택 국가
 */
export const DEFAULT_COUNTRY: CountryCode = 'KR';

/**
 * 국가 설정 가져오기
 */
export const getCountryConfig = (code: CountryCode): CountryConfig => {
  return COUNTRY_CONFIG[code];
};

/**
 * 모든 국가 설정 배열로 가져오기
 */
export const getAllCountryConfigs = (): CountryConfig[] => {
  return Object.values(COUNTRY_CONFIG);
};
