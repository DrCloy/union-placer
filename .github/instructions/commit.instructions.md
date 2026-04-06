---
applyTo: "**/*"
---

# Commit Convention

Conventional Commits 형식을 따른다.

## 형식

```
<type>: <subject> (#issue)

<body> (optional)
- bullet line 1
- bullet line 2

```

## 규칙

- 영어로 작성
- subject는 50자 이내
- 마침표 없음
- 관련 이슈가 있으면 (#issue) 추가

### Type

| Type     | 설명                         |
| -------- | ---------------------------- |
| feat     | 새 기능                      |
| fix      | 버그 수정                    |
| docs     | 문서 변경                    |
| style    | 코드 포맷팅 (기능 변경 없음) |
| refactor | 리팩토링                     |
| test     | 테스트 추가/수정             |
| chore    | 빌드, 설정 등                |

### Subject

- 작업 내용을 압축하여 작성
- 동사 원형으로 시작

```text
feat: add block rotation logic
fix: resolve character selection bug
docs: update algorithm design document
```

### Body

- subject만으로 설명이 불가능할 경우에만 작성
- 동사로 시작하는 간략한 문장
- bullet(-)으로 줄마다 구분

```text
feat: add block placement validation (#12)

- check if all blocks are connected
- validate center 4 cells constraint
- return detailed error messages
```

### 예시

```text
feat: implement block variant generation
fix: correct cell counting on character toggle (#45)
docs: add system architecture document
refactor: split store into separate modules
```
