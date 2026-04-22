# Assignment

## Tech Stack

| Area | Stack |
|------|-------|
| Frontend | React, TypeScript, Next.js (App Router), Bun, TailwindCSS, Zustand |
| Backend | Spring Boot 3.4, Kotlin, JPA (Hibernate), MySQL 8.0 |
| Architecture | FSD (Feature-Sliced Design) |

## Quick Start

```bash
# 1. 의존성 설치 & MySQL 실행
./scripts/setup.sh

# 2. 개발 서버 실행
./scripts/dev.sh
```

- Frontend: http://localhost:3000
- Backend: http://localhost:8080

## Structure

```
frontend/     # Next.js + FSD
backend/      # Spring Boot + Kotlin
scripts/      # 유틸리티 스크립트
.github/      # CI/CD & 템플릿
```
