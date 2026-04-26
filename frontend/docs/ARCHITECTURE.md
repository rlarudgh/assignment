# Frontend Architecture

## 1. 아키텍처 개요

### 1.1 FSD (Feature-Sliced Design) 적용

본 프로젝트는 **Feature-Sliced Design (FSD)** 아키텍처를 적용하여 기능 중심의 계층 구조를 갖춥니다.

```
src/
├── app/              # Layer 1 - 라우팅, 레이아웃, 프로바이더
├── entities/         # Layer 5 - 도메인 엔티티 (Course, Enrollment)
├── features/         # Layer 4 - 비즈니스 기능 (enrollment, auth)
├── shared/           # Layer 6 - 공통 UI, 유틸리티, 타입
└── widgets/          # Layer 3 - 재사용 가능한 컴포넌트 조합
```

#### 레이어 규칙
- **아래 방향으로만 import 가능**: `app → widgets → features → entities → shared`
- **역방향 import 금지**: entities가 features를 import할 수 없음
- **공유 코드 최상화**: shared에서 공통 로직 관리

### 1.2 기술 스택

| 분류 | 기술 | 버전 |
|------|------|------|
| **Framework** | Next.js | 16.2.4 (App Router) |
| **Language** | TypeScript | 5 |
| **Runtime** | Bun | 1.x |
| **UI Library** | React | 19.2.4 |
| **State Management** | TanStack Query (서버) + Zustand (클라이언트) |
| **Styling** | TailwindCSS | v4 |
| **Testing** | Vitest + MSW | 4.1.5 + 2.13.5 |
| **Code Quality** | Biome | 1.9.4 |

---

## 2. 디렉토리 구조

### 2.1 전체 구조

```
src/
├── app/                          # Next.js App Router
│   ├── enrollment/               # 수강 신청 페이지
│   ├── login/                   # 로그인 페이지
│   ├── layout.tsx               # 루트 레이아웃
│   └── providers.tsx            # QueryClient, AuthProvider
│
├── entities/                    # 도메인 엔티티
│   └── enrollment/
│       ├── enrollment.types.ts    # 타입 정의
│       └── enrollment.queries.ts   # TanStack Query 훅
│
├── features/                     # 비즈니스 기능
│   ├── auth/
│   │   ├── model/                # Auth Context (Zustand)
│   │   └── ui/                  # ProtectedRoute, Login UI
│   └── enrollment/
│       ├── lib/                  # 유효성 검증, 커스텀 훅
│       └── ui/                  # 다단계 폼 컴포넌트
│
├── shared/                       # 공통 코드
│   ├── api/msw/                  # Mock Service Worker
│   ├── ui/                      # 공통 UI 컴포넌트 (Button, Card 등)
│   └── lib/                     # 유틸리티 함수
│
└── widgets/                      # 재사용 가능한 조합
    └── (현재 미사용)
```

### 2.2 enrollment/ 모듈 구조

다단계 수강 신청 폼의 핵심 모듈 상세 구조입니다.

```
features/enrollment/
├── lib/
│   ├── validation.lib.ts        # Zod 스키마 (step1/2/3)
│   ├── use-enrollment-draft.ts  # sessionStorage 임시 저장
│   └── use-enrollment-form.ts    # 폼� 상태 관리
│
└── ui/
    ├── step1-course-selection.ui.tsx    # 강의 선택
    ├── step2-applicant-info.ui.tsx      # 정보 입력
    ├── step3-review-submit.ui.tsx       # 확인 및 제출
    ├── success-screen.ui.tsx            # 완료 화면
    ├── step-indicator.ui.tsx             # 스텝 인디케이터
    ├── summary/                          # 요약 카드 분리
    │   ├── course-summary.ui.tsx
    │   ├── applicant-summary.ui.tsx
    │   └── price-summary.ui.tsx
    ├── applicant-fields.ui.tsx           # 신청자 필드
    └── group-fields.ui.tsx                # 단체 필드
```

---

## 3. 데이터 흐름

### 3.1 서버 상태 관리 (TanStack Query)

**Query Cache 전략**:
```ts
useQuery({
  queryKey: ["courses", category],
  queryFn: fetchCourses,
  staleTime: 5 * 60 * 1000,  // 5분
})
```

