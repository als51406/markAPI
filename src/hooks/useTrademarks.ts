import { useState, useEffect } from 'react';
import type { KRTrademark, USTrademark, Trademark, Country } from '../types/trademark';
import { normalizeKRTrademark, normalizeUSTrademark } from '../utils/normalizeData';

interface UseTrademarkReturn {
  trademarks: Trademark[];
  isLoading: boolean;
  error: string | null;
  selectedCountry: Country;
  setSelectedCountry: (country: Country) => void;
}

export const useTrademarks = (): UseTrademarkReturn => {
  const [krData, setKrData] = useState<Trademark[]>([]);
  const [usData, setUsData] = useState<Trademark[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<Country>('KR');

  // 데이터 불러오기
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // 한국, 미국 데이터 동시에 불러오기
        const [krResponse, usResponse] = await Promise.all([
          fetch('/trademarks_kr_trademarks.json'),
          fetch('/trademarks_us_trademarks.json'),
        ]);

        if (!krResponse.ok || !usResponse.ok) {
          throw new Error('데이터를 불러오는데 실패했습니다.');
        }

        const krRawData: KRTrademark[] = await krResponse.json();
        const usRawData: USTrademark[] = await usResponse.json();

        // 데이터 정규화
        const normalizedKR = krRawData.map(normalizeKRTrademark);
        const normalizedUS = usRawData.map(normalizeUSTrademark);

        setKrData(normalizedKR);
        setUsData(normalizedUS);

        console.log('✅ 데이터 로드 완료!');
        console.log(`   한국: ${normalizedKR.length}건`);
        console.log(`   미국: ${normalizedUS.length}건`);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
        setError(errorMessage);
        console.error('❌ 데이터 로드 실패:', errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // 선택된 국가에 따른 데이터 반환
  const trademarks = selectedCountry === 'KR' ? krData : usData;

  return {
    trademarks,
    isLoading,
    error,
    selectedCountry,
    setSelectedCountry,
  };
};
