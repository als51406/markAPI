# 🔍 다국가 상표 검색 서비스
안녕하세요, 신입 인터랙티브 프론트엔드 개발자 김민성입니다.
최근 한국IT교육원에서 프론트엔드 과정을 이수중입니다. 라우팅이나 페이지네이션같은 액티브한 프론트엔드 기술위주로 배웠기때문에 데이터관리측면에서의 프론트엔드 경험은 이번 과제를 통해서 학습하게 되었습니다.
그래서 과제를 수행하기위해 데이터관리측면에서 약간의 학습을 진행하였으며 AI를 적극 사용하였음을 알립니다.


## 💡 TypeScript로 협업하기 좋은 코드 만들기

이번 프로젝트를 진행하면서 "TypeScript"가 팀 협업에 얼마나 도움이 되는지 직접 느낄 수 있었습니다.

### 왜 TypeScript를 선택했나요?

처음에는 "JavaScript로도 충분히 할 수 있는데 굳이 TypeScript를 써야 하나?"라는 생각이 있었습니다. 하지만 다국가 상표 데이터를 다루면서 **각 나라마다 데이터 구조가 다르다**는 것을 깨달았고, 이걸 관리하려면 타입 정의가 필수라고 느꼈습니다.

### interface로 데이터 구조를 미리 정의하면 좋은 점

```typescript
// 📌 국가별 원본 데이터 타입을 미리 정의해두니까...
interface KRTrademark {
  applicationNumber: string;
  productName?: string;        // 한국은 한글/영문 이름이 따로
  productNameEng?: string;
  // ...
}

interface USTrademark {
  applicationNumber: string;
  productName: string;         // 미국은 이름 하나
  // ...
}

// 📌 정규화 후 통일된 형태로 사용
interface Trademark {
  id: string;
  country: 'KR' | 'US' | 'JP';
  productName: string;
  // ...
}
```

**실제로 느꼈던 장점들:**

1. **오타나 잘못된 필드명을 미리 잡아줘요**
   - `item.productname` (소문자 n) 같은 실수를 빌드 전에 발견할 수 있었습니다
   
2. **자동완성이 너무 편해요**
   - `item.` 찍으면 어떤 필드가 있는지 바로 보여서 API 문서를 매번 확인할 필요가 없었습니다

3. **나중에 새로운 국가를 추가할 때 편해요**
   - 일본(JP)을 추가할 때 `interface JPTrademark`를 정의하고, `Country` 타입에 `'JP'`만 추가하면 어디를 수정해야 하는지 TypeScript가 알려줬습니다

4. **다른 사람이 코드를 볼 때 이해하기 쉬워요**
   - interface만 보면 "아, 이 데이터는 이런 구조구나" 바로 파악할 수 있습니다

솔직히 처음에는 타입 정의하는 게 번거롭다고 느꼈는데, 프로젝트가 커질수록 **"미리 정의해둔 타입 덕분에 버그를 줄일 수 있었구나"** 라고 느꼈습니다. 특히 런타임에서 `undefined` 에러가 나는 것보다 빌드 단계에서 미리 잡는 게 훨씬 낫더라고요.

---

## 📋 목차

