# 수강 신청 시퀀스 다이어그램

## 전체 흐름

```mermaid
sequenceDiagram
    participant U as 사용자
    participant P as 수강신청 페이지
    participant API as Mock API (MSW)
    participant SS as sessionStorage

    U->>P: /enrollment 접속
    P->>API: GET /api/courses
    API-->>P: 강의 목록 반환
    P->>SS: 임시저장 데이터 확인
    SS-->>P: 없음 (최초 접속)

    Note over U,P: Step 1 — 강의 선택
    U->>P: 카테고리 필터 클릭
    U->>P: 강의 카드 선택
    U->>P: 신청 유형 선택 (개인/단체)
    U->>P: "다음 단계" 클릭
    P->>P: Step 1 유효성 검증 (Zod)
    P->>SS: 폼 데이터 임시 저장

    Note over U,P: Step 2 — 정보 입력
    U->>P: 이름, 이메일, 전화번호 입력
    alt 단체 신청
        U->>P: 단체명, 인원, 참가자 명단, 담당자 입력
    end
    U->>P: "다음 단계" 클릭
    P->>P: Step 2 유효성 검증 (Zod)
    P->>SS: 폼 데이터 임시 저장

    Note over U,P: Step 3 — 확인 및 제출
    P->>U: 입력 정보 요약 표시
    U->>P: "수정" 링크로 이전 스텝 이동 (선택)
    U->>P: 이용약관 동의 체크
    U->>P: 신청하기 버튼 클릭
    P->>API: POST /api/enrollments

    alt 성공 (201)
        API-->>P: { enrollmentId, status, enrolledAt }
        P->>SS: 임시 저장 데이터 삭제
        P->>U: 신청 완료 화면
    else 정원 초과 (400)
        API-->>P: { code: "COURSE_FULL", message: "정원이 초과되었습니다" }
        P->>U: 에러 메시지 (입력 데이터 유지)
    else 중복 신청 (409)
        API-->>P: { code: "DUPLICATE_ENROLLMENT", message: "이미 신청한 강의입니다" }
        P->>U: 에러 메시지 (입력 데이터 유지)
    end
```

## 테스트 시나리오 ↔ 다이어그램 매핑

| 시나리오 | 다이어그램 경로 | 테스트 파일 |
|---------|---------------|------------|
| 개인 신청 happy path | 전체 흐름 (alt 성공) | `enrollment-personal.spec.ts` |
| 단체 신청 happy path | Step 2 alt 단체 → alt 성공 | `enrollment-group.spec.ts` |
| 단계 이동 + 데이터 유지 | Step ↔ Step 역방향 화살표 | `enrollment-navigation.spec.ts` |
| 유효성 검증 실패 | P→P 유효성 검증 (실패 분기) | `enrollment-validation.spec.ts` |
| 정원 마감/임박 상태 | API 응답의 capacity 필드 | `enrollment-capacity.spec.ts` |
| 서버 에러 복구 | alt 정원초과 / 중복신청 | `enrollment-error-recovery.spec.ts` |
| 임시저장 복구 | SS ↔ P 복원 화살표 | `enrollment-draft-persistence.spec.ts` |

## 에러 응답 시퀀스

```mermaid
sequenceDiagram
    participant U as 사용자
    participant P as 수강신청 페이지
    participant API as Mock API

    Note over U,P: 제출 실패 시나리오

    U->>P: 신청하기 클릭
    P->>API: POST /api/enrollments

    alt COURSE_FULL (400)
        API-->>P: { code: "COURSE_FULL" }
        P->>U: "정원이 초과되었습니다" Alert 표시
        Note right of U: 입력 데이터 유지, 재시도 가능
    else DUPLICATE_ENROLLMENT (409)
        API-->>P: { code: "DUPLICATE_ENROLLMENT" }
        P->>U: "이미 신청한 강의입니다" Alert 표시
    else INVALID_INPUT (400)
        API-->>P: { code: "INVALID_INPUT", details: { ... } }
        P->>U: 필드별 에러 메시지 표시
    else 네트워크 에러
        API--xP: 연결 실패
        P->>U: "신청 중 오류가 발생했습니다" Alert 표시
    end
```

## 임시저장 시퀀스

```mermaid
sequenceDiagram
    participant U as 사용자
    participant P as 수강신청 페이지
    participant SS as sessionStorage

    Note over U,P: 임시저장 흐름

    U->>P: 폼 데이터 입력
    P->>SS: enrollment-draft 키로 JSON 저장

    U->>P: 브라우저 새로고침
    P->>SS: enrollment-draft 조회
    SS-->>P: 저장된 폼 데이터 반환
    P->>U: 이전 입력 상태 복원

    Note over U,P: 신청 완료 후
    U->>P: 신청 성공
    P->>SS: enrollment-draft 삭제
    P->>U: 완료 화면 표시
```