**Mutation & 낙관적 업데이트**:
```ts
// 수강 신청 후 캐시 무효화
mutationFn: async (data) => {
  const response = await enroll(data)
  queryClient.invalidateQueries({ queryKey: ["courses"] })
  return response
}
```

### 3.2 클라이언트 상태 (Zustand)

**Auth Context**:
```ts
interface AuthState {
  user: User | null
  token: string | null
  login: (email, password) => Promise<void>
  logout: () => void
}
```

### 3.3 다단계 폼 데이터 플로우

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│ Step 1   │ ───>│ Step 2   │ ───>│ Step 3   │ ───>│ Success  │
│ 강의 선택  │     │ 정보 입력   │     │ 확인 제출  │     │ 완료 화면  │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
     │               │                 │
     └───────────────┴─────────────────┘
                 ↓
        sessionStorage 자동 저장
        (formData 매 변경 시)
```

**상태 전이 조건**:
- Step 1 → Step 2: 강의 선택 + 신청 유형 확인
- Step 2 → Step 3: 모든 필드 유효성 검증 통과
- Step 3 → Success: 제출 성공 + sessionStorage 정리

---

## 4. 핵심 설계 패턴

### 4.1 Custom Hooks 패턴

**useEnrollmentDraft** (sessionStorage 관리):
```ts
export function useEnrollmentDraft(defaultFormData) {
  const [formData, setFormData] = useState(() => {
    const draft = loadDraftFromStorage()  // sessionStorage 로드
    return draft || defaultFormData
  })

  // formData 변경 시 자동 저장
  setFormDataWithSave(data) {
    saveDraftToStorage(newData)  // sessionStorage 저장
    setFormData(newData)
  }

  return { formData, setFormData, clearDraft }
}
```

**useEnrollmentForm** (폼� 상태 & 핸들러):
```ts
export function useEnrollmentForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [submitError, setSubmitError] = useState(null)
  const [submitSuccess, setSubmitSuccess] = useState(null)

  // 핸들러 로직 캡슐화
  return {
    currentStep,
    submitError,
    submitSuccess,
    handleStep1Next,
    handleStep2Next,
    handleSubmit,
    handleReset
  }
}
```

### 4.2 Props Drilling 방지 전략

**Context API 사용 (Auth)**:
```tsx
const AuthContext = createContext<AuthContextType>()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// 사용
const { user, login } = useAuth()
```

**Custom Hooks로 상태 공유**:
- `useEnrollmentDraft`: sessionStorage + 폼 데이터 상태
- `useEnrollmentForm`: 폼� 핸들러 + 상태 전이

### 4.3 MSW Mock 서버 아키텍처

**핸들러 구조**:
```ts
// handlers.ts
export const handlers = [
  // 강의 목록
  http.get("/api/courses", () => {
    return HttpResponse.json({ courses: mockCourses })
  }),
  
  // 수강 신청
  http.post("/api/enrollments", async ({ request }) => {
    const data = await request.json() as EnrollmentRequest
    return HttpResponse.json(mockResponse)
  })
]
```

**browser.ts**:
```ts
export const worker = setupWorker(...handlers)

// providers.tsx
useEffect(() => {
  if (process.env.NODE_ENV === "development" && isMockMode) {
    worker.start({ onUnhandledRequest: "bypass" })
  }
}, [])
```

---

## 5. 라우팅 구조

### 5.1 App Router 구조

```
app/
├── layout.tsx              # 루트 레이아웃 (AuthProvider, QueryClientProvider)
├── page.tsx                # 루트 페이지 (/)
├── login/
│   └── page.tsx            # 로그인 페이지 (/login)
└── enrollment/
    └── page.tsx            # 수강 신청 페이지 (/enrollment)
```

### 5.2 라우팅 가드

**ProtectedRoute** (인증 가드):
```tsx
export function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth()

  if (isLoading) return <Skeleton />
  if (!user) redirect("/login")

  return <>{children}</>
}
```

---

## 6. 상태 관리 전략

### 6.1 서버 상태 (TanStack Query)

**용도**: API 데이터, 캐싱, 동기화
```ts
// 강의 목록
const { data: courses } = useCourses(category)

// 강의 상세
const { data: course } = useCourse(formData.courseId)

