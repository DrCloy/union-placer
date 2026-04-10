---
applyTo: "**"
---

# Development Workflow

## 브랜치 전략

- `main`: 항상 배포 가능한 상태 — 직접 커밋 금지
- 기능 브랜치: `phase/N-description` (예: `phase/1-types`, `phase/2-constants`, `phase/ui-stitch`)
- Phase 시작 시 반드시 브랜치 생성 후 작업

## Phase 완료 → PR 흐름

1. 브랜치 생성: `git checkout -b phase/N-description`
2. 작업 + 커밋 (pre-commit hook이 `npm run check` 자동 실행)
3. Phase 완료 시 `gh pr create`로 PR 생성
4. CodeRabbit AI 자동 리뷰 (PR 생성 직후 자동)
5. CodeRabbit 지적사항 수정 후 재커밋
6. 사용자 최종 Approve
7. Squash merge + 브랜치 삭제

## PR 형식

제목: `feat: implement phase N — short description`

본문:

```markdown
## 작업 내용

- 태스크 목록

## 체크리스트

- [ ] npm run check 통과
- [ ] import 레이어 위반 없음
- [ ] any 타입 없음
- [ ] 명명 규칙 준수
- [ ] 도메인 용어 준수
- [ ] 컴포넌트당 하나의 파일
```

## CodeRabbit

코드 리뷰는 CodeRabbit AI (coderabbitai)가 자동 수행합니다.
설정: `.coderabbit.yaml`

- 레이어별 import 규칙 자동 감지
- `any` 타입 감지
- 컴포넌트 파일 규칙, API 보안 점검

## 에이전트 규칙

- Phase 시작 전 브랜치 생성
- Phase 완료 시 PR 생성 후 사용자에게 리뷰 요청
- CodeRabbit 지적사항은 에이전트가 수정 후 재커밋
- 사용자 승인(Approve) 없이 main merge 금지
