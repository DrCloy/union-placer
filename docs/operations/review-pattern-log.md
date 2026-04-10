## Review Pattern Log

리뷰에서 반복되거나 재발 가능성이 있는 패턴을 영구 기록한다.
세션 메모리에 의존하지 않고, 규칙 승격 여부를 판단하는 단일 로그로 사용한다.

### 기록 규칙

- PR 리뷰 반영 직후 1회 기록한다.
- 단발성 이슈도 먼저 로그에 남긴다.
- 동일 패턴이 2회 이상 반복되면 `.github/instructions/*` 또는 `.claude/rules/*` 반영 후보로 승격한다.
- 규칙 반영 후에는 검증 결과와 함께 상태를 갱신한다.

### Entry Template

```markdown
## YYYY-MM-DD PR #number

- pattern: naming | import layer | type safety | test quality | workflow
- source: CodeRabbit | reviewer
- summary:
- root cause:
- action:
- status: logged | promoted | fixed
- verification:
```
