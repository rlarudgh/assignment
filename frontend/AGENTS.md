# Frontend AI Agent Guidelines

## 역할

이 문서는 AI 에이전트가 프론트엔드 코드베이스를 작업할 때 참고하는 가이드라인입니다.

---

## 프로젝트 개요

**프로젝트**: 온라인 교육 플랫폼 수강 신청 시스템 (프론트엔드)
**기술 스택**: Next.js 16, React 19, TypeScript, Bun, TailwindCSS v4, TanStack Query, Zustand
**아키텍처**: FSD (Feature-Sliced Design)

---

## 핵심 원칙

### 1. FSD 레이어 규칙 준수

```
app/ → widgets/ → features/ → entities/ → shared/
       ↓          ↓           ↓           ↓
      (라우팅)   (재사용 조합) (기능)    (도메인)  (공통)
```

**Import 규칙**:
- ✅ `app` → `features` → `entities` → `shared` (아래 방향으로만)
- ❌ `entities` → `features` (역방향 import 금지)

### 2. 파일 명명 규칙

- **Page 컴포넌트**: `page.tsx` (Next.js App Router 규칙)
- **UI 컴포넌트**: `*.ui.tsx` (예: `button.ui.tsx`)
- **Custom Hooks**: `use-*.ts` (예: `use-enrollment-form.ts`)
- **타입 정의**: `*.types.ts` (예: `enrollment.types.ts`)
- **유틸리티**: `*.lib.ts` (예: `validation.lib.ts`)

### 3. 코드 스타일

- **Biome 사용**: 린트 + 포맷팅 (ESLint + Prettier 대체)
- **줄 길이**: 100자
- **들여쓰기**: 2스페이스
- **세미콜론**: 사용

### 4. 타입 안전성

- **`any` 금지**: `unknown` 사용 후 타입 가드
- **명시적 타입**: 함수 반환 타입은 항상 명시
- **Zod 스키마**: API 요청/응답은 Zod로 검증

---

## 작업 가이드

### 새로운 Feature 추가

1. **entities/** - 도메인 모델 정의
   ```
   entities/xxx/
   ├── xxx.types.ts       # 타입 정의
   └── xxx.queries.ts     # TanStack Query 훅
   ```

2. **features/** - 비즈니스 로직 구현
   ```
   features/xxx/
   ├── lib/               # 유효성 검증, 커스텀 훅
   └── ui/                # UI 컴포넌트
   ```

3. **app/** - 라우팅 연결
   ```
   app/xxx/
   └── page.tsx           # 페이지 컴포넌트
   ```

### 새로운 UI 컴포넌트 추가

**위치 결정**:
- **단일 Feature에서만 사용**: `features/xxx/ui/`
- **여러 Feature에서 재사용**: `shared/ui/`

**구조**:
```tsx
// features/xxx/ui/yyy.ui.tsx
export function YyyComponent({ prop1, prop2 }: YyyProps) {
  return <div>...</div>
}
```

### API 통신 구현

**TanStack Query 사용**:
```tsx
// entities/xxx/xxx.queries.ts
export function useXxxList() {
  return useQuery({
    queryKey: ["xxx"],
    queryFn: async () => {
      const response = await fetchWithAuth("/api/xxx")
      return handleResponse<Xxx[]>(response)
    },
    staleTime: 5 * 60 * 1000,  // 5분
  })
}
```

**에러 처리**:
```tsx
try {
  const data = await fetchWithAuth("/api/xxx")
} catch (error) {
  if (error instanceof EnrollmentError) {
    // 비즈니스 에러 처리
  }
}
```

### 폼 상태 관리

**다단계 폼**:
- `use-enrollment-draft.ts`: sessionStorage 임시 저장
- `use-enrollment-form.ts`: 폼 상태 & 핸들러

**Zod 검증**:
```ts
export const schema = z.object({
  name: z.string().min(2).max(20),
  email: z.string().email(),
})
```

---

## 테스트 작성

### 단위 테스트 (Vitest)

```tsx
import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText("Click me")).toBeInTheDocument()
  })
})
```

### 통합 테스트 (MSW)

```tsx
import { http, HttpResponse } from "msw"
import { server } from "@/shared/api/msw/node"

it("fetches courses", async () => {
  server.use(
    http.get("/api/courses", () => {
      return HttpResponse.json({ courses: mockCourses })
    })
  )

  // ...
})
```

---

## 빌드 및 실행

### 개발 서버
```bash
bun dev  # http://localhost:3000
```

### 빌드
```bash
bun run build
```

### 테스트
```bash
bun test              # 단위 테스트
bun test:coverage     # 커버리지
```

### 코드 품질
```bash
bun run check         # 린트 + 포맷 검사
bun run check:fix     # 자동 수정
```

---

## 주의사항

### ❌ 하지 말아야 할 것

1. **Props Drilling**: Context API나 Custom Hooks로 해결
2. **암시적 Any**: 명시적 타입 선언 필수
3. **직접 DOM 조작**: React 상태로 관리
4. **콘솔.log 남용**: Logger 사용 또는 제거
5. **TODO 주석만 남기기**: 이슈 트래커에 등록

### ✅ 권장하는 것

1. **컴포넌트 분리**: 단일 책임 원칙
2. **Custom Hooks 재사용**: 로직 캡슐화
3. **타입 좁히기**: Type Guard 활용
4. **Early Return**: 가독성 향상
5. **성능 최적화**: React.memo, useMemo, 적절히 사용

---

## 참고 문서

- [FSD 공식 문서](https://feature-sliced.design/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [TanStack Query](https://tanstack.com/query/latest)
- [TailwindCSS v4](https://tailwindcss.com/docs/v4-beta)
- [Biome](https://biomejs.dev/)

---

**버전**: 1.0
**최종 수정**: 2026-04-26
