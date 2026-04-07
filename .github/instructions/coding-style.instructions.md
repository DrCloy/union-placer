---
applyTo: "**/*.{ts,tsx}"
---

# Coding Style

## TypeScript

- strict mode 필수
- `any` 타입 사용 금지 (ESLint `@typescript-eslint/no-explicit-any: error` 적용)
- 명시적 타입 선언 권장
- 타입은 `src/types/`에 도메인별로 분리

## React

- 함수형 컴포넌트 + Hooks만 사용
- Props 인터페이스는 컴포넌트 파일 상단에 정의
- 컴포넌트당 하나의 파일

```typescript
// Good
interface ButtonProps {
  label: string;
  onClick: () => void;
}

export function Button({ label, onClick }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>;
}
```

## Styling

- Tailwind CSS 유틸리티 클래스 사용
- 커스텀 CSS 최소화
- 인라인 스타일 금지

## Import layer rules (위반 시 ESLint 에러)

레이어 간 단방향 의존성을 강제한다. 아래 방향으로만 import 가능.

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

**금지 예시:**

```typescript
// ❌ lib/ 에서 store/ import
import { useUnionStore } from "@/store/unionStore";

// ❌ workers/ 에서 hooks/ import
import { useBlocks } from "@/hooks/useBlocks";

// ❌ store/ 에서 components/ import
import { Button } from "@/components/common/Button";
```

## Imports 순서

path alias 사용: `@/` = `src/`

```typescript
// 1. 외부 라이브러리
import { useState } from "react";
// 2. 내부 모듈 (@/ 순서: types → constants → lib → store → hooks → components)
import type { Block } from "@/types/block";
import { useUnionStore } from "@/store/unionStore";
import { Button } from "@/components/common/Button";
```

## Checklist (코드 생성 후 반드시 확인)

```
□ npm run check 통과 (typecheck + lint)
□ import 레이어 위반 없음
□ any 타입 없음
□ 컴포넌트당 하나의 파일
```
