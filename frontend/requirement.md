과제 A — 다단계 수강 신청 폼
유형: 멀티스텝 폼 + 유효성 검증 + 조건부 필드

과제 목적
온라인 교육 플랫폼에서 강의 수강 신청 흐름을 다단계 폼으로 구현합니다. 폼 상태 관리, 유효성 검증 설계, 조건부 필드 처리, 스텝 간 데이터 흐름을 얼마나 안정적이고 사용자 친화적으로 설계하는지를 평가합니다.

배경 시나리오
수강생은 원하는 강의를 선택하고 신청 정보를 입력하여 수강 신청을 합니다.
신청은 3단계로 나뉘며, 각 단계에서 입력한 정보는 이전 단계로 돌아가도 유지됩니다.
개인 신청과 단체 신청은 입력 필드가 다릅니다.
최종 확인 화면에서 전체 입력 내용을 검토한 후 제출합니다.
구현 범위
필수 구현
1단계: 강의 선택
강의 목록에서 수강할 강의를 선택
강의는 카테고리별로 분류되어 있음
선택한 강의의 정보(제목, 가격, 일정) 표시
신청 유형 선택: 개인 신청 / 단체 신청
2단계: 수강생 정보 입력
공통 필드:

이름 (필수, 2~20자)
이메일 (필수, 이메일 형식 검증)
전화번호 (필수, 한국 전화번호 형식)
수강 동기 (선택, 최대 300자)
단체 신청 시 추가 필드 (조건부):

단체명 (필수)
신청 인원수 (필수, 2~10명)
참가자 명단 (이름 + 이메일, 인원수만큼 입력)
담당자 연락처 (필수)
3단계: 확인 및 제출
1~2단계에서 입력한 전체 내용 요약 표시
각 섹션에 "수정" 링크 (해당 스텝으로 이동)
이용약관 동의 체크박스
제출 버튼
제출 결과
성공 시: 신청 완료 화면 (신청 번호, 요약 정보)
실패 시: 에러 메시지 + 재시도 가능 (입력 데이터 유지)
공통 요구사항
각 스텝에서 다음 단계로 넘어가기 전에 해당 스텝의 유효성 검증 수행
유효성 검증 실패 시 해당 필드에 에러 메시지 표시
이전 단계로 돌아갈 때 입력 데이터가 유지되어야 함
현재 진행 단계를 시각적으로 표시 (스텝 인디케이터)
선택 구현 (추가 점수)
임시 저장: 새로고침 후에도 입력 데이터 복구 (localStorage 등)
이탈 방지: 입력 중 브라우저 뒤로가기/닫기 시 확인 대화상자
반응형 레이아웃: 모바일에서는 스텝별 세로 스크롤 레이아웃으로 전환
API 스키마
아래는 Mock 구현을 위한 API 명세입니다. 이 스키마를 기반으로 Mock 환경을 직접 구성해 주세요.

강의 목록 조회
GET /api/courses?category={category}
interface Course {
id: string;
title: string;
description: string;
category: string; // "development" | "design" | "marketing" | "business"
price: number;
maxCapacity: number;
currentEnrollment: number;
startDate: string; // ISO 8601
endDate: string; // ISO 8601
instructor: string;
}

interface CourseListResponse {
courses: Course[];
categories: string[];
}
수강 신청 제출
POST /api/enrollments
// 개인 신청
interface PersonalEnrollmentRequest {
courseId: string;
type: "personal";
applicant: {
name: string;
email: string;
phone: string;
motivation?: string;
};
agreedToTerms: boolean;
}

// 단체 신청
interface GroupEnrollmentRequest {
courseId: string;
type: "group";
applicant: {
name: string;
email: string;
phone: string;
motivation?: string;
};
group: {
organizationName: string;
headCount: number;
participants: Array<{ name: string; email: string }>;
contactPerson: string;
};
agreedToTerms: boolean;
}

interface EnrollmentResponse {
enrollmentId: string;
status: "confirmed" | "pending";
enrolledAt: string;
}
에러 응답
interface ErrorResponse {
code: string;
message: string;
details?: Record<string, string>; // 필드별 에러 (서버 측 유효성 검증)
}
주요 에러 코드:

COURSE_FULL — 정원 초과
DUPLICATE_ENROLLMENT — 이미 신청된 강의
INVALID_INPUT — 입력값 오류 (details에 필드별 메시지)
제약 사항
TypeScript 필수
프론트엔드 프레임워크는 자유 (사용한다면 React 권장)
그 외 라이브러리는 자유 선택 (선택 이유를 README에 기술)
디자인은 자유 (별도 디자인 시안 없음). 기능과 UX에 집중해 주세요.
결제 연동 및 인증/인가 불필요
제출 기한
과제 안내 수령 후 5일 이내 제출
제출 방법
GitHub / GitLab 등 공개 또는 비공개 repository URL 이메일 제출
비공개의 경우 검토자 계정에 access 부여
필수 제출물
Git repository URL (커밋 히스토리 포함)
README.md (하단 템플릿 참고)
소스 코드
실행 방법 (로컬)
AI 사용 내역 간단 기재
README 템플릿 (필수 포함 항목)

## 프로젝트 개요

