# Frontend Mock API Documentation

## 1. 개요

본 문서는 프론트엔드 개발 시 사용하는 **MSW (Mock Service Worker)** Mock 서버의 API 명세입니다.

### 1.1 목적

- 백엔드 API 연동 전 프론트엔드 개발
- 독립적인 테스트 환경 구성
- 다양한 시나리오 모의 (성공, 실패, 에러)

### 1.2 기술 스택

- **MSW**: 2.13.5 (Mock Service Worker)
- **타입**: TypeScript (엔티티 타입과 동기화)
- **지연 응답**: 네트워크 지연 시뮬레이션 (300ms ~ 1500ms)

### 1.3 활성화 방법

**`.env` 파일 설정**:
```bash
NEXT_PUBLIC_MOCK_MODE=true
```

**실행**:
```bash
bun dev  # MSW가 자동 시작됨
```

---

## 2. 인증 API (`/api/auth`)

### 2.1 로그인

**엔드포인트**: `POST /api/auth/login`

**설명**: 이메일과 비밀번호로 로그인하고 Mock 토큰을 발급받습니다.

**Request Body**:
```json
{
  "email": "student@test.com",
  "password": "any_password"
}
```

**필드 설명**:
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| email | string | ✅ | 이메일 주소 |
| password | string | ✅ | 비밀번호 (Mock에서는 검증 안 함) |

**Response** (200 OK):
```json
{
  "token": "token-1714123456789-abc123xyz",
  "user": {
    "id": "user-2",
    "email": "student@test.com",
    "name": "수강생",
    "role": "CLASSMATE"
  }
}
```

**에러 응답**:
```json
// 400 Bad Request - 입력값 누락
{
  "code": "INVALID_CREDENTIALS",
  "message": "이메일과 비밀번호를 입력해주세요"
}

// 401 Unauthorized - 사용자 없음
{
  "code": "INVALID_CREDENTIALS",
  "message": "이메일 또는 비밀번호가 올바르지 않습니다"
}
```

**Mock 사용자**:
| 이메일 | 비밀번호 | 이름 | 역할 |
|--------|----------|------|------|
| `creator@test.com` | (任意) | 크리에이터 | `CREATOR` |
| `student@test.com` | (任意) | 수강생 | `CLASSMATE` |

---

### 2.2 현재 사용자 조회

**엔드포인트**: `GET /api/auth/me`

**설명**: 현재 로그인한 사용자 정보를 조회합니다.

**Request Headers**:
```http
Authorization: Bearer {TOKEN}
```

**Response** (200 OK):
```json
{
  "user": {
    "id": "user-2",
    "email": "student@test.com",
    "name": "수강생",
    "role": "CLASSMATE"
  }
}
```

**에러 응답**:
```json
// 401 Unauthorized - 토큰 없음 또는 만료
{
  "code": "UNAUTHORIZED",
  "message": "로그인이 필요합니다"
}
```

---

### 2.3 로그아웃

**엔드포인트**: `POST /api/auth/logout`

**설명**: 로그아웃하고 토큰을 무효화합니다.

**Request Headers**:
```http
Authorization: Bearer {TOKEN}
```

**Response** (200 OK):
```json
{
  "success": true
}
```

---

## 3. 강의 API (`/api/courses`)

### 3.1 강의 목록 조회

**엔드포인트**: `GET /api/courses`

**설명**: 모든 강의 목록을 조회합니다. 카테고리 필터링을 지원합니다.

**Query Parameters**:
| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| category | string | ❌ | 카테고리 필터 (`development`, `design`, `marketing`, `business`, `all`) |

