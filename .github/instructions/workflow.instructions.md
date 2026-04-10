---
applyTo: "**"
---

# Development Workflow

## 브랜치 전략

- `main`: 항상 배포 가능한 상태 — 직접 커밋 금지
- 기능 구현 브랜치: `phase/N-description` (예: `phase/1-types`, `phase/2-constants`, `phase/ui-stitch`)
- 운영 브랜치: `ops/short-description` (예: `ops/preflight-docs-settings`, `ops/pr-template`)
- 긴급 수정 브랜치: `hotfix/short-description` (예: `hotfix/api-timeout`)
- `docs/*`, `chore/*` 성격 작업은 별도 prefix를 만들지 않고 `ops/*`로 통합
- 작업 시작 시 목적에 맞는 브랜치를 생성 후 진행

## Phase 완료 → PR 흐름

1. 브랜치 생성: 작업 성격에 맞는 브랜치 생성 (`phase/*`, `ops/*`, `hotfix/*`)
2. 작업 + 커밋 (pre-commit hook이 `npm run check` 자동 실행)
3. 작업 완료 시 `gh pr create`로 PR 생성
4. CodeRabbit AI 자동 리뷰 (PR 생성 직후 자동)
5. CodeRabbit 지적사항 수정 후 재커밋
6. 사용자 최종 Approve
7. Squash merge + 브랜치 삭제

## PR 형식

제목: `feat: implement phase N — short description`

본문/체크리스트는 `.github/pull_request_template.md`를 단일 소스로 사용한다.

## CodeRabbit

코드 리뷰는 CodeRabbit AI (coderabbitai)가 자동 수행합니다.
설정: `.coderabbit.yaml`

- 레이어별 import 규칙 자동 감지
- `any` 타입 감지
- 컴포넌트 파일 규칙, API 보안 점검

## 에이전트 규칙

- 작업 시작 전 목적에 맞는 브랜치 생성
- 작업 완료 시 PR 생성 후 사용자에게 리뷰 요청
- CodeRabbit 지적사항은 에이전트가 수정 후 재커밋
- 사용자 승인(Approve) 없이 main merge 금지

## 환경/검증 운영 기준

- `npm run check`를 단일 품질 게이트로 사용한다.
- pre-commit hook은 `npm run check`와 동일 기준을 강제한다.
- 테스트 검증은 `npm run test`를 기준으로 수행한다.
- CI는 `npm run check` + `npm run test`를 동일 기준으로 수행한다.

## 리뷰 학습 루프

PR 리뷰 반영 직후 아래 루프를 1회 실행한다.

1. 리뷰 코멘트 수집
2. 패턴 분류 (`naming`, `import layer`, `type safety`, `test quality`, `workflow`)
3. 로그 기록 (`docs/operations/review-pattern-log.md`)
4. 규칙/문서 반영 (`.github/instructions/*`, `.claude/rules/*`)
5. 검증 (`npm run check`) 후 재발 방지 상태 갱신

로그 기록 필드:

- `pattern`
- `source`
- `summary`
- `root cause`
- `action`
- `status`
- `verification`

승격 기준:

- 1회 발생: 로그에 기록
- 2회 이상 반복: 규칙 업데이트 후보로 승격
- 규칙 반영 후: 로그의 `status`, `verification` 갱신

## 임시 문서 운영 정책

- 임시 문서는 `docs/operations/tmp/` 하위에서만 운영한다.
- 작업 종료 후 임시 문서는 제거한다.
- 확정된 기준/절차만 영구 문서 또는 규칙 문서로 이관한다.
