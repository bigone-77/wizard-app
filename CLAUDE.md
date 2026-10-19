# CLAUDE.md — wizard-app

펫테일 게코 케어 앱의 React Native(Expo) 앱 저장소.
**"입양 준비부터 아픈 날까지, 내 도마뱀을 기억하는 친구 같은 박사"**

현재 단계: **V0 = 알파 테스트**. V0 범위 밖의 기능은 만들지 않는다.

---

## 기획 문서

기획 문서는 별도 저장소(`wizard-app-planning`)에 있다. 이 저장소 옆에 클론해두고 참고한다.

- 로컬: `../wizard-app-planning/docs/`
- 웹: https://wizard-app-planning.vercel.app/

| 무엇을 볼 때 | 문서 |
|---|---|
| 아키텍처, 폴더 구조, 데이터 접근, 서버 함수 입출력 | **16-architecture.md** |
| 두 저장소가 주고받는 데이터 형식 | **16-architecture.md 16장 (형식 약속)** |
| 테이블, 컬럼, 예외 처리 | 10-db-schema.md |
| 박사 동작 원칙 | 12-doctor-design.md |
| 박사 답변의 기준 | 13-doctor-answer-key.md |
| V0 범위 | 06-v0-features.md |
| 화면 목록과 구성 | 09-screen-list.md |
| 화면 흐름 | 08-user-flow.md |
| 현재 마일스톤과 완료 기준 | 15-dev-plan.md |

**문서끼리 충돌하면**: 데이터는 10, 박사 동작은 12, 범위는 06, 형식은 16장이 우선.

---

## 작업 절차

1. **할 일은 항상 `/start-task <ID>`로 시작한다** (예: `/start-task T012`). 이슈 확인 → 기획 감시자 판단 → 계획 제시 → **승인 후** 구현
2. **승인받은 계획 밖의 파일을 바꿔야 하면 멈추고 이유를 설명한다**
3. **테스트부터 쓴다.** 기대 동작은 15 완료 기준, 10 예외 상황, 13 정답지에서 가져온다
4. **사용자가 설명을 듣지 못한 변경은 남기지 않는다.** 물어보면 무엇을 왜 바꿨는지 설명한다
5. 작업 중 "이건 기획과 다르다" 싶으면 코드로 해결하지 말고 `plan-guardian`에게 확인 → 필요하면 계획 변경을 제안한다
6. **계획 변경은 기획 저장소에서**: 문서 수정 → `docs/17-weekly-todo.md` 표 수정(ID 유지) → `pnpm issues:sync`. GitHub 이슈의 제목·라벨·마일스톤은 직접 고치지 않는다

---

## 절대 어기지 않는 규칙

1. **위험 신호 확인은 LLM 없이 동작한다.** 사전 설계 흐름(`content/flows/`)으로 처리하고, 박사 예산·네트워크 상태와 무관하게 항상 실행된다
2. **`RED_FLAG`는 예약 노드다.** 어떤 흐름에서든 `red-flags` 흐름의 병원 권고로 간다. 흐름 정의로 바꿀 수 없다
3. **박사는 병명을 말하지 않고, 특정 제품을 추천하지 않는다.** 앱에 하드코딩하는 박사 문구도 마찬가지
4. **ID는 앱이 만든다.** 모든 insert는 `src/lib/ids.ts`의 UUIDv7로. 재시도는 같은 ID로 (`upsert(..., { ignoreDuplicates: true })`)
5. **`user_id`를 보내지 않는다.** DB 기본값과 RLS가 처리한다
6. **날짜·경과 일수·변화량은 코드가 계산한다** (`src/lib/time.ts`). 날짜 경계는 `profiles.timezone` 기준
7. **박사 LLM 답변은 앱이 저장하지 않는다.** 앱이 저장하는 박사 메시지는 사전 설계 흐름 메시지(`flow_node_id` 있음)뿐
8. **API 키를 앱에 넣지 않는다.** 앱에는 Supabase URL과 anon key만. LLM·STT는 서버 함수를 통해서만
9. **사진은 파일 먼저, 행 나중.** `pet-photos/{pet_id}/{photo_id}.jpg`에 업로드한 뒤 `photos` 행 저장
10. **여러 기록(음성)은 배열 하나로 insert한다.** 전부 저장되거나 전부 실패해야 한다

