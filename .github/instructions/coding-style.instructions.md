---
applyTo: "**/*.{ts,tsx}"
---

# Coding Style

## TypeScript

- strict mode 필수
- `any` 타입 사용 금지
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

## Imports

- path alias 사용: @/ = src/
- 외부 라이브러리 → 내부 모듈 순서

```typescript
// Good
import { useState } from "react";
import { useStore } from "@/store";
import { Button } from "@/components/common/Button";
```

## Path Alias 설정

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
// vite.config.ts
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```
