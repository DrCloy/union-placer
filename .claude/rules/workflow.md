---
paths: []
---

# Development Workflow

## 브랜치 전략

- `main`: 항상 배포 가능한 상태 — 직접 커밋 금지
- 기능 브랜치: `phase/N-description` (예: `phase/1-types`, `phase/2-constants`, `phase/ui-stitch`)
- Phase 시작 시 반드시 브랜치 생성 후 작업

## Phase 완료 → PR 흐름

### 1단계: PR 생성 전 사전 확인

Phase 작업 완료 후 PR 생성 전에 반드시 아래를 확인한다.

```bash
# 열린 PR 목록 확인
gh pr list

# main과의 diff 확인
git fetch origin
git diff origin/main...HEAD --name-only
```

**열린 PR이 있는 경우:**

- 해당 PR과 현재 브랜치가 **같은 파일을 수정했는지** 확인
- 겹치는 파일이 없으면 → PR 생성 진행
- 겹치는 파일이 있으면 → 충돌 가능성이 있으므로 아래 절차 수행:

  ```bash
  # 선행 PR이 merge된 후 main을 현재 브랜치에 rebase
  git fetch origin
  git rebase origin/main

  # 충돌 발생 시 로컬에서 해결 후
  git add <resolved-files>
  git rebase --continue

  # npm run check로 검증
  npm run check
  ```

  충돌 해결 후 PR 생성 진행.

### 2단계: PR 생성

```bash
gh pr create --title "<type>: <subject>" --body "..."
```

PR 본문 템플릿:

```markdown
## 작업 내용

- N-1: ...
- N-2: ...

## 체크리스트

- [ ] npm run check 통과
- [ ] import 레이어 위반 없음
- [ ] any 타입 없음
- [ ] 명명 규칙 준수
- [ ] 도메인 용어 준수
- [ ] 컴포넌트당 하나의 파일

## 참고 문서

docs/08-task-breakdown.md — Phase N 상세
```

PR 생성 후 사용자에게 PR URL과 함께 CodeRabbit 리뷰 대기 중임을 알린다.

### 3단계: CodeRabbit 리뷰 반영

사용자가 "리뷰 달렸어" 또는 "리뷰 반영해줘"라고 하면 에이전트가 직접 수행:

```bash
# CodeRabbit 인라인 코멘트 조회
gh pr view <PR_NUMBER> --json reviews
gh api repos/<owner>/<repo>/pulls/<PR_NUMBER>/reviews/<REVIEW_ID>/comments
```

각 지적사항에 대해:

- 프로젝트 규칙(import 레이어, 네이밍, 도메인 용어 등)에 비추어 타당성 검토
- 타당한 지적 → 파일 직접 수정
- 부당하거나 프로젝트 맥락에 맞지 않는 지적 → 이유와 함께 사용자에게 보고

수정 후:

```bash
npm run check
git add <changed-files>
git commit -m "<commit.md 규칙에 따른 메시지>"
git push
```

### 4단계: PR merge 전 충돌 확인

merge 직전에도 충돌 가능성을 재확인한다.

```bash
git fetch origin
git log origin/main..HEAD --oneline   # 선행 merge가 있었는지 확인
```

**이미 생성된 PR에 충돌이 발생한 경우:**

```bash
# main 최신 상태를 현재 브랜치에 rebase
git fetch origin
git rebase origin/main

# 충돌 해결 후
git add <resolved-files>
git rebase --continue

npm run check
git push --force-with-lease   # rebase 후 force push (현재 브랜치에 한해 허용)
```

### 5단계: 사용자 승인 + Squash merge

```bash
gh pr merge <PR_NUMBER> --squash --delete-branch
```

사용자 Approve 없이 merge 금지.

---

## 코드 리뷰

코드 리뷰는 **CodeRabbit AI** (coderabbitai)가 자동으로 수행합니다.
설정: `.coderabbit.yaml`

CodeRabbit 리뷰 항목:

- import 레이어 위반 (각 레이어별 허용 import 명시됨)
- `any` 타입 사용
- 인라인 스타일, Tailwind 규칙 위반
- 컴포넌트당 하나의 파일 위반
- API 보안 (환경변수 노출 등)

사용자 최종 확인 항목:

- 도메인 용어 준수 (`.claude/rules/domain.md`)
- 문서(docs/)와 구현 내용 일치

---

## 에이전트 규칙 요약

- Phase 시작 전 브랜치 생성
- PR 생성 전 열린 PR 목록 + 충돌 가능성 확인
- 충돌 가능성이 있으면 rebase로 로컬 해결 후 PR 생성
- PR 생성 후 사용자에게 PR URL 보고
- 사용자가 리뷰 알림 시 CodeRabbit 코멘트 조회 → 검토 → 수정 → 재커밋
- merge 전 충돌 재확인, 필요 시 rebase + force-with-lease push
- 사용자 Approve 없이 merge 금지
- 커밋 메시지: `.claude/rules/commit.md` 준수
