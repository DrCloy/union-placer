# 개발 계획 (마스터 인덱스)

## 현재 상태

| Phase                   | 상태                       | 다음 할 일                      |
| ----------------------- | -------------------------- | ------------------------------- |
| Phase 0 — 하네스 인프라 | ✅ 완료                    | —                               |
| Phase D — 문서 보완     | ✅ 완료                    | —                               |
| Phase UI — 디자인       | 🔄 설계 완료 / 작업 미시작 | UI-1 Stitch Stage 1 (직접 작업) |
| Phase 1~8 — 구현        | ⬜ 미시작                  | Phase 0·D·UI 완료 후 시작       |

**권장 진행 순서:** ~~Phase D~~ → Phase UI → Phase 1~8

---

## 프로젝트 개요

메이플스토리 유니온 블록 자동 최적 배치 웹 서비스.
→ 상세: [01-project-overview.md](01-project-overview.md)

---

## 개발 방법론 — Harness Engineering

에이전트가 코드를 작성하고, 사람은 설계·프롬프트에 집중한다.
모든 규칙은 시스템이 강제한다 (ESLint, hooks, typecheck).

### 의존성 레이어 (위반 금지)

```
types/        ← 아무것도 import 안 함
    ↓
constants/    ← types/ 만
    ↓
lib/          ← types/, constants/ 만
    ↓
workers/      ← types/, constants/, lib/ 만  ※ store·hooks import 금지
store/        ← types/, constants/, lib/ 만
    ↓
hooks/        ← types/, store/, lib/ 만
    ↓
components/   ← 전부 가능
```

### 에이전트 체크리스트 (작업 완료 전 필수)

```
□ npm run check 통과 (typecheck + lint)
□ import 레이어 위반 없음
□ any 타입 없음
□ 명명 규칙 준수 → naming.instructions.md
□ 도메인 용어 준수 → domain.instructions.md
□ 컴포넌트당 하나의 파일
```

### 개발 워크플로우

브랜치 전략 및 PR·리뷰 흐름 → `.claude/rules/workflow.md`

```
Phase 시작
  └─ git checkout -b phase/N-description
      └─ 작업 + 커밋 (pre-commit: npm run check 자동 실행)
          └─ PR 생성 전: 열린 PR 확인 + 충돌 가능성 검토
              └─ 충돌 가능 → 로컬 rebase 해결 후 PR 생성
              └─ 충돌 없음 → gh pr create
                  └─ CodeRabbit AI 자동 리뷰
                      └─ 사용자 알림 시 코멘트 조회 → 검토 → 수정 → 재커밋
                          └─ merge 전 충돌 재확인 (필요 시 rebase + force-with-lease)
                              └─ 사용자 Approve → Squash merge → main
```

- main 직접 커밋 금지
- PR 없이 merge 금지
- 사용자 Approve 없이 merge 금지
- CodeRabbit 설정: `.coderabbit.yaml`
- 상세 워크플로우: `.claude/rules/workflow.md`

---

## Phase 0 — 하네스 인프라 ✅

| #      | 작업                                                                            | 파일                                                  | 상태 |
| ------ | ------------------------------------------------------------------------------- | ----------------------------------------------------- | ---- |
| 0-init | Vite + React 19 + React Compiler + Tailwind CSS v4 + Zustand v5 프로젝트 초기화 | `package.json` 외                                     | ✅   |
| 0-1    | AGENTS.md 업데이트 (레이어 + 체크리스트)                                        | `AGENTS.md`                                           | ✅   |
| 0-2    | ESLint import 레이어 규칙 + no-explicit-any                                     | `eslint.config.js`                                    | ✅   |
| 0-3    | `npm run typecheck/check` 스크립트 + `@/` path alias                            | `package.json`, `tsconfig.app.json`, `vite.config.ts` | ✅   |
| 0-4    | Claude Code hooks (PostToolUse → check)                                         | `.claude/settings.json`                               | ✅   |
| 0-5    | VS Code Copilot 설정 (instructions + tasks + MCP)                               | `.github/copilot-instructions.md`, `.vscode/`         | ✅   |
| 0-6    | Stitch MCP 등록 (Claude Code 유저 레벨)                                         | `~/.claude.json`                                      | ✅   |
| 0-7    | pre-commit hook (커밋 전 check 자동 실행)                                       | `.githooks/pre-commit`, `package.json` prepare        | ✅   |
| 0-8    | 개발 워크플로우 규칙 (브랜치·PR·리뷰)                                          | `.claude/rules/workflow.md`, `.github/instructions/`  | ✅   |
| 0-9    | CodeRabbit AI 코드 리뷰 설정                                                    | `.coderabbit.yaml`                                    | ✅   |
| 0-10   | CodeRabbit 리뷰 검토·수정 워크플로우 (에이전트 직접 수행)                       | `.claude/rules/workflow.md`                           | ✅   |

