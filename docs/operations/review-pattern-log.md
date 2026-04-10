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

## 2026-04-10 PR #8

- pattern: test quality
- source: CodeRabbit
- summary: 테스트가 `DEFAULT_PRIORITY` 실행 결과를 `PRESET_CUSTOM_PRIORITY.hunting` 기준으로 비교하고, API 테스트가 URL 인코딩/헤더 표현 형식에 과결합되어 있었음
- root cause: 실행 인자(`Priority`)와 비교 인자(`CustomPriority`)의 경계가 테스트에서 일관되게 정규화되지 않았고, 요청 검증을 문자열 매칭 중심으로 작성함
- action: `resolveCustomPriority` 헬퍼로 비교 기준을 실행 기준에서 파생하고, URL은 `URL`/`searchParams` 파싱으로 검증하며 헤더는 `HeadersInit` 정규화 검증으로 변경
- status: fixed
- verification: `npm run test` 통과 (107 passed), `npm run check` 실행 완료 (에러 없음, coverage 산출물 관련 lint warning 3건)
