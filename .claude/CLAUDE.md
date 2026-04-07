# CLAUDE.md

메이플스토리 유니온 블록 자동 최적 배치 웹 서비스.

## Commands

```bash
npm run dev       # 개발 서버
npm run build     # 프로덕션 빌드
npm run typecheck # TypeScript 타입 검사
npm run lint      # ESLint
npm run check     # typecheck + lint (작업 완료 전 필수)
```

## Stack

Vite + React 19 (React Compiler), TypeScript strict, Tailwind CSS v4, Zustand v5, Vercel Functions, Web Worker

## Rules

세부 규칙은 `.claude/rules/`에서 자동 로드됩니다.

- `coding-style.md` — TypeScript, React, import 레이어 규칙
- `naming.md` — 파일명, 변수명, 도메인 용어
- `domain.md` — 블록·보드·스탯·API 도메인 지식
- `commit.md` — 커밋 컨벤션
- `workflow.md` — 브랜치·PR·코드 리뷰 워크플로우

## Checklist (작업 완료 전 필수)

```
□ npm run check 통과
□ import 레이어 위반 없음
□ any 타입 없음
□ 명명 규칙 준수 (.claude/rules/naming.md)
□ 도메인 용어 준수 (.claude/rules/domain.md)
□ 컴포넌트당 하나의 파일
```