**비고:**

- Nexon Open API: 공식 MCP 없음 → `src/lib/api/nexon.ts`에서 REST 직접 호출
- GitHub: `gh` CLI로 작업, MCP 불필요
- `.vscode/mcp.json`은 gitignore 처리 (API Key 포함)
- CodeRabbit 리뷰 검토·수정: 에이전트가 `gh` CLI로 코멘트를 조회하고 파일을 직접 수정

---

## Phase D — 문서 보완

| #   | 작업                                   | 파일                                                | 상태 |
| --- | -------------------------------------- | --------------------------------------------------- | ---- |
| D-1 | 알고리즘 문서 완성 (backtracking 이후) | `docs/06-algorithm.md`                              | ✅   |
| D-2 | 태스크 분해 문서 작성                  | `docs/08-task-breakdown.md`                         | ✅   |
| D-3 | coding-style에 import 레이어 규칙 추가 | `.github/instructions/coding-style.instructions.md` | ✅   |

---

## Phase UI — 디자인

Stitch 3단계 파이프라인. UI-1·3·5는 직접 작업, 나머지는 에이전트 위임.
→ 파이프라인 상세: [design/plan.md](../design/plan.md)
→ 확정 디자인 토큰: [design/tokens.md](../design/tokens.md)

| #    | 작업                              | 담당          | 상태 |
| ---- | --------------------------------- | ------------- | ---- |
| UI-1 | Stage 1: 디자인 토큰 화면 생성    | 직접 (Stitch) | ⬜   |
| UI-2 | Stage 1 결과 → tokens.md 업데이트 | 에이전트      | ⬜   |
| UI-3 | Stage 2: 컴포넌트 시트 생성       | 직접 (Stitch) | ⬜   |
| UI-4 | Stage 2 결과 → components.md 작성 | 에이전트      | ⬜   |
| UI-5 | Stage 3: 페이지 목업 5장 생성     | 직접 (Stitch) | ⬜   |
| UI-6 | Stage 3 결과 → wireframes.md 작성 | 에이전트      | ⬜   |
| UI-7 | Storybook 설치 + 기본 설정        | 에이전트      | ⬜   |
| UI-8 | Playwright 설치 + E2E 기본 설정   | 에이전트      | ⬜   |

---

## Phase 1~8 — 구현

→ 상세: [docs/08-task-breakdown.md](08-task-breakdown.md)

| Phase | 범위                      | 입력 조건        |
| ----- | ------------------------- | ---------------- |
| 1     | `types/` 타입 정의        | Phase D 완료     |
| 2     | `constants/` 상수 데이터  | Phase 1 완료     |
| 3     | `lib/algorithm/` 알고리즘 | Phase 1·2 완료   |
| 4     | `lib/` 유틸·API           | Phase 1·2 완료   |
| 5     | `store/` Zustand 스토어   | Phase 1·2·3 완료 |
| 6     | `workers/` + `hooks/`     | Phase 3·5 완료   |
| 7     | `components/` UI 컴포넌트 | Phase UI·5 완료  |
| 8     | `api/` + 배포 설정        | Phase 4 완료     |

---

## 문서 맵

| 문서                        | 내용                              |
| --------------------------- | --------------------------------- |
| `docs/02-requirements.md`   | 요구사항                          |
| `docs/03-feature-spec.md`   | 기능 명세                         |
| `docs/05-data-model.md`     | 타입·데이터 모델                  |
| `docs/06-algorithm.md`      | 배치 알고리즘 설계                |
| `docs/07-architecture.md`   | 시스템 아키텍처·폴더 구조         |
| `docs/08-task-breakdown.md` | 구현 태스크 분해 (Phase 1~8 상세)      |
| `design/tokens.md`          | 디자인 토큰 (색상·타이포·간격)    |
| `design/plan.md`            | Stitch 파이프라인·컴포넌트 목록   |
| `design/components.md`      | 컴포넌트 UI 스펙 (UI-4 작성 예정) |
| `design/wireframes.md`      | 페이지 목업 스펙 (UI-6 작성 예정) |
| `.github/instructions/`     | 코딩·네이밍·도메인·커밋 규칙      |