**Response** (200 OK):
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
  ],
  "categories": ["development", "design", "marketing", "business"]
}
```

**Mock 강의 목록** (8개):
| ID | 제목 | 카테고리 | 가격 | 정원 | 현재인원 | 강사 |
|----|------|----------|------|------|----------|------|
| `course-1` | React 완벽 가이드 | development | 150,000원 | 30 | 25 | 김민수 |
| `course-2` | TypeScript 마스터 클래스 | development | 180,000원 | 25 | 20 | 박지현 |
| `course-3` | UI/UX 디자인 기초 | design | 200,000원 | 20 | 8 | 이서연 |
| `course-4` | Figma 실무 활용 | design | 160,000원 | 25 | 23 | 최준호 |
| `course-5` | 디지털 마케팅 전략 | marketing | 220,000원 | 40 | 35 | 정미래 |
| `course-6` | 콘텐츠 마케팅 실전 | marketing | 170,000원 | 30 | 12 | 강다은 |
| `course-7` | 스타트업 비즈니스 모델 | business | 250,000원 | 20 | 5 | 송재현 |
| `course-8` | 리더십과 팀 빌딩 | business | 280,000원 | 25 | 18 | 윤상훈 |

---

### 3.2 강의 상세 조회

**엔드포인트**: `GET /api/courses/:id`

**설명**: 특정 강의의 상세 정보를 조회합니다.

**Path Parameters**:
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| id | string | 강의 ID (예: `course-1`) |

**Response** (200 OK):
```json
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
```

**에러 응답**:
```json
// 404 Not Found - 강의 없음
{
  "code": "COURSE_NOT_FOUND",
  "message": "강의를 찾을 수 없습니다"
}
```

---

## 4. 수강 신청 API (`/api/enrollments`)

### 4.1 수강 신청

**엔드포인트**: `POST /api/enrollments`

**설명**: 강의를 신청합니다. 개인/단체 신청을 모두 지원합니다.

**Request Body** (개인 신청):
```json
{
  "courseId": "course-1",
  "type": "personal",
  "applicant": {
    "name": "홍길동",
    "email": "hong@test.com",
    "phone": "010-1234-5678",
    "motivation": "React를 배우고 싶습니다"
  },
  "agreedToTerms": true
}
```

**Request Body** (단체 신청):
```json
{
  "courseId": "course-1",
  "type": "group",
  "applicant": {
    "name": "담당자",
    "email": "manager@test.com",
    "phone": "010-9876-5432",
    "motivation": "팀 교육용으로 신청합니다"
  },
  "group": {
    "organizationName": "ABC 회사",
    "contactPerson": "담당자",
    "headCount": 3,
    "participants": [
      {
        "name": "참가자1",
        "email": "p1@test.com"
      },
      {
        "name": "참가자2",
        "email": "p2@test.com"
      },
      {
        "name": "참가자3",
        "email": "p3@test.com"
      }
    ]
  },
  "agreedToTerms": true
}
```

**필드 설명**:
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| courseId | string | ✅ | 강의 ID |
| type | string | ✅ | `personal` 또는 `group` |
| applicant.name | string | ✅ | 신청자 이름 (2~20자) |
| applicant.email | string | ✅ | 이메일 주소 |
| applicant.phone | string | ✅ | 전화번호 (`01X-XXXX-XXXX`) |
| applicant.motivation | string | ❌ | 수강 동기 (최대 300자) |
| group.organizationName | string | ⚠️ | 단체명 (단체 신청 시 필수) |
| group.contactPerson | string | ⚠️ | 담당자 연락처 (단체 신청 시 필수) |
| group.headCount | number | ⚠️ | 신청 인원 (2~10, 단체 신청 시 필수) |
| group.participants | array | ⚠️ | 참가자 명단 (인원수와 일치해야 함) |
| agreedToTerms | boolean | ✅ | 이용약관 동의 |

**Response** (201 Created):
```json
{
  "enrollmentId": "ENR-1714123456789",
  "status": "confirmed",
  "enrolledAt": "2026-04-26T10:00:00.000Z"
}
```

**에러 응답**:
```json
// 400 Bad Request - 입력값 검증 실패
{
  "code": "INVALID_INPUT",
  "message": "입력값을 확인해 주세요",
  "details": {
    "applicant.email": "올바른 이메일 형식이 아닙니다",
    "applicant.phone": "전화번호를 입력해주세요"
  }
}

// 400 Bad Request - 정원 초과
{
  "code": "COURSE_FULL",
  "message": "정원이 초과되었습니다"
}

// 404 Not Found - 강의 없음
{
  "code": "COURSE_NOT_FOUND",
  "message": "강의를 찾을 수 없습니다"
}

// 409 Conflict - 중복 신청
{
  "code": "DUPLICATE_ENROLLMENT",
  "message": "이미 신청한 강의입니다"
}
```

---

## 5. 네트워크 지연 시뮬레이션

### 5.1 지연 시간

| 엔드포인트 | 지연 시간 | 설명 |
|------------|-----------|------|
| `POST /api/auth/login` | 800ms | 로그인 처리 |
| `GET /api/auth/me` | 300ms | 사용자 정보 조회 |
| `POST /api/auth/logout` | 300ms | 로그아웃 처리 |
| `GET /api/courses` | 800ms | 강의 목록 조회 |
| `GET /api/courses/:id` | 300ms | 강의 상세 조회 |
| `POST /api/enrollments` | 1500ms | 수강 신청 (결제 시뮬레이션) |

---

## 6. Mock 데이터 상태 관리

### 6.1 JSON 파일 기반 관리

Mock 데이터는 **JSON 파일**로 관리되며, 실제 API 응답 형식과 동일합니다.

```
src/shared/api/msw/mock-data/
├── courses.json     # 강의 목록 (8개 강의)
└── users.json       # 사용자 목록 (2명: 크리에이터, 수강생)
```

**courses.json**:
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

**users.json**:
```json
{
  "users": [
    {
      "id": "user-1",
      "email": "creator@test.com",
      "name": "크리에이터",
      "role": "CREATOR"
    },
    {
      "id": "user-2",
      "email": "student@test.com",
      "name": "수강생",
      "role": "CLASSMATE"
    }
  ]
}
```

### 6.2 In-Memory 상태 관리

**수강 신청 저장소**:
```typescript
// In-memory store (Key: "email:courseId")
const enrollments = new Set<string>()

