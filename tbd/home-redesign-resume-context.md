# 작업 재개 컨텍스트 — home 재설계 (Editorial Stack, 시안 A)

> 작성: 2026-06-01 · 갱신: 2026-07-02 · 상태: **구현·검증·dev 머지·origin push·main 반영 완료.** 남은 것은 실 디바이스/시뮬 라이트 픽셀 육안 확인뿐.
> 이 문서는 상세 맥락(구현 내역·주의점)용. **지금 열린 할 일 요약은 [TODO.md](./TODO.md).**
> (아래 §2 git 상태는 dev/worktree 시절 기록 — 2026-07-02에 main-only로 전환·dev 브랜치 삭제됨. 히스토리 참고용.)

---

## 1. 한 줄 요약

홈 화면을 월드맵 제거 + editorial/feed 스타일(시안 A)로 재설계해 **로컬 dev 브랜치에 머지 완료**. 핸드오프(`../local-handoff/after-label-scan/`)를 시각 진실 소스로 사용. winemine-build 게이트(사양→구현→6항목 시각→QA)를 리더가 직접 수행해 통과. **시뮬레이터 부재로 실제 라이트 픽셀 확인은 미완** — 디바이스/시뮬에서 육안 확인 필요(유일한 열린 항목). 원격 push·main 반영은 2026-07-02 완료.

---

## 2. git 상태 (재개 시 먼저 확인)

- 현재 메인 체크아웃 브랜치: **dev** (`2384e11`).
- 홈 관련 커밋 (dev 위):
  - `2384e11` Merge feat/home-editorial (머지 커밋)
  - `995c657` feat(home): Wine browse 실 wines_localized 페이지네이션 연결
  - `d6429f7` wip(home): Editorial Stack 재설계 — dev 작업트리에서 워크트리로 복구
- dev가 origin/dev보다 **8 커밋 앞섬 (전부 미push)** — 위 홈 3 + moderation/spec 5.
- `feat/home-editorial` 브랜치: **삭제됨**, 워크트리(.claude/worktrees/home-editorial)도 **제거됨**.
- moderation stash(`stash@{0}: WIP on dev ... moderation`)는 **건드리지 말 것** — 다른 작업 보존용.
- **보류 중(사용자 명시 요청 전 금지)**: ① dev→main 머지 ② origin push.

---

## 3. 산출물 위치

