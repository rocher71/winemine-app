# 작업 재개 컨텍스트 — moderation (신고·차단)

> 작성: 2026-06-01 · 갱신: 2026-07-02 · 상태: **기능 구현·검증·dev 머지·원격 push·types 재생성 완료**. 남은 것은 출시 카피 다듬기 + dev→main/origin push(사용자 컨펌 대기).
> 이 문서는 상세 맥락(구현 내역·주의점)용. **지금 열린 할 일 요약은 [TODO.md](./TODO.md).**

---

## 0. 2026-07-02 업데이트 (원격 push 완료)

- paused 상태였던 원격 프로젝트(mthxqkljhydguixsjvmr) restore → `supabase db push`로 moderation 7 마이그레이션 원격 적용 완료.
- **wines 181,915 / wine_korean_names 5,240 손상 0 검증**(push 전후 동일). wine_metadata 181,915 동일.
- 새 테이블 comments/reports/user_blocks RLS enabled + 정책 확인. 보안 advisor 신규 회귀 0(anon 접근·admin RPC security definer 경고는 익명 auth + assert_admin 설계상 의도. ERROR 2건 profiles_public/wine_lists_stats security definer view는 push 이전부터 존재, 이번 무관).
- `shared/types/database.types.ts` `supabase gen types --linked` 전체 재생성 → 소비처 정합(profiles_public nullable coalesce, use-other-user-profile nickname, mock users/tasting-notes 신규 컬럼). tsc 신규 에러 0(pre-existing 12건 무관). worktree `types-regen-moderation`에서 작업 후 dev 머지(7b7910d), worktree 제거·브랜치 삭제 완료.
- 아래 §5 item 1·2(원격 push, types 재생성)는 **완료**. §2의 "미push 5커밋"·§8의 "원격 push 지금 진행할지"는 해소됨.
- **dev→main 머지 완료** (2026-07-02, PR #2 MERGED, origin/main=c3a41ef). origin/dev·main 동기화됨.

### 커뮤니티 피드 `...` 신고 버튼 (2026-07-02, 완료 · 실기기 검증됨)

증상: 커뮤니티 리스트 피드 카드 우상단 `...` 탭 시 진동만 오고 무동작이던 것을 신고 흐름으로 배선. 3단계로 수정 완료:
1. `onMore` 미배선 → `ContentActionMenu`(신고)에 배선. `comm-feed-card`는 `onMore` 있을 때만 `...` 렌더(본인 글 미노출).
2. 시트 안 뜨는 mount 레이스 → `menuActions` 상수화로 사전 mount.
3. 시트가 헤더/탭바/FAB 위로 안 덮이는 문제 → **이 스택(RN0.81 Fabric+Reanimated4)에서 `@gorhom BottomSheetModal`(포털) 미동작 확인.** plain BottomSheet 를 루트 `ModerationSheetProvider`(app/_layout, Stack 다음 형제)로 호스팅해 네비게이터 위 전체 오버레이 구현. `useModerationSheet().openPostActions({targetType,targetId})` 로 재사용.

**실기기(iOS 시뮬레이터) 확인 완료** — 시트 정상 표시 + 헤더·탭바·FAB 어둡게 오버레이. dev 머지됨(ebc5294).
주의(다음 세션): **BottomSheetModal 은 이 스택에서 쓰지 말 것.** 전체 오버레이가 필요한 시트는 `ModerationSheetProvider` 패턴(루트 plain BottomSheet)을 따를 것.

**[미완 — BE 연동] 신고가 실제로 저장되지 않음 (프런트만 완성):**
- `use-report` 는 `reports` 테이블에 실제 INSERT 하고 테이블/RLS/트리거는 원격 배포됨(BE DDL 존재).
- 그러나 **커뮤니티 피드가 mock 데이터**(`community_posts` 원격 0행 → `useCommunityFeed` 가 mock 글 표시). 신고 대상 `target_id` 가 mock post id('p1' 등)라 `reports.target_id`(uuid) INSERT 가 성립하지 않음 → **신고 제출이 실제로 저장 안 됨(에러, UI 무반응)**. 또한 `use-report` 는 `getCurrentUserId()` 없으면(비로그인/DEMO) 'error' 반환.
- 즉 **신고 기능은 UI·시트만 완성**, 실데이터 end-to-end 미동작. **필요한 BE 작업: 커뮤니티 피드를 실 `community_posts` 로 연동(실 posts 생성/조회)** → 그래야 실 UUID 대상으로 신고가 저장됨. (block/기타 target_type=comment/note/list/profile 도 동일하게 실데이터 연동 필요.)

---

## 1. 한 줄 요약

moderation(신고·차단, Apple 1.2 UGC) 기능을 winemine-build 팀(5 에이전트)으로 빌드해 **로컬 dev 브랜치에 머지 완료**. 모든 게이트 통과(백엔드 22 assertions / 디자인 6/6 / QA 10/10, wines 손상 0). **원격 Supabase에 마이그레이션 미push** 상태라, 앱에서 신고/차단 실제 동작은 push 전까지 에러날 수 있음(UI 레이아웃·플로우 확인은 가능).

---

## 2. git 상태 (재개 시 먼저 확인)

- 현재 메인 체크아웃 브랜치: **dev** (UI 확인용으로 dev에 둔 상태. 원래는 main이었음.)
- dev가 origin/dev보다 **5 커밋 앞섬 (전부 미push)**:
  - `8b2d252` Merge feat/moderation (머지 커밋)
  - `9372935` feat(moderation): 7 마이그레이션 + 보안 가드 + UI
  - `e2bce87` docs(moderation): 구현 스펙
  - `6a31695`, `b109e02` — 기존 specs 서브모듈 bump (모더레이션과 무관, 원래 있던 미push 커밋)
- `feat/moderation` 브랜치: 머지 후에도 **남아 있음** (삭제 안 함 — 필요 시 `git branch -d feat/moderation`).
- 워킹트리: `M specs`(서브모듈 포인터) 세션 전부터 있던 변경 — 모더레이션 무관, 건드리지 말 것.
- **보류 중(사용자 명시 요청 전 금지)**: ① dev→main 머지 ② origin push.
- 워크트리(.claude/worktrees/moderation)는 머지 후 제거 완료.

---

## 3. 산출물 위치

| 항목 | 경로 |
|---|---|
| 구현 스펙 (진실 소스) | `docs/spec/moderation.md` |
| 컴포넌트 카탈로그 | `docs/component-catalog/moderation.md` |
| 디자인 사양 5건 | `_workspace/design-specs/moderation-*.md` |
| 백엔드 빌드 로그 | `_workspace/02_moderation_backend.md` |
| 화면 빌드 로그 | `_workspace/03_moderation_screens.md` |
| 디자인 사양 로그 | `_workspace/06_moderation_specs.md` |
| 디자인 리뷰 보고서 | `_workspace/design-review_moderation_20260531_215540.md` |
| QA 보고서 | `_workspace/qa_moderation_20260531_215750.md` |

마이그레이션: `supabase/migrations/20260601000000~000600_*.sql` (7개). 테스트: `supabase/tests/*.sql` (7개, 22 assertions).
(`_workspace/`는 gitignore — 디스크에만 보존, 커밋 안 됨.)

---

## 4. 구현된 것 (요약)

- **백엔드**: comments 실테이블(mock 영속화) / reports(polymorphic) / user_blocks / moderation_status 컬럼(5테이블) / profiles.role.
  - 2단계 임계값 트리거: 고유 신고자 ≥3 → pending(전 콘텐츠), >10 → 댓글 removed(원문 보존).
  - blocked_user_ids() 양방향 차단 RLS 필터 + follows 자동해제.
  - admin RPC: moderation_restore/remove/report_dismiss (role=admin 검증) + admin_pending_queue VIEW.
  - 보안: guard_moderation_status() 트리거(콘텐츠 4종) + profiles RLS WITH CHECK → author self-restore 차단(5테이블).
- **프론트**: ReportSheet / BlockConfirmSheet / ContentActionMenu (공용 컴포넌트) + app/settings/blocked + settings 2행(차단목록 / 문의·신고 support@winemine.site) + 5개 진입점(community post/comments/notes/lists/profile) + use-report/use-blocks 훅 + i18n moderation 45키(ko/en).
  - comments 화면: mock(`src/lib/mock/community-comments.ts`) → 실 테이블 연동(`src/lib/community/comments.ts`).
  - removed 댓글: 원문 보존 + tombstone 렌더(작성자명·시각·답글 유지).

---

## 5. 남은 일 (출시 전 follow-up, 우선순위순)

1. **[CRITICAL] 원격 Supabase 마이그레이션 push** — `supabase db push`. 사전에 기존 wines/wine_korean_names count diff 0 SQL 재검증(로컬 컨테이너 down이라 라이브 재검증을 못 했고 백엔드 로그 22 assertions로 대체했음). push 전까지 앱에서 신고/차단 시 원격에 테이블 없어 에러.
2. **types 재생성** — `shared/types/database.types.ts`가 핸드 확장 상태(CLI introspection이 Docker exec format error로 실패해서). push 후 `supabase gen types --linked`로 전체 재생성 필요. 기존 파일도 5/19 시점이라 stale(community_posts/wine_lists 등 포함).
3. **ko/en 출시 카피 문구 검토** — 신고 사유·차단 안내 등. 키 구조·제안값은 확정, 문구만 다듬기.
4. **자잘한 정리** — (a) design-spec doc 토큰 오기 1건: report/block 사양 매핑표가 light.border.active를 #B89438로 기재(실제 토큰 #C9A84C, 구현은 올바름) → design-spec-author가 doc 정정. (b) P2 스크린샷 캡처 후 BottomSheet snapPoints 높이 적합성 1회 확인.

---

## 6. 주의점 / 비자명한 결정

- **데이터 경계(부채)**: 실 comments는 author_id(UUID)만 보유, 커뮤니티 표시명·레벨은 mock `COMM_USERS` 레지스트리 기반 → `profiles_public` 조인 후 `registerCommunityUser`로 CommentRow 호환. 기존 `use-community-posts`와 동일 패턴(새 결정 아님). 표시는 anonymous_display만 노출(§4-5 위반 없음). v0.x 과도기 부채.
- **확정된 스펙 open_questions**: target_type = post(커뮤니티포스트)/note(시음노트)/comment/list/profile. 댓글 body = 단일 text(ko/en 아님).
- **tasting_notes 차단필터 미적용**은 의도된 것 — owner-only(최강 제약)라 차단 필터 불필요(마이그레이션에 문서화).
- **audit-pressable.sh가 report-sheet/content-action-menu를 DANGEROUS로 플래그**하나 스크립트 주석이 명시한 inner-View false positive. 수동 확인 결과 진성 위반 0.

---

## 7. 재개 방법

- **UI 확인(터널, 외부망 OK)**: `npx expo start --tunnel` → ngrok URL은 `curl -s http://127.0.0.1:4040/api/tunnels`로 확인 → Expo Go에 `exp://<host>.exp.direct` 입력. (이전 세션 터널 서버는 종료됐을 것이므로 재실행 필요.)
- **빌드 후속(부분 재실행)**: `winemine-build` 스킬은 후속 작업 지원 — "원격 push", "types 재생성", "마이그레이션 수정" 등 요청 시 해당 에이전트(supabase-engineer/release-engineer)만 활성화. 입력 진실 소스는 `docs/spec/moderation.md` + 본 문서.
- **추가 수정 시**: §4-13대로 dev 기준 워크트리(`git worktree add .claude/worktrees/<task> -b <task> dev`)에서 작업 후 dev 머지.

---

## 8. 미해결 결정 대기 (사용자 컨펌 필요)

- 원격 push + types 재생성을 지금 진행할지 (사용자가 UI 확인 후 결정하기로 함).
- dev→main 머지 시점.
- origin push 시점.
- feat/moderation 브랜치 삭제 여부.
