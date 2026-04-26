# Frontend Security

## 1. 보안 개요

본 문서는 프론트엔드 애�리케이션의 보안 설계, 구현된 보안 조치, 모벨 사례를 설명합니다.

---

## 2. 인증/인가 구조

### 2.1 JWT 기반 인증

**토큰 저장**: `localStorage`
```tsx
// AuthContext.tsx
const STORAGE_KEY = "auth_token"

localStorage.setItem(STORAGE_KEY, token)
const token = localStorage.getItem(STORAGE_KEY)
```

**토큰 전송**: Authorization 헤더
```ts
const headers = {
  "Authorization": `Bearer ${token}`
}
```

**토큰 만료 처리**:
- 24간 자동 만료
- 401 응답 시 자동 로그아웃
- 만료 5분 전 갱신 (TODO)

### 2.2 ProtectedRoute 가드

```tsx
export function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth()

  if (isLoading) return <Skeleton />
  if (!user) {
    redirect("/login")
  }
  
  return <>{children}</>
}
```

**보호되는 경로**:
- `/enrollment` - 수강 신청 (인증 필요)
- `/admin` - 관리자 페이지 (CREATOR 권한 필요)

**공개 경로**:
- `/` - 홈페이지
- `/login` - 로그인

---

## 3. 데이터 보호

### 3.1 PII (개인정보) 처리

**PII 데이터 종류**:
- 이름: 최소 2자, 최대 20자
- 이메일: 이메일 형식 검증
- 전화번호: 한국 전화번호 형식 (`01X-XXXX-XXXX`)
- 수강 동기: 최대 300자

**저장소**:
- **sessionStorage**: 폼 임시 저장 (탭 닫으면 자동 삭제)
- **localStorage**: 인증 토큰 (영구 저장, 로그아웃 시 삭제)

**데이터 최소화**:
- 수강 동기: 선택 사항이므로 수집하지 않거나 최소화
- 전화번호: 마스킹 처리 고려

### 3.2 XSS 방지

**React 자동 방어**:
```tsx
// 안전함 - React가 자동 이스케이프
<p>{formData.applicant.motivation}</p>

// 위험 - 사용하지 않기
<div dangerouslySetInnerHTML={{ __html: formData.applicant.motivation }} />
```

**사용자 입력 신뢰**:
- Zod 스키마로 형식 검증 (이메일, 전화번호)
- React JSX 자동 이스케이프로 HTML 태그 변환

### 3.3 CSRF 방지

**JWT 사용으로 CSRF 위험 감소**:
- SameSite 쿠키 설정 (백엔드에서 처리)
- STATELESS 세션 사용

---

## 4. 취약점 분석

### 4.1 XSS (Cross-Site Scripting)

**위험도**: 낮음 ✅

**이유**:
- React 19는 기본적으로 XSS 방지
- JSX 자동 이스케이프
- `dangerouslySetInnerHTML` 사용하지 않음

**테스트 케이스**:
```tsx
// 공격자 시도: <script>alert(1)</script>
// React 렌더링: &lt;script&gt;alert(1)&lt;/script&gt; (텍스트로 표시)
```

### 4.2 SessionStorage 탈취

**위험도**: 낮음 ✅

**이유**:
- sessionStorage는 탭/창 닫으면 자동 삭제
- 민감한 PII는 세션 동안만 유지
- 탭 닫으면 모든 데이터 소멸

**주의사항**:
- public 컴퓨터라 XSS 공격 시 sessionStorage 접근 가능
- 중요: 이미 XSS 방지되어 있으므로 우려 낮음

### 4.3 CSRF (Cross-Site Request Forgery)

**위험도**: 낮음 ✅

**이유**:
- JWT 토큰 사용
- STATELESS 세션 (세션 저장소 없음)
- 백엔드에서 SameSite 쿠키 처리

---

## 5. 보안 모벨 사례

### 5.1 입력값 검증

**Zod 스키마**:
```ts
export const applicantSchema = z.object({
  name: z.string().min(2).max(20),
  email: z.string().email(),
  phone: z.string().regex(/^01[0-9]-?\d{3,4}-?\d{4}$/)
})
```

**실시간 검증**:
- blur 시점: 개별 필드 검증
- 스텝 전환: 전체 폼 검증
- 제출 전: 최종 검증

### 5.2 에러 메시지 처리

**사용자 친화적 메시지**:
```ts
export const errorCodeMessages = {
  COURSE_FULL: "정원이 초과되었습니다. 다음 기회를 이용해 주세요.",
  DUPLICATE_ENROLLMENT: "이미 신청한 강의입니다.",
  UNAUTHORIZED: "로그인이 필요합니다."
}
```

**중요 정보 노출 방지**:
- 스택 트레이스를 통해 상세 에러 숨김
- 사용자에게는 사용자 친화적 메시지만 제공
- 개발자는 콘솔에서 상세 에러 확인

### 5.3 이탈 방지

**beforeunload 이벤트**:
```tsx
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (currentStep > 1 && !submitSuccess) {
      e.preventDefault()
      e.returnValue = ""
    }
  }

  window.addEventListener("beforeunload", handleBeforeUnload)
  return () => window.removeEventListener("beforeunload", handleBeforeUnload)
}, [currentStep, submitSuccess])
```