// 수강 신청 (Mutation)
const { mutate: enroll } = useCreateEnrollment()
```

**캐시 전략**:
- `staleTime: 5 * 60 * 1000` - 5분간 신선하지 않음
- `gcTime: 10 * 60 * 1000` - 10분 후 캐시 삭제

### 6.2 클라이언트 상태 (Zustand)

**용도**: 인증, 전역 UI 상태
```ts
// Auth Store
interface AuthState {
  user: User | null
  token: string | null
  login: (email, password) => Promise<void>
  logout: () => void
  getToken: () => string | null
}
```

### 6.3 로컬 상태 (useState)

**용도**: 폼 상태, UI 상태
```tsx
// page.tsx
const [currentStep, setCurrentStep] = useState(1)
const [submitError, setSubmitError] = useState(null)

// Step2ApplicantInfo
const [applicant, setApplicant] = useState(defaultApplicant)
const [group, setGroup] = useState(defaultGroup)
```

---

## 7. 유효성 검증 전략

### 7.1 Zod 스키마

**스텝별 분리**:
```ts
// Step 1: 강의 선택
export const step1Schema = z.object({
  courseId: z.string().min(1, "강의를 선택해주세요"),
  type: z.enum(["personal", "group"])
})

// Step 2: 개인 신청
export const step2PersonalSchema = z.object({
  applicant: applicantSchema
})

// Step 2: 단체 신청
export const step2GroupSchema = z.object({
  applicant: applicantSchema,
  group: groupSchema
})

// Step 3: 약관 동의
export const step3Schema = z.object({
  agreedToTerms: z.boolean().refine(val => val === true)
})
```

**실시간 검증**:
```ts
const handleApplicantBlur = (field: keyof ApplicantInfo) => {
  setTouched(prev => ({ ...prev, [field]: true }))
  validateField(`applicant.${field}`, applicant[field])
}
```

---

## 8. 이탈 방지 전략

### 8.1 beforeunload 이벤트

```ts
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (currentStep > 1 && !submitSuccess) {
      e.preventDefault()
      e.returnValue = ""  // Chrome 필요
    }
  }

  window.addEventListener("beforeunload", handleBeforeUnload)
  return () => window.removeEventListener("beforeunload", handleBeforeUnload)
}, [currentStep, submitSuccess])
```

### 8.2 sessionStorage 임시 저장

**자동 저장 트리거**:
```ts
useEffect(() => {
  if (!submitSuccess) {
    saveDraftToStorage(formData)  // 매 변경 시 저장
  }
}, [formData, submitSuccess])
```

**복구 시점**:
- 컴포넌트 마운트 시 `loadDraftFromStorage()`
- 제출 성공 후 `clearDraftFromStorage()`
- 초기화 후 `clearDraftFromStorage()`

---

## 9. 컴포넌트 분리 전략

### 9.1 단일 책임 원칙

**이전**: page.tsx (286줄)
```tsx
// 모든 로직이 하나의 파일에
function EnrollmentContent() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState(...)
  const [submitError, setSubmitError] = useState(...)
  
  // 핸들러 로직
  const handleStep1Next = () => { ... }
  const handleStep2Next = () => { ... }
  // ... 200줄 이상의 코드
}
```

**수정후**: page.tsx (159줄) + 분리된 훅
```tsx
// page.tsx - UI 렌더링만 담당
function EnrollmentContent() {
  const { formData, setFormData, clearDraft } = useEnrollmentDraft(defaultFormData)
  const form = useEnrollmentForm()
  
  return <Step1 ... />
}

// use-enrollment-draft.ts - sessionStorage 관리
export function useEnrollmentDraft(defaultFormData) { ... }

