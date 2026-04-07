---
paths:
  - "src/**/*.ts"
  - "src/**/*.tsx"
---

# Coding Style

## TypeScript

- strict mode 필수
- `any` 타입 금지 (`@typescript-eslint/no-explicit-any: error`)
- 명시적 타입 선언 권장
- 타입은 `src/types/`에 도메인별로 분리

## React

- 함수형 컴포넌트 + Hooks만 사용
- Props 인터페이스는 컴포넌트 파일 상단에 정의
- 컴포넌트당 하나의 파일

## Styling

- Tailwind CSS 유틸리티 클래스만 사용
- 커스텀 CSS 최소화
- 인라인 스타일 금지

## Import layer rules (ESLint 에러로 강제)

```
types/        ← 아무것도 import 안 함
constants/    ← types/ 만
lib/          ← types/, constants/ 만
workers/      ← types/, constants/, lib/ 만  ※ store·hooks 금지
store/        ← types/, constants/, lib/ 만
hooks/        ← types/, store/, lib/ 만
components/   ← 전부 가능
```

## Imports 순서

path alias 사용: `@/` = `src/`

```typescript
// 1. 외부 라이브러리
import { useState } from "react";
// 2. 내부 (@/ 순서: types → constants → lib → store → hooks → components)
import type { Block } from "@/types/block";
import { useUnionStore } from "@/store/unionStore";
```
