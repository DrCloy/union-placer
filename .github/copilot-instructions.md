# Copilot Instructions

이 프로젝트는 메이플스토리 유니온 블록을 자동으로 최적 배치하는 웹 서비스입니다.

## Tech stack

- Vite + React 19 (React Compiler 활성화)
- TypeScript (strict mode)
- Tailwind CSS v4
- Zustand v5 (상태 관리)
- Vercel Functions (Serverless)
- Web Worker (배치 알고리즘)

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

ESLint가 위반 시 에러로 강제합니다. 코드 생성 후 `npm run check`로 확인하세요.

## Development workflow

- `main` 직접 커밋 금지
- Phase 시작: `git checkout -b phase/N-description`
- Phase 완료: `gh pr create` → CodeRabbit 자동 리뷰 → 지적사항 수정 → 사용자 Approve → Squash merge
- 상세: `.github/instructions/workflow.instructions.md`

## Checklist (작업 완료 전 필수)

```
□ npm run check 통과 (typecheck + lint + format check)
□ import 레이어 위반 없음
□ any 타입 없음
□ 명명 규칙 준수 → .github/instructions/naming.instructions.md
□ 도메인 용어 준수 → .github/instructions/domain.instructions.md
□ 컴포넌트당 하나의 파일
```

## Instruction files

- 코딩 규칙: `.github/instructions/coding-style.instructions.md`
- 네이밍 규칙: `.github/instructions/naming.instructions.md`
- 커밋 규칙: `.github/instructions/commit.instructions.md`
- 도메인 지식: `.github/instructions/domain.instructions.md`
- 개발 워크플로우: `.github/instructions/workflow.instructions.md`