---

## 데이터 접근

- 단순 읽기·쓰기는 Supabase REST로 직접 (`supabase.from(...)`). 별도 API 서버 없음
- 서버 함수를 부르는 경우: `doctor-chat`, `evaluate-record`, `voice-record`, `delete-account`
- 기록 저장 순서: 낙관적 업데이트 → REST 저장 → `evaluate-record` 호출 → 박사 반응 표시
- 서버 상태는 TanStack Query로 관리. 쿼리 키는 기능 폴더별로 정의
- DB 에러는 `src/lib/errors.ts`에서 사용자 메시지로 변환 (16-architecture.md 11장)

---

## 형식 약속

- `src/contracts/`의 zod 스키마는 **16-architecture.md 16장**과 정확히 일치해야 한다
- jsonb 컬럼(`care_records.data`, `ai_messages.payload`)은 반드시 `src/contracts/` 스키마로 파싱
- 형식을 바꿔야 하면 코드부터 바꾸지 않는다. 순서: 기획 문서 16장 → `wizard-backend` → 이 저장소
- DB 타입은 직접 수정하지 않는다. `npm run db:types`로 재생성

---

## 코드 규칙

- TypeScript strict. `any` 금지
- 화면은 `app/` (Expo Router), 로직은 `src/features/{기능}/`
- 화면 ID(S01~S13)와 경로는 16-architecture.md 4장 표를 따른다
- 앱 실행 이동 규칙은 `app/_layout.tsx` 한 곳에서만 처리
- 사전 설계 흐름의 문구 치환(`{pet_name}`)은 앱이 처리
- 스타일은 디자인 토큰만 사용. 색·간격을 하드코딩하지 않는다
- 홈에 넣지 않는 것: 할 일 개수, 빨간 "기한 지남" 배지, 연속 기록(streak)

---

## 환경

| 변수 | local | dev | alpha |
|---|---|---|---|
| `EXPO_PUBLIC_APP_ENV` | `local` | `dev` | `alpha` |
| `EXPO_PUBLIC_SUPABASE_URL` | `http://127.0.0.1:54321` | 개발용 프로젝트 | 알파 프로젝트 |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | 로컬 키 | 개발용 키 | 알파 키 |
| `EXPO_PUBLIC_ENABLE_EMAIL_LOGIN` | `true` | `true` | `false` |

- 항상 **개발 빌드**로 실행한다 (Expo Go는 푸시 불가)
- 테스트 기기: iOS 시뮬레이터, Google Play가 포함된 안드로이드 에뮬레이터
- 로컬 Supabase는 `wizard-backend`에서 `npx supabase start`

---

## 테스트

| 대상 | 도구 |
|---|---|
| 흐름 실행기, 시간 계산, zod 스키마, 홈 상태 계산 등 순수 로직 | Vitest |
| 메시지 렌더링, 하단 칩, 확인 카드 등 컴포넌트 | Jest + React Native Testing Library |
| 로그인 → 등록 → 기록 → 박사 → 병원 권고 | Maestro (박사 응답은 목업) |

- LLM 응답은 정확한 문장 비교·스냅샷으로 테스트하지 않는다

---

## 하지 말 것

- 기획 문서의 **"미정"** 항목(스타일 라이브러리, STT, LLM 모델 등)을 임의로 정하지 않는다. 물어본다
- V0 범위 밖 기능(여러 마리, 계정 없이 시작, 커뮤니티 등)을 추가하지 않는다
- 개체 수 제한, 박사 예산을 앱 코드에 하드코딩하지 않는다 (서버 설정값)

---

## 커밋