// use-enrollment-form.ts - 폼� 상태 & 핸들러
export function useEnrollmentForm() { ... }
```

### 9.2 UI 컴포넌트 분리

**summary-cards.ui.tsx (203줄) → 3개 파일로 분리**:
```
summary/
├── course-summary.ui.tsx        # 강의 정보 요약
├── applicant-summary.ui.tsx    # 신청자 정보 요약
└── price-summary.ui.tsx        # 가격 요약
```

---

## 10. API 통신 패턴

### 10.1 React Query Hooks

**정의** (`entities/enrollment/enrollment.queries.ts`):
```ts
export function useCourses(category?: string) {
  return useQuery({
    queryKey: ["courses", category],
    queryFn: async () => {
      const params = category ? `?category=${category}` : ""
      const response = await fetchWithAuth(`/api/courses${params}`)
      return handleResponse<CourseListResponse>(response)
    },
    staleTime: 5 * 60 * 1000
  })
}
```

### 10.2 에러 처리

**커스텀 에러 클래스**:
```ts
export class EnrollmentError extends Error {
  constructor(
    public code: ErrorResponse["code"],
    message: string,
    public details?: Record<string, string>
  ) {
    super(message)
  }
}
```

**에러 코드 매핑**:
```ts
export const errorCodeMessages: Record<ErrorResponse["code"], string> = {
  COURSE_FULL: "정원이 초과되었습니다.",
  DUPLICATE_ENROLLMENT: "이미 신청한 강의입니다.",
  INVALID_INPUT: "입력값을 확인해 주세요.",
  UNAUTHORIZED: "로그인이 필요합니다."
}
```

---

## 11. 타입 안전성 설계

### 11.1 Discriminated Union

**개인/단체 신청 타입 분리**:
```ts
type EnrollmentRequest = 
  | PersonalEnrollmentRequest
  | GroupEnrollmentRequest

interface PersonalEnrollmentRequest {
  courseId: string
  type: "personal"
  applicant: ApplicantInfo
  agreedToTerms: boolean
}

interface GroupEnrollmentRequest {
  courseId: string
  type: "group"
  applicant: ApplicantInfo
  group: GroupInfo
  agreedToTerms: boolean
}
```

**사용**:
```ts
function toEnrollmentRequest(formData: EnrollmentFormData): EnrollmentRequest {
  if (formData.type === "personal") {
    return { ...formData, type: "personal" }
  }
  
  // TypeScript는 group 필드 존재를 확인
  return { ...formData, type: "group", group: formData.group! }
}
```

---

## 12. 성능 최적화

### 12.1 코드 분할 (Code Splitting)

**Next.js 자동 분할**:
```tsx
// page.tsx
import { Step1CourseSelection } from "@/features/enrollment/ui/step1-course-selection.ui"
// → 별도의 청크로 분할됨
```

### 12.2 이미지 최적화

**Thumbnail 렌지리링**:
```tsx
{course.thumbnail && (
  <img
    src={course.thumbnail}
    alt={course.title}
    className="w-24 h-16 object-cover rounded-md"
    loading="lazy"  // 지연 로딩
  />
)}
```

### 12.3 리렌더링 최적화

**React.memo 사용** (필요시):
```tsx
export const CourseCard = React.memo(({ course, onSelect, isSelected }) => {
  // 선택 상태가 변경될 때만 리렌더링
})
```

---

## 13. 테스트 전략

### 13.1 MSW + Vitest

**Mock 서버** (`src/shared/api/msw/handlers.ts`):
```ts
const courses: Course[] = [
  {
    id: "course-1",
    title: "React 완벽 가이드",
    category: "development",
    price: 150000,
    maxCapacity: 30,
    currentEnrollment: 25,
    // ...
  }
]

http.get("/api/courses").resolver(() => {
  return HttpResponse.json({ courses })
})
```

**통합 테스트** (`ApiIntegrationTest.kt`):
- 22개 테스트 케이스
- 인증, 강의 관리, 수강 신청 포함

---

## 14. 배포 전략

### 14.1 환경별 설정

**개발 환경**:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_MOCK_MODE=false
```

**Mock 모드**:
```bash
NEXT_PUBLIC_MOCK_MODE=true  # MSW 활성화
```

### 14.2 빌드 최적화

**Bun 러타임**:
- 빠른 의존성 설치
- 내장 번들러
- 증분 컴파일

---

## 15. 확장 가능성

### 15.1 새로운 폼 추가

**패턴 재사용**:
1. `useXxxDraft` 훅 생성 (sessionStorage)
2. `useXxxForm` 훅 생성 (폼 상태 관리)
3. Zod 스키마 분리 (step1/2/3)

### 15.2 새로운 페이지 추가

**FSD 레이어 준수**:
1. entities/ - 도메인 모델 정의
2. features/ - 비즈니스 로직 구현
3. shared/ - 공통 컴포넌트 활용

---

**문서 버전**: 1.0  
**최종 수정**: 2025-04-27
