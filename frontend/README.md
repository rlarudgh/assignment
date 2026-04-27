# Frontend

## 프로젝트 개요

Assignment 프로젝트의 프론트엔드 애플리케이션입니다.  
Next.js 16 (App Router) + React 19 + TypeScript 기반으로 구축되었으며, FSD(Feature-Sliced Design) 아키텍처를 적용하여 기능 단위로 코드를 구조화했습니다.  
TanStack Query로 서버 상태를 관리하고, Zustand로 클라이언트 상태를 관리하며, Axios를 통해 백엔드 REST API와 통신합니다.

## 기술 스택

| 분류 | 기술 |
|------|------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5 |
| **Runtime** | Bun |
| **UI** | React 19, TailwindCSS v4 |
| **Server State** | TanStack Query (React Query) |
| **Client State** | Zustand |
| **HTTP Client** | Axios |
| **Architecture** | FSD (Feature-Sliced Design) |
| **Code Quality** | Biome |

## 실행 방법

### 사전 요구사항

- [Bun](https://bun.sh)이 설치되어 있어야 합니다.

### 1. 의존성 설치

```bash
bun install
```

### 2. 개발 서버 실행

```bash
bun dev
```

- 프론트엔드: http://localhost:3000
- API 프록시: `/api/*` 요청은 백엔드(`http://localhost:8080`)로 리버스 프록시됩니다.

### 3. 코드 품질 검사

```bash
# 린트 + 포맷 검사
bun run check

# 린트 + 포맷 자동 수정
bun run check:fix

# 린트만 실행
bun run lint

# 포맷만 실행
bun run format
```

### 4. 빌드

```bash
bun run build
```

### 5. 테스트

#### 단위 테스트 (Vitest)

```bash
bun test                # 전체 단위 테스트 실행
bun run test:coverage   # 커버리지 포함 실행
```

#### E2E 테스트 (Playwright)

MSW Mock 서버를 통해 브라우저에서 실제 사용자 흐름을 테스트합니다.

```bash
# 최초 1회: 브라우저 바이너리 설치
bunx playwright install

# 전체 E2E 테스트 실행 (headless)
bun run test:e2e

# 브라우저 창을 열어서 시각적으로 확인
bun run test:e2e:headed

# 특정 시나리오만 실행
bun run test:e2e -- --grep "happy path"
bun run test:e2e -- --grep "validation"
```

**테스트 시나리오 (20개)**

| 파일 | 시나리오 | 개수 |
|------|---------|------|
| `enrollment-personal.spec.ts` | 개인 신청 happy path | 1 |
| `enrollment-group.spec.ts` | 단체 신청 happy path | 1 |
| `enrollment-navigation.spec.ts` | 단계 간 이동, 데이터 유지 | 3 |
| `enrollment-validation.spec.ts` | 필수 필드, 이메일/전화 형식 검증 | 4 |
| `enrollment-capacity.spec.ts` | 정원 마감/임박 상태 표시 | 2 |
| `enrollment-error-recovery.spec.ts` | 서버 에러 시 데이터 유지 및 재시도 | 1 |
| `enrollment-draft-persistence.spec.ts` | 새로고침 후 임시저장 복구 | 3 |

**디렉토리 구조**

```
tests/e2e/
├── helpers/
│   ├── auth.ts                # 로그인 헬퍼
│   └── enrollment-page.ts     # Page Object Model
└── enrollment/
    ├── enrollment-personal.spec.ts
    ├── enrollment-group.spec.ts
    ├── enrollment-navigation.spec.ts
    ├── enrollment-validation.spec.ts
    ├── enrollment-capacity.spec.ts
    ├── enrollment-error-recovery.spec.ts
    └── enrollment-draft-persistence.spec.ts
```

### 6. Mock 서버 (MSW) 사용법

백엔드 서버 없이도 프론트엔드 개발이 가능하도록 **MSW (Mock Service Worker)**가 구성되어 있습니다.

#### Mock 서버로 실행하기

```bash
# 1. .env 파일에 Mock 모드 설정
echo "NEXT_PUBLIC_MOCK_MODE=true" > .env

# 2. 개발 서버 실행
bun dev
```

#### Mock 데이터 구조

**강의 목록 (GET /api/courses)**
```typescript
interface Course {
  id: string;
  title: string;
  description: string;
  category: "development" | "design" | "marketing" | "business";
  price: number;
  maxCapacity: number;
  currentEnrollment: number;
  startDate: string; // ISO 8601
  endDate: string;   // ISO 8601
  instructor: string;
  thumbnail?: string;
}
```

**수강 신청 (POST /api/enrollments)**
- 개인 신청: `type: "personal"` + `applicant` 정보
- 단체 신청: `type: "group"` + `applicant` + `group` 정보
- 응답: `{ enrollmentId: string, status: "confirmed" | "pending", enrolledAt: string }`

#### Mock 시나리오

1. **성공 케이스**: 정상적인 수강 신청 → `status: "confirmed"` 반환
2. **정원 초과**: `currentEnrollment >= maxCapacity` 인 강의 → `COURSE_FULL` 에러
3. **중복 신청**: 이미 신청한 강의 → `DUPLICATE_ENROLLMENT` 에러
4. **유효성 검증**: 필수 필드 누락 → `INVALID_INPUT` 에러

#### Mock 데이터 수정

Mock 데이터는 JSON 파일로 관리됩니다:

```
src/shared/api/msw/mock-data/
├── courses.json     # 강의 목록 (8개 강의)
└── users.json       # 사용자 목록 (2명: 크리에이터, 수강생)
```

**JSON 파일 예시** (`mock-data/courses.json`):
```json
{
  "courses": [
    {
      "id": "course-1",
      "title": "React 완벽 가이드",
      "description": "React의 기초부터 고급 패턴까지 완벽하게 학습합니다.",
      "category": "development",
      "price": 150000,
      "maxCapacity": 30,
      "currentEnrollment": 25,
      "startDate": "2024-05-01",
      "endDate": "2024-05-31",
      "instructor": "김민수",
      "thumbnail": "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=225&fit=crop"
    }
  ]
}
```

**장점**:
- 데이터와 로직 분리
- 실제 API 응답 형식과 동일
- 백엔드 협업 용이
- 비개발자도 수정 가능

#### 실제 백엔드와 연결하기

```bash
# 1. 백엔드 서버 실행 (http://localhost:8080)
cd ../backend && ./gradlew bootRun

# 2. .env 파일에서 Mock 모드 비활성화 또는 삭제
rm .env

# 3. 프론트엔드 서버 실행
bun dev
```

### 환경 변수

프로젝트 루트의 `.env` 파일을 참조하거나, `frontend/.env`에 직접 설정할 수 있습니다.

| 변수 | 설명 | 기본값 |
|------|------|--------|
| `NEXT_PUBLIC_API_URL` | 백엔드 API 기본 주소 | `http://localhost:8080` |
| `NEXT_PUBLIC_MOCK_MODE` | MSW Mock 서버 사용 여부 | `false` |

## 요구사항 해석 및 가정

1. **풀스택 연동**: 백엔드 Spring Boot 서버와 REST API로 통신하며, Next.js의 rewrite 설정으로 `/api/*` 경로를 백엔드로 프록시합니다.
2. **App Router 사용**: Next.js 16 App Router를 사용하며, 서버/클라이언트 컴포넌트를 적절히 활용합니다.
3. **서버 상태 관리**: API 호출, 캐싱, 동기화, 백그라운드 업데이트 등을 TanStack Query로 처리합니다.
4. **클라이언트 상태 관리**: 폼 상태는 useState + 커스텀 훅으로, 인증 상태는 Context API로 관리합니다.
5. **스타일링**: 유틸리티 퍼스트 CSS 프레임워크인 TailwindCSS v4를 사용하여 일관된 디자인 시스템을 구축합니다.
6. **아키텍처**: FSD를 통해 기능 단위로 코드를 분리하여, 도메인 변경 시 수정 범위를 최소화하고 확장성을 확보합니다.
7. **선택 구현 항목 모두 완료**:
   - ✅ 임시 저장: sessionStorage로 새로고침 후 데이터 복구
   - ✅ 이탈 방지: beforeunload 이벤트로 브라우저 닫기 시 확인 대화상자
   - ✅ 반응형 레이아웃: TailwindCSS 반응형 클래스로 모바일/태블릿/데스크톱 지원

## 설계 결정과 이유

### 1. FSD (Feature-Sliced Design)

```
src/
├── app/        # Layer 1 - Next.js App Router, providers, global styles
├── pages/      # Layer 2 - Route page components
├── widgets/    # Layer 3 - Composite UI blocks (header, sidebar, etc.)
├── features/   # Layer 4 - User interaction features (auth, search, etc.)
├── entities/   # Layer 5 - Business domain entities (user, product, etc.)
└── shared/     # Layer 6 - Shared code (UI components, API client, utils, types)
```

- **이유**: 기능 중심의 평탄한 구조로 대규모 프로젝트에서도 일관된 아키텍처를 유지하며, 코드 탐색과 리팩토링이 용이합니다.

### 2. Next.js 16 + App Router

- **이유**: 서버 컴포넌트를 통한 초기 로딩 성능 최적화와 SEO 개선이 가능하며, React 19의 최신 기능을 활용할 수 있습니다.

### 3. TanStack Query

- **이유**: 서버 상태 관리(캐싱, 재시도, 폴리, 무효화 등)를 선언적으로 처리하여 데이터 페칭 로직을 간결하게 만들고, 로딩/에러 상태 관리를 표준화합니다.

### 4. Zustand

- **이유**: Redux에 비해 보일러플레이트가 적고, TypeScript와의 호환성이 우수하며, 비동기 상태 관리도 직관적으로 처리할 수 있습니다. (TanStack Query와 역할 분리)

### 5. Biome

- **이유**: Rust 기반으로 ESLint + Prettier보다 10~100배 빠륩며, 하나의 설정 파일로 린트와 포맷을 모두 처리하여 개발 경험을 단순화합니다.

### 6. TailwindCSS v4

- **이유**: CSS-in-JS 없이도 빠른 UI 개발이 가능하며, 런타임 오버헤드 없이 정적 CSS를 생성하여 성능이 우수합니다.

### 7. Bun

- **이유**: npm/yarn 대비 의존성 설치 및 빌드 속도가 빠륩며, 내장 번들러와 테스트 러너로 개발 경험을 향상시킵니다.

## 미구현 / 제약사항

### 선택 구현 항목 미구현

- **임시 저장 기능**: localStorage/sessionStorage를 활용한 새로고침 후 데이터 복구 (구현 완료 ✅)
- **이탈 방지**: 브라우저 닫기 시 확인 대화상자 (구현 완료 ✅)
- **반응형 레이아웃**: TailwindCSS 반응형 클래스 활용 (구현 완료 ✅)

### 향후 개선 사항

- **페이지네이션**: 강의 목록/신청 내역의 페이지네이션 (백엔드 구현 필요)
- **대기열(waitlist)**: 정원 초과 시 대기열 기능 (백엔드 구현 필요)
- **실시간 정원 업데이트**: WebSocket 등을 통한 실시간 정원 동기화

## AI 활용 범위

### 프로젝트 설정 및 아키텍처
- **프로젝트 초기 설정**: Next.js 16 + TypeScript + TailwindCSS v4 + FSD 폴더 구조 생성
- **설정 파일 작성**: `next.config.ts`, `biome.json`, `tsconfig.json`, `vitest.config.ts` 등
- **아키텍처 설계**: FSD 레이어별 책임 분리 및 폴더 구조 설계

### 핵심 기능 구현
- **다단계 폼 구조**: 3단계 수강 신청 폼의 기본 틀과 상태 관리
- **유효성 검증**: Zod 스키마를 활용한 클라이언트 측 검증 로직
- **React Query 통합**: TanStack Query를 활용한 서버 상태 관리 기본 설정

### 코드 리팩토링 및 최적화
- **코드 분리**: 대형 컴포넌트의 역할별 분리 (폼 상태, 임시 저장, UI)
- **재사용 가능한 훅**: `useEnrollmentDraft`, `useEnrollmentForm` 등 커스텀 훅 추출
- **타입 안전성**: TypeScript discriminated union을 활용한 타입 설계

### 테스트 및 Mock
- **MSW 설정**: Mock Service Worker를 활용한 API Mock 데이터 구조
- **테스트 구조**: Vitest + Testing Library 기반 테스트 파일 기본 구조

### 직접 구현한 부분
- **비즈니스 로직 세부사항**: 단체 신청 시 참가자 명단 동적 추가/제거 UI
- **사용자 경험 디테일**: 스텝별 유효성 검증, 에러 표시, 이탈 방지 등
- **Mock 데이터 시나리오**: 정원 초과, 중복 신청 등 다양한 에러 케이스 처리
