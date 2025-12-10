import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import type { ChartOptions, TooltipItem } from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { KRTrademark, USTrademark } from '../types/trademark';

// Chart.js 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface YearlyComparisonChartProps {
  krTrademarks: KRTrademark[];
  usTrademarks: USTrademark[];
}

// 연도별 출원 건수 계산 함수
function getYearlyCount(
  krTrademarks: KRTrademark[],
  usTrademarks: USTrademark[]
): { years: string[]; krCounts: number[]; usCounts: number[] } {
  const krYearMap = new Map<string, number>();
  const usYearMap = new Map<string, number>();

  // 한국 상표 연도별 집계
  krTrademarks.forEach((trademark) => {
    if (trademark.applicationDate) {
      const year = trademark.applicationDate.substring(0, 4);
      krYearMap.set(year, (krYearMap.get(year) || 0) + 1);
    }
  });

  // 미국 상표 연도별 집계
  usTrademarks.forEach((trademark) => {
    if (trademark.applicationDate) {
      const year = trademark.applicationDate.substring(0, 4);
      usYearMap.set(year, (usYearMap.get(year) || 0) + 1);
    }
  });

  // 모든 연도 수집 및 정렬
  const allYears = new Set([...krYearMap.keys(), ...usYearMap.keys()]);
  const sortedYears = Array.from(allYears).sort();

  // 각 연도별 데이터 배열 생성
  const krCounts = sortedYears.map((year) => krYearMap.get(year) || 0);
  const usCounts = sortedYears.map((year) => usYearMap.get(year) || 0);

  return { years: sortedYears, krCounts, usCounts };
}

export default function YearlyComparisonChart({
  krTrademarks,
  usTrademarks,
}: YearlyComparisonChartProps) {
  const { years, krCounts, usCounts } = getYearlyCount(krTrademarks, usTrademarks);

  const data = {
    labels: years,
    datasets: [
      {
        label: '한국 (KR)',
        data: krCounts,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.3,
        pointRadius: 5,
        pointHoverRadius: 8,
      },
      {
        label: '미국 (US)',
        data: usCounts,
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        tension: 0.3,
        pointRadius: 5,
        pointHoverRadius: 8,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14,
          },
        },
      },
      title: {
        display: true,
        text: '연도별 상표 출원 추이 비교',
        font: {
          size: 18,
          weight: 'bold',
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: TooltipItem<'line'>) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value}건`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: '연도',
          font: {
            size: 14,
          },
        },
      },
      y: {
        title: {
          display: true,
          text: '출원 건수',
          font: {
            size: 14,
          },
        },
        beginAtZero: true,
        ticks: {
          stepSize: 10,
        },
      },
    },
  };

  if (years.length === 0) {
    return (
      <div className="chart-container">
        <p className="no-data">데이터가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <div className="chart-wrapper">
        <Line data={data} options={options} />
      </div>
      <div className="chart-summary">
        <div className="summary-item">
          <span className="country-badge kr">한국</span>
          <span>총 {krTrademarks.length}건</span>
        </div>
        <div className="summary-item">
          <span className="country-badge us">미국</span>
          <span>총 {usTrademarks.length}건</span>
        </div>
      </div>
    </div>
  );
}
