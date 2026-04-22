# Commit Convention

## Format

```
<type>: <subject>
```

## Types

| Type | Description |
|------|-------------|
| `feat` | 새로운 기능 추가 |
| `fix` | 버그 수정 |
| `build` | 빌드 관련 파일 수정, 모듈 설치/삭제 |
| `chore` | 그 외 자잘한 수정 |
| `ci` | CI 관련 설정 수정 |
| `docs` | 문서 수정 |
| `style` | 코드 스타일/포맷 수정 (로직 변경 없음) |
| `refactor` | 코드 리팩토링 |
| `test` | 테스트 코드 수정 |
| `perf` | 성능 개선 |

## Rules

- subject는 한글 또는 영문으로 간결하게 작성
- subject 끝에 마침표 없음
- 한 커밋에 하나의 논리적 변경사항만 포함