형식: `{이모지} {타입}: {요약}` + 필요하면 본문

| 이모지 | 타입 | 용도 |
|---|---|---|
| 🎉 | Start | 새 프로젝트 시작 |
| ✨ | Feat | 새로운 기능 추가 |
| 🐛 | Fix | 버그 수정 |
| 🎨 | Design | CSS 등 사용자 UI 디자인 변경 |
| ♻️ | Refactor | 코드 리팩토링 |
| 🔧 | Settings | 설정 파일 변경 |
| 🗃️ | Comment | 주석 추가 및 변경 |
| ➕ | Dependency/Plugin | 의존성·플러그인 추가 |
| 📝 | Docs | 문서 수정 |
| 🔀 | Merge | 브랜치 병합 |
| 🚀 | Deploy | 배포 |
| 🚚 | Rename | 파일·폴더 이름 변경이나 이동만 |
| 🔥 | Remove | 파일 삭제만 |
| ⏪️ | Revert | 이전 버전으로 롤백 |

```text
✨ Feat: 기록 저장과 기록 시점 검사 연결

- 저장 후 evaluate-record 호출, 박사 반응 표시
- 같은 ID로 재시도
```

- 결정이 바뀐 커밋은 본문에 **왜** 바꿨는지 적는다 (결정 이력은 git으로 관리)

---

## 브랜치

```text
feature/* → dev → release/v0.x.y → main
hotfix/*  (최신 release = main에서 출발) → main → release/v0.x.(y+1) → dev
```

| 브랜치 | 역할 | 환경 |
|---|---|---|
| `feature/*` | 기능 개발. `dev`에서 만들고 PR로 `dev`에 합침 | 로컬 (Docker) |
| `dev` | **검증하는 곳.** 기능이 모이고 테스트 환경에서 확인 | 테스트 (dev 프로젝트, 내부 테스트 빌드) |
| `release/v0.x.y` | **버전 기록.** 검증이 끝난 `dev`를 버전 이름으로 잘라냄. 만들자마자 `main`에 합침 | — |
| `main` | **운영.** 항상 최신 release와 같음. 합칠 때마다 버전 태그 | 운영 (알파 프로젝트, TestFlight · Play 내부 테스트) |
| `hotfix/*` | 운영 긴급 수정 | — |

### 규칙
- **"최신 release = main"을 항상 유지한다**
- `main`, `release/*`에는 직접 커밋하지 않는다. **release에서 작업하지 않는다** — 고칠 게 생기면 `dev`에서 고치고 새 release를 자른다
- 브랜치 이름: `{종류}/{마일스톤}-{내용}` — 예: `feature/m1-auth`, `feature/m3-records`, `hotfix/record-retry`
- 두 저장소를 함께 바꿀 때: 양쪽에 같은 이름의 브랜치, 합치는 순서는 `wizard-backend` → `wizard-app`

### 배포 (release → main)
1. `dev`에서 `release/v0.x.0` 생성 (두 번째 자리 +1)
2. 바로 `main`에 합치고 태그 `v0.x.0`
3. 운영 배포

### hotfix
1. 최신 release(= main)에서 `hotfix/{내용}` 생성
2. 수정
3. `main`에 합치고 태그 `v0.x.(y+1)` (세 번째 자리 +1)
4. `main`과 같은 상태로 `release/v0.x.(y+1)` 생성 → "최신 release = main" 유지
5. **`dev`에도 합친다** (빼먹으면 다음 release에서 버그가 되살아남)

### 버전
| 상황 | 버전 |
|---|---|
| release → main | `v0.1.0` → `v0.2.0` |
| hotfix → main | `v0.2.0` → `v0.2.1` |
| 정식 출시 | `v1.0.0` |

앞자리 `0` = 정식 출시 전(알파). V0 알파도 `main`은 운영으로 다룬다.
- 앱 버전(`app.json`의 `version`)은 태그와 맞추고, 빌드 번호는 빌드마다 올린다