- [TypeScript로 협업하기 좋은 코드 만들기](#-typescript로-협업하기-좋은-코드-만들기)
- [핵심 설계 철학](#-핵심-설계-철학)
- [프로젝트 실행 방법](#-프로젝트-실행-방법)
- [주요 기능](#-주요-기능)
- [폴더 및 컴포넌트 구조](#-폴더-및-컴포넌트-구조)
- [기술적 의사결정](#-기술적-의사결정)
- [다국가 데이터 처리 설계](#-다국가-데이터-처리-설계)
- [문제 해결 과정](#-문제-해결-과정)
- [개선하고 싶은 부분](#-개선하고-싶은-부분)

---

## 🎯 핵심 설계 철학

프로젝트를 시작하기 전에 "어떤 기준으로 설계할까?" 고민을 많이 했습니다. 여러 자료를 찾아보고 나름대로 정리한 3가지 원칙인데, 부족한 부분이 있을 수 있지만 최대한 일관되게 지키려고 노력했습니다.

### 1. "적정 기술" - 문제에 맞는 도구 선택하기

> 💡 **처음엔 Redux를 써야 하나 고민했는데, 결국 React 기본 기능으로도 충분했어요**

- 외부 상태 관리 라이브러리(Redux, Zustand) 대신 **React useState + Custom Hooks**를 선택했습니다
- 이유: 컴포넌트 트리가 2~3단계로 얕고, 전역으로 공유해야 할 상태가 거의 없었어요
- 결과: 의존성 최소화 → 번들 크기 380KB 정도로 유지할 수 있었습니다

솔직히 Redux나 Zustand가 멋있어 보여서 쓰고 싶은 마음도 있었는데, "이 프로젝트 규모에 맞는가?"를 먼저 생각해보니 굳이 필요 없겠다 싶었습니다.

### 2. "정규화 우선" - 데이터를 한 번 정리해두면 나중이 편해요

> 💡 **한국/미국/일본 데이터 구조가 다 달라서 처음엔 혼란스러웠어요**

- 각 나라 원본 데이터를 **fetch 직후 바로 정규화**(통일된 형태로 변환)했습니다
- 덕분에 검색, 필터, 정렬 로직에서 "한국이면 이렇게, 미국이면 저렇게" 분기문을 쓸 필요가 없어졌어요
- 새로운 나라(일본)를 추가할 때도 정규화 함수만 하나 더 만들면 돼서 확장이 쉬웠습니다

처음에는 "그냥 필요할 때마다 조건문 쓰면 되지 않나?"라고 생각했는데, 코드가 점점 복잡해지는 걸 보고 정규화의 중요성을 깨달았습니다.

### 3. "관심사 분리" - 로직과 UI를 나누면 테스트도, 수정도 쉬워요

> 💡 **훅(Hook)은 "무엇을 할지", 컴포넌트는 "어떻게 보여줄지"만 담당하게 했어요**

- `useSearch`, `usePagination`, `useFavorites` 등 기능별로 커스텀 훅을 만들어서 로직을 분리했습니다
- 컴포넌트는 props로 데이터를 받아서 화면에 그려주는 역할만 해요
- 나중에 테스트 코드를 작성한다면, 훅만 따로 테스트할 수 있어서 좋을 것 같습니다

---

## 🚀 프로젝트 실행 방법

### 사전 요구사항

- Node.js 18.x 이상
- npm 또는 yarn

### 설치 및 실행

```bash
# 1. 의존성 설치
npm install

# 2. 개발 서버 실행
npm run dev

# 3. 브라우저에서 확인
npx vite
# http://localhost:5173
```

### 기타 스크립트

```bash
# 프로덕션 빌드
npm run build

# 빌드 결과물 미리보기
npm run preview

# 린트 검사
npm run lint
```

---

## ✨ 주요 기능

이 프로젝트에서 구현한 기능들을 정리해봤습니다. 처음 해보는 것들도 있어서 시행착오가 좀 있었지만, 하나씩 완성해가는 과정이 재미있었습니다.

| 기능 | 설명 |
|------|------|
| **다국가 상표 검색** | 한국/미국/일본 상표 데이터 통합 검색 (상표명, 출원번호) |
| **상태 필터링** | 등록상태별 필터 (등록, 실효, 거절, 출원 / LIVE, DEAD 등) |
| **출원일 범위 검색** | 시작일~종료일 기간 필터링 |
| **정렬** | 출원일순/상표명순 오름차순·내림차순 |
| **페이지네이션** | 20개 단위 페이지 분할, 키보드(←/→) 이동 |
| **즐겨찾기** | localStorage 기반 즐겨찾기 저장/필터 |
| **상세 모달** | 클릭 시 전체 상표 정보 확인 |
| **연도별 출원 추이 차트** | Chart.js 기반 KR/US/JP 비교 라인 차트 |
| **CSV 내보내기** | 전체/선택 항목 CSV 다운로드 (Excel 호환 UTF-8 BOM) |
| **다크 모드** | 시스템 설정 감지 + 수동 토글, localStorage 저장 |
| **키보드 단축키** | 페이지 이동, 탭 전환, 즐겨찾기, 차트, 다크모드 토글 |

### 키보드 단축키

키보드 단축키는 처음 구현해봤는데, 사용성이 좋아지는 걸 느꼈습니다.

| 단축키 | 기능 |
|--------|------|
| `←` / `→` | 이전/다음 페이지 |
| `1` / `2` / `3` | 한국/미국/일본 탭 전환 |
| `F` | 즐겨찾기 필터 토글 |
| `C` | 차트 표시 토글 |
| `D` | 다크 모드 토글 |
| `ESC` | 모달 닫기 |

---

## 📁 폴더 및 컴포넌트 구조

폴더 구조를 어떻게 잡을지 고민을 많이 했는데, 나름대로 기능별로 나눠봤습니다. 더 좋은 구조가 있을 수 있지만, 현재 프로젝트 규모에서는 이 정도가 적당한 것 같았습니다.

```
src/
├── App.tsx                 # 메인 앱 컴포넌트 (상태 관리 및 레이아웃)
├── App.css                 # 전역 스타일 + CSS 변수 테마
├── main.tsx                # React 엔트리포인트
├── index.css               # 기본 CSS 리셋
│
├── components/             # UI 컴포넌트
│   ├── SearchBar.tsx       # 검색 입력 폼 (상표명, 출원번호, 기간)
│   ├── StatusFilter.tsx    # 등록상태 체크박스 필터
│   ├── Pagination.tsx      # 페이지네이션 컨트롤
│   ├── TrademarkModal.tsx  # 상표 상세 정보 모달
│   └── YearlyComparisonChart.tsx  # 연도별 출원 추이 차트
│
├── config/                 # 설정 파일
│   └── countries.ts        # 국가별 설정 (추가 국가 확장 시 여기만 수정)
│
├── hooks/                  # 커스텀 훅 (로직 분리)
│   ├── useSearch.ts        # 검색/필터링 로직
│   ├── usePagination.ts    # 페이지네이션 상태 관리
│   ├── useFavorites.ts     # 즐겨찾기 (localStorage 연동)
│   ├── useDarkMode.ts      # 다크 모드 (시스템 감지 + 저장)
│   └── useTrademarks.ts    # 상표 데이터 fetch (선택적 사용)
│
├── types/                  # TypeScript 타입 정의
│   └── trademark.ts        # KRTrademark, USTrademark, JPTrademark, Trademark 등
│
├── utils/                  # 유틸리티 함수
│   ├── exportCSV.ts        # CSV 변환/다운로드
│   └── normalizeData.ts    # 데이터 정규화 함수
│
└── assets/                 # 정적 리소스
```

### 주요 컴포넌트 역할

각 컴포넌트가 어떤 역할을 하는지 정리해봤습니다.

| 컴포넌트 | 역할 |
|----------|------|
| `App.tsx` | 전역 상태 관리, 데이터 fetch, 레이아웃 조합 |
| `SearchBar` | 검색어/출원번호/기간 입력 UI, 필터 콜백 전달 |
| `StatusFilter` | 국가별 등록상태 체크박스, 다중 선택 |
| `Pagination` | 현재 페이지/전체 페이지 표시, 페이지 이동 버튼 |
| `TrademarkModal` | 선택된 상표의 전체 정보 표시, ESC로 닫기 |
| `YearlyComparisonChart` | 원본(raw) 데이터 기반 연도별 집계 + 라인 차트 |

---

## 🛠 기술적 의사결정

어떤 기술을 사용할지 결정하는 과정에서 고민했던 내용들을 정리해봤습니다. 정답이 있는 건 아니지만, 왜 이 기술을 선택했는지 나름의 이유를 적어봤어요.

### 1. 상태 관리: React useState + Custom Hooks

#### 🤔 처음에 고민했던 선택지들

| 선택지 | 장점 | 단점 |
|--------|------|------|
| **Redux** | 예측 가능한 상태, DevTools 좋음 | 보일러플레이트가 많고, 이 규모에선 좀 과한 것 같았어요 |
| **Zustand** | 간단한 API, 코드가 적음 | 그래도 추가 의존성이 생기는 게 망설여졌어요 |
| **React Query** | 서버 상태 캐싱 최적화 | 로컬 JSON 파일이라 서버 상태 관리가 필요 없었어요 |
| **useState + Hooks** ✅ | 의존성 없음, React 기본 기능만 활용 | 대규모 앱에서는 한계가 있을 수 있어요 |

#### ✅ 최종 선택: useState + Custom Hooks

**이렇게 결정한 이유:**
```
- 컴포넌트 트리 깊이: 최대 3단계 정도 (App → SearchBar/List → Card)
- 전역 공유 상태: 거의 없음 (각 기능이 독립적으로 동작해요)
- 데이터 소스: 로컬 JSON 파일 (서버 상태 관리가 필요 없었어요)
```

**만약 Redux를 썼다면?**
- `createSlice`, `configureStore`, `Provider` 설정하느라 100줄 이상 추가됐을 거예요
- 근데 props drilling이 거의 발생하지 않아서 실제로 얻는 이점은 적었을 것 같아요

#### 💡 Custom Hooks를 만들면서 느낀 점

```typescript
// 각 훅이 하나의 기능만 담당하니까 관리가 편했어요
const { filters, filteredData, updateFilter } = useSearch(data);
const { currentPage, goToPage, totalPages } = usePagination({ totalItems });
const { isFavorite, toggleFavorite } = useFavorites();
```

- **테스트하기 좋아요**: 훅만 따로 테스트할 수 있어요 (아직 테스트 코드는 못 작성했지만...)
- **재사용하기 좋아요**: 다른 프로젝트에서도 이 훅들을 복사해서 쓸 수 있을 것 같아요
- **읽기 편해요**: App.tsx에서 복잡한 로직 대신 훅 호출만 보여서 깔끔해졌어요

---

### 2. 스타일링: 순수 CSS + CSS 변수

#### 🤔 고민했던 선택지들

| 선택지 | 장점 | 단점 |
|--------|------|------|
| **Tailwind CSS** | 빠르게 개발 가능, 일관된 디자인 | 과제에서 사용하지 말라고 했어요 |
| **CSS Modules** | 스코프 격리 | 파일이 많아지는 게 좀 번거로웠어요 |
| **styled-components** | CSS-in-JS 편리함 | 런타임 비용이 있고 의존성이 추가돼요 |
| **순수 CSS + 변수** ✅ | 의존성 없음, 브라우저가 기본으로 지원 | 수동으로 관리해야 해요 |

#### ✅ 최종 선택: 순수 CSS + CSS 변수

**이렇게 결정한 이유:**
- 과제 요구사항에서 "Tailwind CSS 없이 구현"이라고 했어요
- 다크 모드 구현할 때 CSS 변수가 정말 깔끔하더라고요

```css
/* 테마 전환이 이렇게 간단해요! */
:root { --bg-primary: #f5f5f5; }
:root.dark { --bg-primary: #1a1a2e; }

/* 모든 컴포넌트에서 똑같이 사용 */
.card { background: var(--bg-primary); }
```

**JavaScript로 테마 관리 vs CSS 변수:**
- JS로 하면: 모든 컴포넌트가 리렌더링돼서 성능이 안 좋을 수 있어요
- CSS 변수로 하면: 브라우저가 네이티브로 처리해서 **리렌더링이 없어요**

```css
:root {
  --bg-primary: #f5f5f5;
  --text-primary: #333333;
  /* ... */
}
:root.dark {
  --bg-primary: #1a1a2e;
  --text-primary: #eaeaea;
}
```

CSS 변수를 처음 써봤는데, 생각보다 편리해서 앞으로도 자주 쓸 것 같아요.

---

### 3. 차트: Chart.js + react-chartjs-2

| 선택지 | 고려 사항 |
|--------|-----------|
| **D3.js** | 엄청 강력하지만 러닝커브가 높아서 시간 내에 배우기 어려웠어요 |
| **Recharts** | 선언적이지만 번들 크기가 좀 컸어요 |
| **Chart.js** ✅ | 가볍고 설정이 간단해서 제가 필요한 기능은 충분했어요 |

**이렇게 결정한 이유:** 연도별 라인 차트 하나만 필요했기 때문에 가장 가벼운 옵션을 선택했어요.

---

### 4. 빌드 도구: Vite

**Webpack 대신 Vite를 선택한 이유:**
- **개발 서버 시작 속도**: Webpack은 몇 초 걸리는데, Vite는 거의 바로 시작돼요
- **HMR(Hot Module Replacement)**: 파일 수정하면 거의 즉시 반영돼서 개발할 때 답답하지 않았어요
- **ESM 네이티브**: 번들링 없이 브라우저가 직접 모듈을 로드해서 빠르대요

Create React App도 고려해봤는데, 요즘은 Vite가 대세라고 해서 이번 기회에 써봤어요. 실제로 써보니까 정말 빠르더라고요!

---

## 🌍 다국가 데이터 처리 설계

다국가 데이터를 어떻게 처리할지가 이 프로젝트에서 가장 고민을 많이 한 부분이에요. 한국, 미국, 일본 데이터가 각각 다른 구조를 가지고 있어서 처음엔 꽤 혼란스러웠습니다.

### 🤔 왜 정규화가 필요했을까요?

#### 만약 정규화 없이 구현했다면?

```typescript
// ❌ 모든 곳에서 국가별로 조건문을 써야 했을 거예요...
const getName = (item: KRTrademark | USTrademark, country: Country) => {
  if (country === 'KR') {
    return (item as KRTrademark).productName || (item as KRTrademark).productNameEng;
  }
  return (item as USTrademark).productName;
};

// 검색할 때도...
const search = (query: string, data: any[], country: Country) => {
  if (country === 'KR') { /* KR 로직 */ }
  else { /* US 로직 */ }
};

// 정렬할 때도, 필터할 때도, 표시할 때도 다 이런 식...
```

**이게 뭐가 문제였냐면:**
- 새로운 나라를 추가할 때마다 모든 함수를 수정해야 해요
- `any`나 `as` 타입 단언을 많이 쓰게 되어서 타입 안전성이 떨어져요
- 실수할 확률이 높아지고 버그 찾기도 어려워져요

#### ✅ 정규화를 적용하니까?

```typescript
// 정규화는 데이터를 가져올 때 "한 번만" 해주면 돼요
const normalized: Trademark[] = rawData.map(normalizeKRData);

// 이후에는 모든 로직이 동일하게 동작해요!
const search = (query: string, data: Trademark[]) => {
  return data.filter(item => item.productName.includes(query));
};
// 국가 구분 없이 똑같은 코드!
```

처음에는 "정규화까지 할 필요가 있나?" 싶었는데, 일본을 추가할 때 정규화 함수 하나만 만들면 되니까 정말 편하더라고요.

---

### 한국/미국/일본 데이터 스키마 차이점

각 나라마다 필드 이름이나 구조가 달라서 정리해봤어요.

| 필드 | 한국 (KR) | 미국 (US) | 일본 (JP) | 정규화 후 |
|------|-----------|-----------|-----------|-----------|
| 상표명 | `productName` + `productNameEng` | `productName` | `productName` + `productNameJa` | `productName` (통합) |
| 등록상태 | `등록`, `실효`, `거절`, `출원` | `LIVE`, `DEAD` | `登録`, `出願`, `拒絶`, `失効`, `取下` | `registerStatus` (원본 유지) |
| 분류코드 | `asignProductSubCodeList` | `usClassCodeList` | `classificationCodes` | `subClassificationCodes` |
| 공고번호 | `publicationNumber` ✅ | ❌ 없음 | ❌ 없음 | `publicationNumber \| null` |

### 정규화할 때 지킨 원칙들

나름대로 정규화할 때 이런 규칙들을 정해서 일관성 있게 적용하려고 했어요.

1. **보여줄 이름은 하나로 통합**: `productName`에 화면에 표시할 이름 저장
2. **원본 값은 따로 보존**: `productNameKr`, `productNameEng` 등 원본도 유지
3. **없는 필드는 null로**: US에 없는 `publicationNumber`는 `null`로 통일
4. **배열은 빈 배열로 기본화**: `?? []`로 null 방지 (런타임 에러 예방)

```typescript
const normalizeKRData = (data: KRTrademark): Trademark => {
  // 표시용 이름: 한글 우선 → 영문 → 기본값
  const displayName = data.productName || data.productNameEng || '(상표명 없음)';
  
  return {
    id: `KR-${data.applicationNumber}`,  // 고유 ID 생성
    country: 'KR',
    productName: displayName,
    productNameKr: data.productName,      // 원본 보존
    productNameEng: data.productNameEng,  // 원본 보존
    // ...
    subClassificationCodes: data.asignProductSubCodeList ?? [],  // null → []
  };
};
```

### 등록상태는 왜 정규화하지 않았나요?

**결정:** 등록상태는 정규화하지 않고 **원본 그대로 유지**했어요.

```typescript
// 정규화할 때 상태값은 그대로 유지
registerStatus: data.registerStatus,  // "등록", "LIVE", "登録" 등 원본 그대로
```

**이유:**
- 상태값을 통일하면 (예: `REGISTERED`, `EXPIRED` 등) 원본 의미가 손실될 수 있어요
- 대신 **UI에서만 국가별로 다르게 표시**하는 방식을 선택했어요
- 데이터는 그대로 두고 보여주는 부분만 바꾸는 게 더 안전하다고 생각했어요

```tsx
// StatusFilter.tsx - UI에서만 국가별 옵션 분기
const KR_STATUSES = ['등록', '실효', '거절', '출원'];
const US_STATUSES = ['LIVE', 'DEAD'];
const JP_STATUSES = ['登録', '出願', '拒絶', '失効', '取下'];
const statuses = country === 'KR' ? KR_STATUSES : country === 'US' ? US_STATUSES : JP_STATUSES;
```

---

## 🧩 공통 컴포넌트는 어떻게 만들었나요?

컴포넌트를 만들 때 나름대로 지키려고 한 원칙들이에요. 처음엔 그냥 만들다가, 나중에 수정할 때 힘들어서 이런 규칙들을 정하게 됐어요.

### 설계 원칙

1. **Props 기반 제어:** 컴포넌트가 직접 상태를 가지지 않고, 부모에서 값과 콜백을 받아요
2. **단일 책임:** 각 컴포넌트는 하나의 역할만 하도록 했어요
3. **재사용성:** 특정 데이터 구조에 의존하지 않도록 일반적으로 만들려고 했어요

### 예시: Pagination 컴포넌트

```tsx
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
```

- 페이지 상태는 **usePagination 훅**에서 관리해요
- Pagination 컴포넌트는 **화면에 보여주고 버튼 클릭만 전달**하는 역할만 해요
- 덕분에 상표 목록 말고 다른 데이터에도 똑같은 컴포넌트를 쓸 수 있어요

---

## 🔧 문제 해결 과정

개발하면서 만났던 문제들과 어떻게 해결했는지 정리해봤어요. 처음엔 당황했던 것들도 있었는데, 하나씩 해결하면서 배운 게 많았습니다.

### 1. 🌏 한국/미국/일본 데이터 스키마가 다 다른 문제

| 상황 | 한국은 `productName`(한글) + `productNameEng`(영문), 미국/일본은 또 다른 구조 |
|------|------------|
| **처음 시도** | 컴포넌트마다 `if (country === 'KR')` 분기 → 코드가 너무 복잡해졌어요 |
| **최종 해결** | **정규화 함수**에서 한 번에 처리해서 이후에는 분기문 없이 사용 |
| **배운 점** | 데이터를 먼저 정리해두면 나중에 훨씬 편해요 |

```typescript
// 정규화에서 한 번만 처리 → 이후에는 item.productName만 쓰면 돼요
const displayName = data.productName || data.productNameEng || '(상표명 없음)';
```

---

### 2. 📊 차트 데이터 vs 검색 데이터가 다른 문제

| 상황 | 차트는 전체 데이터로 집계해야 하는데, 검색 결과는 필터링된 일부만 필요 |
|------|------------|
| **고민** | 정규화된 데이터만 있으면 차트에 필요한 원본 필드에 접근하기 어려웠어요 |
| **최종 해결** | **원본 데이터(rawData)와 정규화 데이터 둘 다 상태로 유지** |
| **트레이드오프** | 메모리를 좀 더 쓰지만, 로직이 단순해져요. 1,500건 정도에서는 문제없었어요 |

```typescript
// App.tsx 상태 구조
interface AppState {
  krTrademarks: Trademark[];      // 정규화 (검색/표시용)
  usTrademarks: Trademark[];
  jpTrademarks: Trademark[];
  krRawData: KRTrademark[];       // 원본 (차트용)
  usRawData: USTrademark[];
  jpRawData: JPTrademark[];
}
```

---

### 3. ⌨️ ESC 키로 모달 닫기 + 다른 단축키 충돌 문제

| 상황 | 모달이 열린 상태에서 다른 단축키(1, 2, F 등)가 동작하면 안 됐어요 |
|------|------------|
| **처음 시도** | 모달 컴포넌트에서만 ESC 처리 → 다른 키를 막지 못했어요 |
| **최종 해결** | **전역 핸들러에서 모달 상태를 먼저 체크**하도록 수정 |
| **배운 점** | 이벤트 처리 순서를 잘 생각해야 해요 |

```typescript
const handleKeyDown = (e: KeyboardEvent) => {
  // 모달이 열려있으면 다른 단축키 전부 무시
  if (selectedTrademark) {
    return;  // ESC는 모달 컴포넌트에서 따로 처리해요
  }
  // ... 나머지 단축키 로직
};
```

---

### 4. 📥 CSV 내보내기할 때 Excel에서 한글 깨지는 문제

| 상황 | 기본 UTF-8 CSV를 Excel에서 열면 한글이 `????`로 나왔어요 😱 |
|------|------------|
| **원인 분석** | Excel은 BOM(Byte Order Mark) 없는 UTF-8을 제대로 인식 못한대요 |
| **최종 해결** | **UTF-8 BOM**을 파일 맨 앞에 추가 |
| **배운 점** | 인코딩 문제는 처음 겪어봤는데 BOM이라는 걸 알게 됐어요 |

```typescript
const BOM = '\uFEFF';  // UTF-8 BOM (이게 마법의 문자열이에요)
const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
```

---

### 5. ⚛️ useEffect 의존성 경고 해결

| 상황 | 키보드 단축키 effect에서 ESLint가 계속 경고를 띄웠어요 |
|------|------------|
| **경고 내용** | "React Hook useEffect has a missing dependency" |
| **처음 시도** | `// eslint-disable-next-line` → 근본적인 해결이 아니었어요 |
| **최종 해결** | `handleCountryChange`를 `useCallback`으로 감싸서 의존성 배열에 포함 |
| **배운 점** | ESLint 경고를 그냥 무시하면 안 되고, 왜 뜨는지 이해하고 해결해야 해요 |

```typescript
// useCallback으로 함수를 안정화시켰어요
const handleCountryChange = useCallback((country: Country) => {
  setState(prev => ({ ...prev, selectedCountry: country }));
  resetFilters();
  pagination.resetPagination();
}, [pagination, resetFilters]);

// effect에서 안전하게 참조
useEffect(() => {
  // ...handleCountryChange 사용
}, [handleCountryChange, pagination, selectedTrademark, toggleTheme]);
```

---

## 💡 개선하고 싶은 부분

시간이 더 있었다면 해보고 싶었던 것들이에요. 나중에 시간 나면 하나씩 시도해보고 싶습니다.

### 1. 가상 스크롤링 (Virtual Scrolling)

**현재:** 20개씩 페이지네이션으로 나눠서 보여줘요
**개선하고 싶은 것:** `react-window`를 써서 수만 건도 부드럽게 렌더링

```typescript
// 현재: 페이지 바뀔 때마다 20개 DOM 새로 생성
{paginatedData.map(item => <Card />)}

// 개선: 화면에 보이는 것만 렌더링 (스크롤하면 재사용)
<FixedSizeList height={600} itemCount={10000} itemSize={80}>
  {({ index, style }) => <Card style={style} />}
</FixedSizeList>
```

가상 스크롤링이라는 개념을 이번에 알게 됐는데, 대용량 데이터 처리할 때 정말 유용할 것 같아요.

### 2. 서버 사이드 검색/필터링

**현재:** 클라이언트에서 전체 데이터 로드 후 필터링해요
**한계:** 데이터가 10만 건 이상이면 초기 로딩이 느려질 것 같아요
**개선하고 싶은 것:** API에서 쿼리 파라미터로 필터링해서 가져오기

```typescript
// 현재
const filtered = allData.filter(item => item.name.includes(query));

// 개선
const { data } = await fetch(`/api/trademarks?q=${query}&status=${status}`);
```

실제 서비스에서는 서버에서 필터링해서 보내주는 게 맞을 것 같아요.

### 3. 검색어 하이라이팅

**현재:** 검색 결과에서 어디가 매칭됐는지 안 보여요
**개선하고 싶은 것:** 검색어 부분만 `<mark>` 태그로 노란색 강조

사용자 입장에서는 검색어가 어디 있는지 바로 보이면 더 편할 것 같아요.

### 4. 테스트 코드 추가

테스트 코드를 작성해보지 못한 게 좀 아쉬워요. 추가하고 싶은 테스트들:
- Custom Hooks 단위 테스트 (useSearch, usePagination 등)
- 정규화 함수 테스트 (null, 빈 배열 같은 엣지 케이스)
- 컴포넌트 통합 테스트 (검색 → 필터 → 페이지 이동 흐름)

### 5. 접근성(a11y) 개선

접근성에 대해서도 더 공부해보고 싶어요:
- 스크린 리더 지원: ARIA 레이블 추가
- 키보드 탐색: 카드 간 Tab 이동, Enter로 모달 열기
- 색상 대비: WCAG AA 기준 충족 확인

### 6. 에러 바운더리

에러 처리를 더 체계적으로 하고 싶어요:
- React Error Boundary로 컴포넌트 에러 격리
- 네트워크 실패 시 재시도 UI 제공

### 7. 국제화(i18n)

**현재:** UI 텍스트가 다 하드코딩되어 있어요
**개선하고 싶은 것:** `react-i18next` 등으로 다국어 지원

상표 데이터는 다국가인데 UI는 한국어만 지원하는 게 좀 아이러니하긴 해요 😅

---

## 📦 기술 스택 정리

이 프로젝트에서 사용한 기술들을 정리해봤어요.

| 분류 | 기술 | 왜 선택했나요? |
|------|------|-----------|
| Framework | React 19.x | 최신 기능(Hooks, Concurrent) 써보고 싶었어요 |
| Language | TypeScript 5.x | 타입 안전성 + IDE 자동완성이 너무 좋았어요 |
| Build Tool | Vite 7.x | 빠른 HMR, 개발할 때 답답하지 않아요 |
| Chart | Chart.js 4.x | 가볍고 간단해서 이 정도면 충분했어요 |
| Styling | Pure CSS + Variables | 의존성 없이 다크모드 구현하기 좋았어요 |
| Linting | ESLint 9.x | 코드 품질 유지 + 실수 방지 |
| Storage | localStorage | 서버 없이 즐겨찾기/테마 저장할 수 있어요 |

---

## 📄 마치며

이 프로젝트는 마크클라우드 프론트엔드 과제로 제출한 것입니다.

처음 해보는 것들도 많았고 부족한 부분도 있지만, 만들면서 정말 많이 배웠습니다. 특히 TypeScript interface로 데이터 구조를 미리 정의하는 것의 중요성, 정규화를 통한 복잡성 해소, Custom Hooks를 활용한 로직 분리 등을 직접 경험할 수 있어서 좋았습니다.

피드백 주시면 적극 반영해서 개선하겠습니다. 읽어주셔서 감사합니다! 🙇‍♂️