| 항목 | 경로 |
|---|---|
| 시각 진실 소스 (핸드오프) | `/Users/yejinkim/dev/local-handoff/after-label-scan/` (README + "winemine Home Redesign - Light.html" 시안 A + reference/*.jsx) |
| 디자인 사양 (재작성) | `_workspace/design-specs/home.md` |
| 기존 월드맵 사양 백업 | `_workspace/design-specs/home.legacy-map.md` |
| 사양 작성 로그 | `_workspace/06_home_redesign_specs.md` |
| 화면 빌드 로그 | `_workspace/03_home_redesign_screens.md` |

(`_workspace/`는 untracked — 디스크에만 보존, 커밋 안 됨. 워크트리 cleanup 시 소실되므로 절대 main 경로에 작성했음.)

---

## 4. 구현된 것 (요약)

- **단일 `HomeFeed` 컨테이너** (`src/components/home/home-feed.tsx`) — 기존 first-time/heavy **mode 분기 제거**. `app/(tabs)/index.tsx`가 HomeFeed 렌더. 모듈 0건 시 모듈별 EmptyState.
- **시안 A 모듈 순서**: Header(기존) → Greeting → Stats(3) → Activity feed(3 rows) → Lesson card(full, 4px top-rule gradient) → Curated lists(가로 h-scroll, 4px left-border wine) → Trending(키워드 chips + ranked 1·2·3) → Wine browse(추천/트렌딩/탐험 탭 + 카드 + infinite loader). **월드맵 제거**.
- **신규 8**: `home-feed` / `home-greeting` / `home-activity-feed` / `home-curated-lists` / `home-trending` / `shared/section-header`(공용) / `shared/infinite-loader`(공용) / `hooks/use-home-activity` / `hooks/use-wine-browse`. (실제 신규 9 — use-wine-browse 추가됨)
- **확장**: HomeHeader(mode prop 제거·logo 28), StatHero(value 30·radius 16·border-gold), WineFeed/WineFeedRow(bottle 58·name 21·radius 18), TodayLessonCard(`variant:'home'`).
- **dead-code 14 삭제** (heavy-home, first-time-home, map-cameo, mini-map-preview, peak-greeting, quick-actions, recent-notes-*, home-community-peek 등 — 타 탭 미참조 grep 확인). 보존: suggested-actions(community 참조), tab-chip.
- **실 훅 연결**: Stats=useProfileStats, Activity=useHomeActivity(cellar drink-window), Lesson=useLessons, Curated=useMyLists, Trending=useCommunityFeed(익명 페르소나), **Browse=useWineBrowse**.
- **Wine browse 실 연결**: `use-wine-browse` — DEMO_MODE는 15와인 mock 카탈로그(`src/lib/mock/wines`), 실 모드는 `wines_localized` `.range()` 페이지네이션. home-feed ScrollView near-bottom(<600px) 감지로 loadMore(in-flight 가드). i18n home.* 28키 ko/en 양쪽.

---

## 5. 게이트 결과

- **시각 6항목 (코드레벨)**: 모듈 순서·요소 ✓ / radius 16·18·left-border 4px ✓ / bottle 58·logo 28 ✓ / gradient 4px top-rule ✓ / 색 토큰 하모나이즈 ✓ / typography Freesentation alias 위계 보존. **스크린샷 멀티모달 비교는 시뮬 부재로 미수행**.
- **정책**: emoji·hex(변경분) 0 / Pressable 3-layer 준수(audit DANGEROUS는 false-positive) / locale 28키 양쪽 일치 / 익명화·SERVICE_ROLE 0 / TS 회귀 0.

---

## 6. 리더 확정 결정 (재개 시 전제)

- **Q1 색**: 기존 브랜드 토큰으로 **하모나이즈** (핸드오프 hex는 prototype drift로 간주, homeLight 신규 그룹 안 만듦).
- **Q2 데이터**: 실 훅 + empty fallback (fabricated mock 노출 금지).
- **Q3**: mode 분기 제거 (단일 홈).
- **Q4**: Lesson `variant:'home'` prop (기본 'knowledge' 회귀 안전).
- **Q5**: curated 좌측 4px 보더 = wine 단색.
- **Q6**: 빈 모듈 EmptyState 노출.
- **Q7**: Wine browse 실 `wines_localized` 연결, **rating/price/grapes는 VIEW 미보유로 카드에서 숨김**.
- **Q8**: 라우트 존재 시 navigate, 미구현은 "준비 중" Alert.

---

## 7. 주의점 / 비자명한 결정 · 알려진 제약

- **wines_localized에 rating·price·grapes 없음** → Wine browse 카드가 핸드오프보다 단순(평점·가격 없음). **평점 집계 VIEW(avg of tasting_notes)는 별도 supabase 마이그레이션 = v0.2.0 후속**. 그게 들어오면 use-wine-browse 매퍼에 score 채우고 WineFeedRow가 자동 렌더(optional 처리 이미 됨).
- **Browse 탭(추천/트렌딩/탐험)은 v0.1.0 시각 전환만** — 쿼리 분기 미정, 동일 카탈로그 표시. 탭별 쿼리는 후속.
- **DEMO_MODE**에선 browse가 15와인 mock 카탈로그를 페이지네이션(6/page)으로 보여줌(정식 demo 콘텐츠, fabricated 아님).
- **pre-existing 이슈(홈 작업 회귀 아님, dev에 원래 있던 것)**: ① `app/cellar/[lwin]/index.tsx` emoji 1건 ② `today-lesson-card` knowledge gradient `as string[]` TS2769 1건(home variant는 stricter cast로 clean).
- **빌드 워크플로우 함정**: winemine-build에서 spawn한 백그라운드 에이전트는 워크트리 cwd를 상속 못 하고 repo 루트(dev)에 작업 → 이번에 빌더 산출물이 dev 작업트리에 떨어져 stash로 워크트리에 relocate해야 했다. 다음엔 **단일 화면은 spawn 말고 리더가 워크트리에서 직접** 구현하거나, 에이전트에 절대 워크트리 경로를 강제할 것. (메모리 `spawned-agents-pin-repo-root` 참조.)

---

## 8. 남은 일 (우선순위순)

1. **UI 디바이스/시뮬 육안 확인** — `npx expo start`(또는 `--tunnel`)로 홈 라이트 모드 띄워서 시안 A 레이아웃·spacing·infinite scroll·EmptyState 확인. 픽셀 보정 필요 시 해당 모듈만 재작업.
2. **(사용자 컨펌 후) origin push** — dev 8커밋 미push. 백업·타 세션 동기화용.
3. **rating 집계 VIEW (v0.2.0)** — wines_localized 또는 별도 wines_browse VIEW에 avg rating 추가 → Wine browse 카드 평점 복원.
4. **Browse 탭별 쿼리** — 추천/트렌딩/탐험 실제 분기.
5. **component-catalog 문서화** — `shared/section-header`·`shared/infinite-loader` 신규 공용 컴포넌트 카탈로그 항목 추가(코드 doc-comment엔 의도 명시됨).

---

## 9. 재개 방법

- **UI 확인**: `npx expo start --tunnel` → ngrok URL `curl -s http://127.0.0.1:4040/api/tunnels` → Expo Go에 `exp://<host>.exp.direct`.
- **추가 수정 시**: §4-13대로 dev 기준 워크트리(`git worktree add .claude/worktrees/<task> -b <task> dev`)에서 작업 후 dev 머지. **단일 화면 보정은 spawn보다 직접 편집 권장**(§7 함정).
- **후속(부분 재실행)**: `winemine-build` 스킬 — "홈 X 모듈만 다시", "rating VIEW 추가" 등. 입력 진실 소스 = `_workspace/design-specs/home.md` + 핸드오프 + 본 문서.

---

## 10. 미해결 결정 대기 (사용자 컨펌 필요)

- origin push 시점.
- dev→main 머지 시점.
- rating 집계 VIEW를 v0.1.0에 넣을지 v0.2.0으로 미룰지.
