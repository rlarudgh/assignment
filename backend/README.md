# Backend

## 프로젝트 개요

Assignment 프로젝트의 백엔드 서버입니다.  
Spring Boot 3.4 + Kotlin 2.1 기반으로 REST API를 제공하며, JPA(Hibernate)를 통해 MySQL 8.0과 연동합니다.  

## 기술 스택

| 분류 | 기술 |
|------|------|
| **Framework** | Spring Boot 3.4.5 |
| **Language** | Kotlin 2.1.21 (JVM 17) |
| **Database** | MySQL 8.0 |
| **ORM** | JPA (Hibernate) |
| **Build** | Gradle (Kotlin DSL) |
| **API Docs** | Swagger / Springdoc OpenAPI 2.8.8 |
| **Security** | Spring Security |
| **Architecture** | Layered Architecture |
| **Code Quality** | ktlint |

## 실행 방법

### 사전 요구사항

- JDK 17 이상
- Docker & Docker Compose (MySQL 실행용)

### 1. MySQL 실행

```bash
docker compose up -d mysql
```

### 2. 서버 실행

```bash
./gradlew bootRun
```

- API 서버: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html

### 3. 테스트 실행

```bash
./gradlew test
```

### 환경 변수

루트 디렉토리의 `.env` 파일 또는 환경 변수를 통해 설정합니다.

| 변수 | 설명 | 기본값 |
|------|------|--------|
| `DB_HOST` | MySQL 호스트 | `localhost` |
| `DB_PORT` | MySQL 포트 | `3306` |
| `DB_NAME` | 데이터베이스 이름 | `assignment_db` |
| `DB_USERNAME` | MySQL 사용자 | `root` |
| `DB_PASSWORD` | MySQL 비밀번호 | `password` |
| `JWT_SECRET` | JWT 서명용 비밀 키 | `change-me-in-production` |

## 요구사항 해석 및 가정

1. **RESTful API**: 프론트엔드와의 통신은 JSON 기반 REST API로 수행됩니다.
2. **인증/인가**: Spring Security + JWT를 기반으로 한 상태 없는(Stateless) 인증을 가정합니다.
3. **데이터베이스**: MySQL을 기본 RDBMS로 사용하며, JPA를 통해 객체-관계 매핑을 수행합니다.
4. **API 문서화**: Springdoc OpenAPI를 사용하여 코드 기반으로 API 명세를 자동 생성합니다.
5. **검증**: Spring Validation을 통해 요청 데이터의 유효성을 검증합니다.
6. **예외 처리**: `@ControllerAdvice`를 통한 전역 예외 처리로 일관된 에러 응답 형식을 제공합니다.

## 설계 결정과 이유

### 1. Layered Architecture

```
com.example.assignment/
├── config/        # Spring 설정 (CORS, Security, Swagger)
├── controller/    # REST API Controller
├── service/       # 비즈니스 로직
├── repository/    # 데이터 접근 (JPA Repository)
├── domain/        # JPA Entity
├── dto/           # Request/Response DTO
└── exception/     # 예외 처리
```

- **이유**: 관심사 분리(Separation of Concerns)를 통해 각 계층의 책임을 명확히 하고, 테스트와 유지보수를 용이하게 합니다.

### 2. Kotlin + Spring Boot

- **이유**: Null Safety로 NPE를 사전 방지하고, 데이터 클래스(data class)로 DTO/Entity 작성을 간결하게 합니다. 또한 코루틴 지원으로 향후 비동기 처리 확장이 용이합니다.

### 3. JPA (Hibernate) + MySQL

- **이유**: 객체 지향적인 도메인 모델링이 가능하며, DDL-auto 설정으로 개발 초기 스키마 변경을 신속하게 반영할 수 있습니다.

### 4. Springdoc OpenAPI

- **이유**: 별도의 API 문서 작성 없이 어노테이션 기반으로 Swagger UI를 자동 생성하여 프론트엔드-백엔드 협업 효율을 높입니다.

### 5. ktlint

- **이유**: Kotlin 코딩 컨벤션을 자동으로 검사하여 코드 스타일 일관성을 유지하고, 코드 리뷰에서 스타일 논쟁을 줄입니다.

## 미구현 / 제약사항

- **도메인 로직 미구현**: `controller/`, `service/`, `repository/`, `domain/`, `dto/` 패키지는 현재 비어 있거나 `.gitkeep` 상태입니다. 실제 비즈니스 요구사항에 따라 엔티티, 리포지토리, 서비스, 컨트롤러를 구현해야 합니다.
- **JWT 인증 미완성**: `SecurityConfig`와 `JWT_SECRET` 환경 변수는 설정되어 있으나, JWT 발급/검증 필터 및 로그인/회원가입 엔드포인트는 구현되지 않았습니다.
- **테스트 커버리지**: 현재 기본적인 Spring Boot 컨텍스트 로드 테스트만 존재하며, 단위 테스트 및 통합 테스트가 부족합니다.
- **운환경 설정**: `application-prod.yml` 및 로깅, 모니터링 설정이 없습니다. 현재는 `dev` 프로파일만 제공됩니다.
- **데이터 마이그레이션**: Flyway나 Liquibase 같은 DB 마이그레이션 도구를 사용하지 않고 `ddl-auto: update`를 사용 중입니다. 운환경에서는 반드시 마이그레이션 도구 도입이 필요합니다.

## AI 활용 범위

- **프로젝트 초기 설정**: Spring Boot 프로젝트 구조, Gradle 설정, 의존성 선정, Docker Compose 설정 등을 AI를 활용하여 구성했습니다.
- **코드 컨벤션**: ktlint 설정 및 `.editorconfig` 작성에 AI를 활용했습니다.
