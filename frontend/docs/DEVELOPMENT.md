# Frontend Development Guide

## 1. 개발 환경 설정

### 1.1 필수 조건

**필수 프로그램**:
- [Bun](https://bun.sh) v1.0 이상
- Node.js 호환 환경

**권장사항 없음** - 사용자 계정에서 바로 설치 가능

### 1.2 설치 방법

#### Bun 설치
```bash
# macOS/Linux
curl -fsSL https://bun.sh/install | bash

# Windows (PowerShell)
irm bun.sh/install.ps1 | iex
```

#### 의존성 설치
```bash
cd frontend
bun install
```

---

## 2. 로컬 실행 방법

### 2.1 개발 서버 실행

```bash
bun dev
```

- **주소**: http://localhost:3000
- **핫 리로드**: Fast Refresh 지원
- **API 프록시**: `/api/*` → 백엔드 `http://localhost:8080`

### 2.2 백엔드 없이 실행 (Mock 모드)

```bash
# 1. .env 파일 생성
echo "NEXT_PUBLIC_MOCK_MODE=true" > .env

# 2. 개발 서버 실행
bun dev
```

Mock 모드에서는 MSW(Mock Service Worker)가 모든 API 요청을 가로채서 Mock 데이터를 반환합니다.

---

## 3. 테스트 실행

### 3.1 단위 테스트 실행

```bash
bun test
```

**테스트 커버리지**:
- 22개 테스트 통과
- Vitest + Testing Library
- MSW Mock 환경

### 3.2 테스트 파일 실행

```bash
# 특정 테스트 파일만 실행
bun test enrollment.queries.test

# 와치 모드
bun test --watch
```

### 3.3 테스트 커버리지 확인

```bash
bun test:coverage
```

---

## 4. 코드 품질 검사

### 4.1 린트 및 포맷팅

```bash
# 검사만
bun run check

# 자동 수정
bun run check:fix

# 린트만
bun run lint

# 포맷만
bun run format
```

**도구**: Biome (ESLint + Prettier 대체)

### 4.2 Biome 설정

`biome.json`:
```json
{
  "linter": {
    "recommended": true
  },
  "formatter": {
    "indentWidth": 2,
    "lineWidth": 100
  }
}
```

---

## 5. 빌드 및 배포

### 5.1 프로덕션 빌드

```bash
bun run build
```

**결과물**: `.next/` 디렉토리

### 5.2 프로덕션 서버 실행

```bash
bun start
```

### 5.3 Docker 배포

```dockerfile
# Dockerfile 예시
FROM oven/bun:1 AS base
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build
EXPOSE 3000
CMD ["bun", "run", "start"]
```

---

## 6. 환경 변수

### 6.1 환경 변수 목록

```bash
# API 설정
NEXT_PUBLIC_API_URL=http://localhost:8080

# Mock 서버 모드 (선택)
NEXT_PUBLIC_MOCK_MODE=true
```

### 6.2 .env 파일 예시

```bash
# .env.example
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_MOCK_MODE=false
```

### 6.3 환경 변수 사용

```typescript
// 코드에서 사용
const apiUrl = process.env.NEXT_PUBLIC_API_URL
const isMockMode = process.env.NEXT_PUBLIC_MOCK_MODE === "true"
```

---

## 7. 디버깅 방법

### 7.1 React DevTools

1. 브라우저에서 F12 개발자 도구 열기
2. React 탭에서 컴포넌트 트리 확인
3. Profiler로 성능 분석

### 7.2 TanStack Query DevTools

**설치** (`app/providers.tsx`):
```tsx
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"

<QueryClientProvider client={queryClient}>
  {children}
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

**사용**:
- 우측 하단 아이콘 클릭
- Query Cache 확인
- Mutation 재실행

### 7.3 VS Code 디버깅

**launch.json 설정**:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}/frontend"
    }
  ]
}
```

---

## 8. 문제 해결 가이드

### 8.1 포트 충돌

**문제**: `Error: listen EADDRINUSE :3000`

**해결**:
```bash
# 3000번 포트 사용 중인 프로세스 종료
lsof -ti:3000 | xargs kill -9

# 또는 다른 포트 사용
PORT=3001 bun dev
```

### 8.2 의존성 설치 실패

**문제**: `bun install` 실패

**해결**:
```bash
# node_modules 삭제 후 재설치
rm -rf node_modules bun.lockb
bun install
```

### 8.3 MSW 작동하지 않음

**문제**: Mock 서버가 응답하지 않음

**해결**:
1. `.env`에 `NEXT_PUBLIC_MOCK_MODE=true` 확인
2. 브라우저 콘솔에서 Service Worker 확인
3. 개발자 도구 > Application > Service Workers에서 MSW 상태 확인

### 8.4 TypeScript 에러

**문제**: 타입 에러 발생

**해결**:
```bash
# 타입 검사
bun run check

# 타입 오류 자동 수정
bun run check:fix
```

### 8.5 Mock 데이터 누락

**문제**: Mock 서버가 expected 데이터를 반환하지 않음

**확인**:
```bash
# src/shared/api/msw/handlers.ts 확인
cat src/shared/api/msw/handlers.ts | grep "course-"
```

**수정**: handlers.ts에 Mock 데이터 추가

---

## 9. 개발 워크플로우

### 9.1 새로운 기능 개발 순서

1. **타입 정의** (`entities/enrollment/enrollment.types.ts`)
2. **API 훅 작성** (`entities/enrollment/enrollment.queries.ts`)
3. **Zod 스키마 작성** (`features/enrollment/lib/validation.lib.ts`)
4. **UI 컴포넌트 개발** (`features/enrollment/ui/`)
5. **테스트 작성** (`*.test.tsx`)

### 9.2 코드 리뷰 프로세스

1. 로컬에서 기능 구현
2. `bun run check`로 코드 품질 확인
3. `bun test`로 테스트 통과 확인
4. PR 생성 및 코드 리뷰

---

## 10. MSW Mock 서버 관리

### 10.1 Mock 데이터 추가

**파일**: `src/shared/api/msw/handlers.ts`

```ts
const courses: Course[] = [
  {
    id: "course-new",
    title: "새로운 강의",
    category: "development",
    price: 200000,
    maxCapacity: 30,
    currentEnrollment: 0,
    startDate: "2024-07-01",
    endDate: "2024-07-31",
    instructor: "새 강사"
  }
]
```

### 10.2 Mock 시나리오 테스트

**정원 초과 시나리오**:
```ts
// currentEnrollment >= maxCapacity 인 강의
const fullCourse: Course = {
  id: "course-full",
  maxCapacity: 30,
  currentEnrollment: 30,  // 만석
}

http.post("/api/enrollments").resolver(async ({ request }) => {
  const data = await request.json()
  if (data.courseId === "course-full") {
    return HttpResponse.json(
      { code: "COURSE_FULL", message: "정원이 초과되었습니다." },
      { status: 400 }
    )
  }
})
```

---

## 11. 성능 최적화

### 11.1 번들 크기 최적화

```bash
bun build
# .next/ 디렉토리 크기 확인
du -sh .next/
```

### 11.2 이미지 최적화

**Next.js Image 최적화**:
```tsx
import Image from "next/image"

<Image
  src={course.thumbnail}
  alt={course.title}
  width={96}
  height={64}
  loading="lazy"
/>
```

### 11.3 폰트 최적화

**next.config.ts**:
```ts
const nextConfig = {
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-icons"
    ]
  }
}
```

---

## 12. CI/CD 통합

### 12.1 GitHub Actions

**파일**: `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest
      - run: bun install
      - run: bun run check
      - run: bun test
      - run: bun run build
```

---

## 13. 추천 VS Code 확장

### 13.1 필수 확장

- **Biome** - 린트 & 포맷팅
- **Tailwind CSS IntelliSense** - 클래스 자동완성
- **TypeScript Importer** - 자동 import 정렬

### 13.2 추천 확장

- **Error Lens** - 에러 인라인 표시
- **GitLens** - Git 블레임 표시
- **Import Cost** - import 비용 시각화

---

## 14. 브랜치 전략

### 14.1 Git Flow

```
main (배포)
  ↑
  develop (개발 통합)
  ↑
  feature/* (기능 개발)
```

### 14.2 커밋 컨벤션

```
feat: 3단계 수강 신청 폼 구현
fix: 정원 초과 시 에러 메시지 수정
docs: Mock 서버 사용법 추가
refactor: 폼 상태 관리 커스텀 훅으로 분리
test: 수강 신청 시나리오 테스트 추가
```

---

## 15. 유용한 Snippets

### 15.1 새로운 Page 만들기

```bash
mkdir -p src/app/new-page
touch src/app/new-page/page.tsx
```

```tsx
// src/app/new-page/page.tsx
export default function NewPage() {
  return <div>New Page</div>
}
```

### 15.2 새로운 Feature 만들기

```bash
mkdir -p src/features/new-feature
touch src/features/new-feature/index.ts
```

### 15.3 새로운 Shared UI 만들기

```bash
mkdir -p src/shared/ui/new-component
touch src/shared/ui/new-component.tsx
```

---

**문서 버전**: 1.0  
**최종 수정**: 2025-04-27