// 중복 신청 체크
const key = "student@test.com:course-1"
if (enrollments.has(key)) {
  // 이미 신청함
}
```

**특징**:
- 페이지 새로고침 시 초기화
- 개발 서버 재시작 시 초기화
- 정원 추적 (`currentEnrollment` 자동 증가)

### 6.2 정원 동기화

**정원 초과 시나리오**:
```
1. 초기 정원: course-4 (Figma 실무 활용) = 23/25
2. 3번째 신청 시 정원 도달 (25/25)
3. 4번째 신청 시 "정원 초과" 에러 반환
```

---

## 7. 에러 코드 목록

| 코드 | HTTP Status | 설명 | 발생 시점 |
|------|-------------|------|-----------|
| `INVALID_CREDENTIALS` | 400, 401 | 인증 실패 | 로그인 입력값 누락 또는 사용자 없음 |
| `UNAUTHORIZED` | 401 | 인증되지 않음 | 토큰 없음 또는 만료 |
| `INVALID_INPUT` | 400 | 입력값 검증 실패 | 필수 필드 누락 또는 형식 오류 |
| `COURSE_NOT_FOUND` | 404 | 강의를 찾을 수 없음 | 존재하지 않는 강의 ID |
| `COURSE_FULL` | 400 | 정원 초과 | `currentEnrollment >= maxCapacity` |
| `DUPLICATE_ENROLLMENT` | 409 | 중복 신청 | 같은 이메일로 이미 신청함 |

---

## 8. 테스트 시나리오

### 8.1 정상 흐름 (Happy Path)

```
1. 로그인 → 토큰 발급
2. 강의 목록 조회 → 8개 강의 반환
3. 강의 선택 → 상세 조회
4. 수강 신청 → 신청 완료
```

### 8.2 에러 흐름 (Error Scenarios)

**정원 초과**:
```bash
# course-4 (Figma 실무 활용) = 23/25 명
# 2번 더 신청하면 정원 초과 에러
POST /api/enrollments { "courseId": "course-4", ... }
→ 400 COURSE_FULL
```

**중복 신청**:
```bash
# 같은 이메일로 2번 신청
POST /api/enrollments { "courseId": "course-1", "applicant": { "email": "test@test.com" } }
→ 201 Created

POST /api/enrollments { "courseId": "course-1", "applicant": { "email": "test@test.com" } }
→ 409 DUPLICATE_ENROLLMENT
```

---

## 9. 백엔드 API와의 차이점

### 9.1 인증 방식

| 항목 | Mock 서버 | 백엔드 |
|------|-----------|--------|
| 인증 | In-memory Token Map | JWT (HMAC SHA256) |
| 토큰 형식 | `token-{timestamp}-{random}` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| 만료 | 없음 (서버 재시작까지) | 24시간 |

### 9.2 데이터 영속성

| 항목 | Mock 서버 | 백엔드 |
|------|-----------|--------|
| 저장소 | In-Memory (Set/Map) | MySQL (영구 저장) |
| 초기화 | 페이지 새로고침 시 | 영구 저장 |
| 정원 추적 | `currentEnrollment` 변수 | `COUNT(*)` 쿼리 |

### 9.3 API 엔드포인트 차이

| 엔드포인트 | Mock 서버 | 백엔드 |
|------------|-----------|--------|
| `GET /api/courses/:id/enrollments` | ❌ 미구현 | ✅ 강의별 수강생 목록 |
| `PATCH /api/enrollments/:id/confirm` | ❌ 미구현 | ✅ 결제 확정 |
| `PATCH /api/enrollments/:id/cancel` | ❌ 미구현 | ✅ 수강 취소 |

---

## 10. 개발 팁

### 10.1 Mock 모드 전환

**`.env` 파일**:
```bash
# Mock 모드 (개발)
NEXT_PUBLIC_MOCK_MODE=true

# 실제 API 모드 (프로덕션)
NEXT_PUBLIC_MOCK_MODE=false
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### 10.2 디버깅

**브라우저 콘솔**:
```javascript
// MSW 요청 로그 확인
// 개발자 도구 > Console > "MSW" 로그 필터링

// 토큰 저장 확인
localStorage.getItem('auth_token')
```

**네트워크 탭**:
```javascript
// 개발자 도구 > Network > 요청 확인
// Delay 적용 여부 확인 (Time 컬럼)
```

### 10.3 커스텀 Mock 데이터

**핸들러 수정** (`src/shared/api/msw/handlers.ts`):
```typescript
const courses: Course[] = [
  // 새로운 Mock 강의 추가
  {
    id: "course-9",
    title: "새로운 강의",
    category: "development",
    // ...
  }
]
```

---

**문서 버전**: 1.0
**최종 수정**: 2026-04-26