## 기술 스택

## 실행 방법

## 프로젝트 구조 설명

## 요구사항 해석 및 가정

## 설계 결정과 이유

## 미구현 / 제약사항

## AI 활용 범위

평가 기준 (세부)

1. 요구사항 이해 및 문제 정의 (20점)
   특히 봐야 할 애매한 지점들:

단체 신청에서 개인 신청으로 전환 시 단체 관련 데이터를 어떻게 처리하는가
참가자 명단의 이메일 중복을 어떻게 처리하는가
정원이 거의 찬 강의를 선택했을 때 UX를 어떻게 처리하는가
체크포인트 낮은 숙련도 높은 숙련도
조건부 필드 전환 타입 변경 시 이전 데이터 방치 타입 변경 시 관련 데이터 초기화 + 확인 대화상자
유효성 검증 시점 제출 시에만 전체 검증 스텝 전환 시 해당 스텝 검증 + 필드 blur 시 개별 검증
에러 표시 에러 메시지만 텍스트로 표시 에러 필드로 포커스 이동, 시각적 강조, 스크롤 처리 2) 설계 및 코드 구조 (25점)
특히 보는 것:

폼 상태를 어떻게 관리하는가 (React Hook Form, Formik, 직접 구현 등)
스텝 간 데이터를 어떻게 공유하는가 (Context, 상위 state, 전역 상태 등)
유효성 검증 로직이 UI와 분리되어 있는가
체크포인트 낮은 숙련도 높은 숙련도
폼 상태 관리 각 스텝에서 독립적으로 useState 사용 통합된 폼 상태 + 스텝별 schema 분리
컴포넌트 분리 한 파일에 모든 로직 스텝 컴포넌트, 폼 필드 컴포넌트, 유효성 검증 로직이 분리됨
타입 설계 any 또는 느슨한 타입 discriminated union으로 개인/단체 타입 분리 3) 안정성 및 예외 처리 (20점)
체크포인트 확인 포인트
제출 실패 처리 에러 발생 시 입력 데이터가 유지되고 재시도 가능한가
서버 에러 코드 처리 COURSE_FULL, DUPLICATE_ENROLLMENT 등을 사용자에게 의미 있게 전달하는가
빈 상태 강의 목록이 비어있을 때 적절한 안내를 보여주는가
로딩 상태 강의 목록 로딩 중, 제출 중에 적절한 UI를 보여주는가
중복 제출 방지 제출 버튼 연타 시 중복 요청을 방지하는가 4) UI/UX 구현 (15점)
체크포인트 확인 포인트
스텝 인디케이터 현재 진행 상태가 직관적으로 보이는가
유효성 에러 UX 에러 발생 시 사용자가 어디를 수정해야 하는지 즉시 파악 가능한가
확인 화면 입력 내용 요약이 읽기 쉽고 수정 링크가 직관적인가
조건부 필드 전환 개인/단체 전환 시 UI가 자연스럽게 변경되는가 5) 문서화 및 설명 가능성 (10점)
폼 상태 관리 방식 선택 이유
유효성 검증 전략 (스텝별 vs 전체, 클라이언트 vs 서버)
조건부 필드 데이터 처리 방침
구현하지 못한 부분이 있다면 이유와 대안 명시 6) Git / 작업 흔적 (10점)
커밋 단위: feat: 강의 선택 스텝 구현, feat: 유효성 검증 추가, fix: 단체 신청 전환 시 데이터 초기화 등 의미 단위
한 번에 전체를 dump한 커밋은 감점
리팩토링, 테스트 추가 커밋이 별도로 있으면 가산점
면접 연계 질문 (이 과제 전용)
폼 상태 관리를 위해 어떤 방식을 선택했나요? 다른 방법과 비교했을 때 trade-off는?
단체 신청에서 참가자 10명의 이름/이메일을 입력하는 UX가 불편할 수 있는데, 개선한다면 어떻게 하겠나요?
3단계에서 제출 실패 시 사용자에게 어떤 경험을 제공하나요? 네트워크 에러와 비즈니스 에러를 구분하나요?
유효성 검증을 클라이언트와 서버 양쪽에서 해야 하는 이유는 무엇인가요?
현재 3단계인 폼이 5단계로 확장된다면 현재 구조에서 어디를 바꾸겠나요?
판단 근거 — 이 과제를 선정한 이유
폼은 FE에서 가장 빈번하고 중요한 패턴: 거의 모든 서비스에 폼이 있으며, 잘 설계된 폼과 그렇지 않은 폼의 차이가 사용자 경험에 직접적으로 영향을 줌
숙련도 차이가 명확히 드러나는 포인트 존재: 유효성 검증 에러 UX, 조건부 필드 데이터 처리, 제출 실패 복구 등에서 주니어와 시니어의 차이가 뚜렷함
AI 사용 후 통제 여부 판별 용이: AI는 기본 폼 구조를 잘 만들지만, 조건부 필드 전환 시 데이터 정합성이나 에러 UX 디테일은 지원자가 직접 판단해야 하는 영역
도메인 친숙성: 온라인 교육 플랫폼 수강 신청은 직관적이며, 도메인 이해 비용이 낮음