**보안 효과**:
- 실수로 데이터가 저장되는 것은 아니지만, 사용자 경험 개선
- 브라우저 기본 대화상자 표시

---

## 6. API 보안

### 6.1 API 키 없음

**이유**: 인증에 JWT 토큰 사용

### 6.2 CORS 설정

**백엔드** (`application.yml`):
```yaml
# Spring Boot 기본 설정 사용
```

**프론트엔드** (`next.config.ts`):
```tsx
rewrites: [
  {
    source: "/api/:path*",
    destination: "http://localhost:8080/api/:path*"
  }
]
```

### 6.3 HTTPS 권장

**프로덕션**:
- HTTPS 사용 강제 권장
- mixed content 방지

---

## 7. 취약점 및 완화 방안

### 7.1 대기열(waitlist) 기능

**미구현**: 정원 초과 시 대기열 없음

**완화 방안**:
```ts
// 시나리오
if (course.currentEnrollment >= course.maxCapacity) {
  // 대기열에 추가
  await addToWaitlist(courseId, userId)
}
```

### 7.2 Content Security Policy (CSP)

**미구현**: CSP 헤더 설정 없음

**완화 방안**:
```ts
// next.config.ts
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: "default-src 'self'; script-src 'self' 'unsafe-inline';"
  }
]
```

### 7.3 Subresource Integrity (SRI)

**미구현**: 외부 스크립트 해시 없음

**완화 방안**:
```html
<script
  src="https://cdn.example.com/script.js"
  integrity="sha384-..."
></script>
```

---

## 8. 보안 테스트

### 8.1 테스트 시나리오

**인증 우회**:
```tsx
test("로그인 없이 /enrollment 접근 시 리다이렉트", () => {
  render(<EnrollmentPage />)
  expect(screen.getByText("로그인이 필요합니다")).toBeInTheDocument()
})
```

**중복 신청 방지**:
```ts
test("이미 신청한 강의 재신청 시도 에러", () => {
  // 첫 번째 신청
  const { result } = renderHook(() => useSubmitEnrollment())
  result.current.mutate(enrollmentData)
  
  // 두 번째 신청
  await expect(() => result.current.mutate(enrollmentData))
    .rejects.toThrow("DUPLICATE_ENROLLMENT")
})
```

### 8.2 MSW 보안 테스트

**정원 초과 시나리오**:
```ts
test("정원 초과 시 COURSE_FULL 에러 반환", async () => {
  const response = await enroll(fullCourseId)
  expect(response.code).toBe("COURSE_FULL")
})
```

---

## 9. 모니터링 및 로깅

### 9.1 에러 로깅

**수준**: 사용자 경험 저하되는 에러만 로그

**예외**:
```ts
// ❌ 로깅하지 않음
console.error(user.password)  // 보안 위반

// ✅ 로깅함
console.error("Login failed for user:", user.email)
```

### 9.2 API 호출 로깅

**MSW 로깅**:
```ts
// development mode에서만
if (process.env.NODE_ENV === "development") {
  console.log("🔶 MSW (Mock Service Worker) started")
}
```

---

## 10. 배포 시 보안 체크리스트

### 10.1 환경 변수 확인

- [ ] `NEXT_PUBLIC_API_URL` 설정 (프로덕션 URL)
- [ ] `NEXT_PUBLIC_MOCK_MODE=false` (프로덕션에서는 Mock 비활성화)
- [ ] `.env` 파일이 .gitignore에 포함되어 있는지 확인

### 10.2 의존성 취약점 점검

```bash
# 취약점 스캔
npm audit
bun pm ls | grep "^\s*[├└]"
```

### 10.3 빌드 최적화

- [ ] 프로덕션 빌드 (배포용)
- [ ] Source maps 제거 (배포용)
- [ ] 미사용 코드 제거 (tree-shaking)

---

## 11. 보안 정책

### 11.1 데이터 수집

**수집 데이터**:
- 이름, 이메일, 전화번호, 수강 동기
- 수강 신청 이력
- 로그인 기록

**수집 목적**:
- 서비스 제공
- 사용자 식별
- 불량 이용 방지

### 11.2 데이터 보존 정책

- **보관 기간**: 수강 신청 완료 후 3년
- **삭제**: 계정 삭제 시 즉시 파기
- **이관**: 전자상거래 기록 (이메일, 로그인)

### 11.3 제3자 공유

**공유 대상**: 없음

**데이터 판매/공유**: 없음

---

## 12. 보안 인시던트 대응

### 12.1 보안 취약점 발견 시

**보고 절차**:
1. 사용: `security@example.com`
2. 내용: 취약점 설명
3. 재현 단계
4. 영향 평가

### 12.2 보안 업데이트

**주기적 업데이트**:
- 종속성 패치 최신화 (주차: 매주)
- 의존성 업데이트 (월 1회)

**긴급 업데이트**:
- 심각한 취약점 (24시간 내)

---

**문서 버전**: 1.0  
**최종 수정**: 2025-04-27
