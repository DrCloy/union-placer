# AGENTS.md

이 프로젝트는 메이플스토리 유니온 블록을 자동으로 최적 배치하는 웹 서비스입니다.

## Setup commands

```bash
# 의존성 설치 (pre-commit hook 자동 등록)
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 타입 체크
npm run typecheck

# 린트
npm run lint

# 포맷 적용
npm run format

# 타입 체크 + 린트 + 포맷 검사 (작업 완료 전 필수)
npm run check

# 테스트 실행
npm run test
```

## Tech stack

- Vite + React 19 (React Compiler 활성화)
- TypeScript (strict mode)
- Tailwind CSS v4
- Zustand v5 (상태 관리)
- Vercel Functions (Serverless)
- Web Worker (배치 알고리즘)

## Project structure

```text
src/
├── types/               # 타입 정의 (아무것도 import 안 함)
├── constants/           # 상수 데이터 (types/ 만 import 가능)
├── lib/                 # 유틸리티 (types/, constants/ 만)
│   └── algorithm/       # 배치 알고리즘
├── workers/             # Web Worker (types/, constants/, lib/ 만 — store·hooks 금지)
├── store/               # Zustand 스토어 (types/, constants/, lib/ 만)
├── hooks/               # 커스텀 훅 (types/, store/, lib/ 만)
└── components/          # UI 컴포넌트 (전부 가능)
    ├── common/          # 공통 (Button, Input, Modal)
    ├── block-input/     # 블록 입력
    ├── settings/        # 설정
    ├── result/          # 결과
    └── layout/          # 레이아웃
```

## Import layer rules (위반 금지)

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

ESLint가 위반 시 에러로 강제합니다. `npm run check`로 확인하세요.

## Development workflow

**작업 종류에 맞는 브랜치로 PR → 리뷰 → merge 진행합니다.**

```
기능 작업 시작
  └─ git checkout -b phase/N-description
      └─ 작업 + 커밋
          └─ (pre-commit hook: npm run check 자동 실행)
              └─ 작업 완료 → gh pr create
                  └─ CodeRabbit AI 자동 리뷰
                      └─ 지적사항 수정 후 재커밋
                          └─ 사용자 최종 Approve
                              └─ Squash merge → main
```

브랜치 구분:

- 기능 구현: `phase/N-description`
- 운영/문서/설정/CI/워크플로우: `ops/short-description`
- 긴급 수정: `hotfix/short-description`

규칙:

- `main` 직접 커밋 금지
- PR 없이 merge 금지
- 사용자 Approve 없이 merge 금지
- CodeRabbit 지적사항은 에이전트가 수정 후 재커밋

운영 기준 참고:

- 환경/검증 게이트, 리뷰 학습 루프, 임시 문서 정책은 `.github/instructions/workflow.instructions.md`를 단일 소스로 따른다.

상세: `.github/instructions/workflow.instructions.md`

## Agent checklist (작업 완료 전 필수)

```
□ npm run check 통과 (typecheck + lint + format check)
□ import 레이어 위반 없음
□ any 타입 없음
□ 명명 규칙 준수 → .github/instructions/naming.instructions.md
□ 도메인 용어 준수 → .github/instructions/domain.instructions.md
□ 컴포넌트당 하나의 파일
```

## Documentation

상세 기획/설계 문서는 `docs/` 참고:

| 문서                 | 설명                  |
| -------------------- | --------------------- |
| 00-plan.md           | 마스터 계획           |
| 02-requirements.md   | 요구사항 정의         |
| 03-feature-spec.md   | 기능 명세             |
| 05-data-model.md     | 데이터 모델           |
| 06-algorithm.md      | 배치 알고리즘         |
| 07-architecture.md   | 시스템 아키텍처       |
| 08-task-breakdown.md | Phase 1~8 태스크 분해 |

## Instructions

- 코딩 규칙: `.github/instructions/coding-style.instructions.md`
- 네이밍 규칙: `.github/instructions/naming.instructions.md`
- 커밋 규칙: `.github/instructions/commit.instructions.md`
- 도메인 지식: `.github/instructions/domain.instructions.md`
- 개발 워크플로우: `.github/instructions/workflow.instructions.md`
