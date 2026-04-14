# Copilot Instructions

AGENTS.md와 `.github/instructions/` 규칙 파일이 자동 로드됩니다.

## Instruction files

각 파일은 `applyTo` 설정으로 자동 로드되며, `.claude/rules/` 파일의 원본(origin)입니다.

- `coding-style.instructions.md` (`**/*.{ts,tsx}`) — TypeScript, React, import 레이어 규칙
- `naming.instructions.md` (`**/*`) — 파일명, 변수명, 도메인 용어
- `domain.instructions.md` (`src/**/*`) — 블록·보드·스탯·API 도메인 지식
- `commit.instructions.md` (`**/*`) — 커밋 컨벤션
- `workflow.instructions.md` (`**`) — 브랜치·PR·코드 리뷰 워크플로우
