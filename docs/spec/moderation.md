<project_specification>
<project_name>winemine — Moderation: Report & Block (launch-blocking)</project_name>

<overview>
사용자 생성 콘텐츠(UGC) 모더레이션 체계. Apple App Store Guideline 1.2 / Google Play UGC 정책 충족을 위한 출시 필수(launch-blocking) 기능.

도메인 결정(확정)은 specs 서브모듈의 `specs/domain/ux-decisions/moderation-report-block.md`(Status: confirmed, 2026-05-30)에 잠겨 있다. 이 문서는 그 결정의 **구현 스펙** — "무엇을·왜"가 아니라 "어떻게"(DDL/RLS/진입점/공용 컴포넌트/i18n)만 다룬다. 결정 자체를 바꾸지 않는다.

4기둥(specs Decision 1):
- A. 신고(Report) — 콘텐츠 신고 + 24h 대응 → 임계값 자동 숨김 버퍼
- B. 차단(Block) — 악성 유저 양방향 차단
- C. 조치/필터 — 반응형 + 고유 신고자 ≥3 자동 pending
- D. 연락처 — 지원 이메일 공개

확정 사항(사용자 결정 2026-05-31):
- 댓글은 실 테이블로 먼저 영속화한 뒤 모더레이션 적용 (현재 mock `lib/mock/community-comments.ts` → `comments` 테이블 신설).
- 임계값 자동 조치는 **DB 트리거**로 구현 (Edge Function 아님 — Plan D §4-8 "로직 80%는 SQL"에 부합, TS 얇게 유지).
- **2단계 임계값**: 고유 신고자 ≥3 → `pending`(잠정 숨김, 모든 콘텐츠) / 고유 신고자 >10 → `removed`(자동 삭제, **댓글에만**).
- 10건 자동 삭제는 **원문 보존 + 표시 계층 교체** — DB body는 그대로 두고 status='removed'면 UI가 "신고로 인해 삭제된 댓글입니다" 문구를 렌더(운영자 복구·감사 가능, 데이터 손실 없음).
- admin은 **수동 운영**(Supabase Studio) + 미래 admin 페이지가 호출할 **RPC API만** 미리 작성(앱 내 admin UI 없음). 자동화는 위 2단계 트리거로만 한정(리스크 최소화).
- admin 인증: `profiles.role`(user/admin) 컬럼 추가 + admin RPC가 caller role=admin 검증(forward-compatible). 지금은 Studio에서 수동 admin 지정.
- 본 문서는 구현 스펙 작성까지. 빌드는 사용자 리뷰 후 winemine-build 하네스로 착수.
- 지원 이메일 확정: **support@winemine.site** (앱 내 + 스토어 메타데이터 동일).

CRITICAL: 신고 대상은 여러 테이블에 흩어져 있다(community_posts, tasting_notes, wine_lists, comments, profiles). target은 polymorphic(`target_type` + `target_id`)로 단일 `reports` 테이블에 적재한다.
CRITICAL: 차단은 양방향 비가시 — A가 B를 차단하면 모든 read 경로에서 서로의 콘텐츠가 사라진다. RLS 우회 금지(§4-6)이므로 쿼리레벨이 아닌 RLS에서 강제하는 것을 기본으로 한다.
CRITICAL: 모든 사용자 노출 텍스트 ko/en 양방향(§4-4). 신고 사유 라벨, 차단 확인 문구, 연락처 안내 포함.
CRITICAL: 기존 wines / wine_korean_names 데이터 손상 0. 신규 테이블·컬럼은 ADD만, 기존 RLS는 USING 절 확장만(기존 권한 축소 없이 차단 필터·moderation_status 필터 AND 추가).
</overview>

<scope_boundaries>
  <in_scope>
    - DB 마이그레이션:
      - `reports` 테이블 (polymorphic target, 고유 신고자 1회 제약, status)
      - `user_blocks` 테이블 (blocker/blocked, 양방향 조회)
      - `comments` 테이블 신설 (현 mock 영속화 — 댓글 신고 선결 조건)
      - 콘텐츠 테이블에 `moderation_status` 컬럼 추가: community_posts, tasting_notes, wine_lists, comments, profiles
      - `profiles.role` 컬럼 추가 (user/admin) — admin RPC 인증용
      - 2단계 임계값 **DB 트리거**: 고유 신고자 ≥3 → `pending`(모든 콘텐츠) / >10 → `removed`(댓글에만)
      - admin RPC API(미래 admin 페이지 호출용): moderation_restore / moderation_remove / report_dismiss + pending 큐 VIEW
      - 양방향 차단 필터: `blocked_user_ids()` SECURITY DEFINER 함수 + 각 콘텐츠 SELECT RLS에 필터 추가
      - moderation_status 가시성 필터: 비작성자에게 visible 만 노출(작성자는 자기 pending 열람 가능)
      - 차단 시 기존 follows 양방향 자동 해제 (트리거 또는 차단 RPC 내)
    - 공용 컴포넌트(§4-14 재사용 우선):
      - `ReportSheet` — 신고 사유 6종 라디오 + other 자유입력 바텀시트 (모든 신고 진입점 공유)
      - `BlockConfirmSheet` — 차단/해제 확인 바텀시트
      - `ContentActionMenu` — 콘텐츠 우상단 ... 메뉴(신고/차단 진입, 본인 콘텐츠면 수정/삭제)
    - 신고 진입점(콘텐츠별 ... 메뉴):
      - 커뮤니티 포스트 (note/column/album/list) — `app/community/[postId]/index.tsx`
      - 댓글·답글 — `app/community/[postId]/comments.tsx`
      - 공유 시음 노트 — `app/notes/[noteId].tsx`
      - 리스트 — `app/cellar/lists/[id]/index.tsx`
      - 프로필(닉네임·소개) — `app/profile/[userId]/index.tsx`
    - 차단 진입점: 타 유저 프로필(`profile/[userId]`) 헤더 ... 메뉴
    - 차단 목록 관리 화면: `app/settings/blocked.tsx` (목록 + 해제)
    - 연락처(기둥 D): `app/settings/index.tsx` "문의·신고" 행 → 지원 이메일 노출
    - 훅: `use-report.ts`(신고 제출), `use-blocks.ts`(차단 목록/토글)
    - i18n: ko/en moderation 네임스페이스
    - admin pending 큐 VIEW + admin RPC API (운영자 확정용 — 앱 내 UI는 범위 외, API/VIEW만)
  </in_scope>
  <out_of_scope>
    - 운영자 admin 화면 UI (Supabase Studio + RPC API + pending 큐 VIEW로 대체, 앱 내 UI 없음 — 미래 admin 페이지에서 RPC 재사용)
    - 작성자 제재(경고/정지) API·자동화 — future (이번엔 복구/삭제/기각 API만)
    - 사전 욕설 필터 (specs Decision 3에서 미채택)
    - 신고 처리 결과 푸시 알림 (추후)
    - 차단 사유 입력 (차단은 사유 없이 즉시)
  </out_of_scope>
  <future_considerations>
    - 작성자 제재(경고/정지) 상태 머신 + RLS 반영
    - 신고/처리 결과 in-app 알림
    - admin 큐 앱 내 화면 (전용 운영자 role)
    - 임계값 튜닝(현재 고정 3) 운영 설정화
  </future_considerations>
</scope_boundaries>

<technology_stack>
  <mobile_app>
    <framework>React Native 0.81 + Expo SDK 54 (newArchEnabled: true, Fabric)</framework>
    <routing>expo-router (file-based)</routing>
    <styling>NativeWind v4.1 + inline StyleSheet (§4-11 Pressable 3-layer 패턴)</styling>
    <i18n>i18next + react-i18next (ko/en)</i18n>
    <icons>lucide-react-native (Flag, Ban, MoreVertical/Ellipsis 기존 패턴)</icons>
  </mobile_app>
  <backend>
    <db>Supabase Postgres (PostgREST, RLS) — 트리거·RLS·함수 중심(§4-8)</db>
    <auth>Supabase Auth (가입 회원 JWT, auth.uid())</auth>
    <client>@supabase/supabase-js (기존 client 재사용)</client>
  </backend>
</technology_stack>

<file_structure>
supabase/migrations/
├── 2026XXXX000000_comments.sql                 # 댓글 실 테이블 + RLS (mock 영속화)
├── 2026XXXX000100_moderation_status.sql        # 콘텐츠 테이블 moderation_status 컬럼 + profiles.role 컬럼 + 기존 SELECT RLS 가시성 필터 확장
├── 2026XXXX000200_reports.sql                  # reports 테이블 + RLS + 2단계 임계값 트리거(≥3 pending / >10 댓글 removed)
├── 2026XXXX000300_user_blocks.sql              # user_blocks 테이블 + blocked_user_ids() 함수 + follows 자동해제
├── 2026XXXX000400_block_filter_rls.sql         # 각 콘텐츠 SELECT RLS 에 차단 필터 AND 추가
└── 2026XXXX000500_admin_api.sql                # pending 큐 VIEW + admin RPC(restore/remove/dismiss, role=admin 검증)

app/
├── settings/
│   ├── index.tsx            # MODIFY: "문의·신고"(연락처) + "차단 목록" 행 추가
│   └── blocked.tsx          # NEW: 차단 목록 관리/해제
├── community/[postId]/
│   ├── index.tsx            # MODIFY: 포스트 ... 메뉴 → ContentActionMenu
│   └── comments.tsx         # MODIFY: 댓글 행 ... 메뉴 + 실 테이블 연동
├── notes/[noteId].tsx       # MODIFY: 공유 노트 ... 메뉴
├── cellar/lists/[id]/index.tsx  # MODIFY: 리스트 ... 메뉴
└── profile/[userId]/index.tsx   # MODIFY: 헤더 ... 메뉴 (신고 + 차단)

src/
├── components/moderation/
│   ├── content-action-menu.tsx  # NEW: ... 메뉴 (신고/차단/본인이면 수정·삭제)
│   ├── report-sheet.tsx         # NEW: 신고 사유 + other 입력 바텀시트
│   └── block-confirm-sheet.tsx  # NEW: 차단/해제 확인
├── hooks/
│   ├── use-report.ts            # NEW: 신고 제출 (중복 1회 제약 처리)
│   └── use-blocks.ts            # NEW: 차단 목록 조회 + 토글
└── lib/i18n/
    ├── ko.json                  # MODIFY: moderation 네임스페이스
    └── en.json                  # MODIFY: moderation 네임스페이스

docs/component-catalog/
└── moderation.md                # NEW: ReportSheet/BlockConfirmSheet/ContentActionMenu 재사용 기록(§4-14)
</file_structure>

<data_model>
  <table name="comments">
    현재 mock(`lib/mock/community-comments.ts`)을 실 테이블로 영속화. 댓글 신고의 선결 조건.
    컬럼(안):
    - id uuid PK default gen_random_uuid()
    - post_id uuid NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE
    - author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
    - parent_id uuid REFERENCES comments(id) ON DELETE CASCADE  -- 답글
    - body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000)
    - moderation_status text NOT NULL DEFAULT 'visible' CHECK (moderation_status IN ('visible','pending','removed'))
    - created_at timestamptz NOT NULL DEFAULT now()
    RLS: SELECT(visible OR 본인 OR 비차단) / INSERT(author_id=auth.uid()) / UPDATE·DELETE(본인).
    NOTE: 본문 LocalizedString 여부는 기존 mock shape({ko,en}) 확인 후 결정 — 사용자 입력 댓글은 단일 언어가 자연스러움. 결정은 빌드 시 design-spec-author가 mock과 대조해 고정.
  </table>

  <table name="reports">
    polymorphic target. specs Decision 6 기반.
    - id uuid PK default gen_random_uuid()
    - reporter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
    - target_type text NOT NULL CHECK (target_type IN ('post','comment','note','list','profile'))
    - target_id uuid NOT NULL
    - reason text NOT NULL CHECK (reason IN ('spam','harassment','sexual','misinfo','impersonation','other'))
    - detail text CHECK (detail IS NULL OR char_length(detail) <= 1000)  -- other 일 때 필수(앱+DB 양쪽 검증)
    - status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','reviewed','dismissed'))
    - created_at timestamptz NOT NULL DEFAULT now()
    - UNIQUE (reporter_id, target_type, target_id)  -- 동일 유저 1회만(중복 카운트 방지, specs Decision 2)
    - CHECK (reason <> 'other' OR detail IS NOT NULL)  -- other 자유입력 필수
    RLS: INSERT(reporter_id=auth.uid()) / SELECT(본인 신고건만; 운영자는 service_role). 작성자에게 피신고 사실 노출 금지.
  </table>

  <table name="user_blocks">
    - id uuid PK default gen_random_uuid()
    - blocker_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
    - blocked_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
    - created_at timestamptz NOT NULL DEFAULT now()
    - UNIQUE (blocker_id, blocked_id)
    - CHECK (blocker_id <> blocked_id)
    RLS: SELECT(blocker_id=auth.uid() — 본인 차단목록만) / INSERT(blocker_id=auth.uid()) / DELETE(blocker_id=auth.uid()).
  </table>

  <column_additions>
    moderation_status text NOT NULL DEFAULT 'visible' CHECK (... IN ('visible','pending','removed')) 를
    community_posts / tasting_notes / wine_lists / comments / profiles 에 ADD COLUMN IF NOT EXISTS.
    profiles 의 경우 'pending'은 닉네임·bio 노출 차단(콘텐츠는 별도 status 유지).

    profiles.role text NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin')) — admin RPC 인증용.
    지금은 Studio에서 수동으로 특정 계정만 'admin' 지정. 일반 유저는 이 컬럼을 수정 못 함(RLS UPDATE에서 role 변경 차단).
  </column_additions>
</data_model>

<rls_and_triggers>
  <threshold_trigger>
    트리거: reports AFTER INSERT. 2단계 임계값.
    로직: 동일 (target_type, target_id) 의 고유 reporter_id COUNT(DISTINCT) = n 계산.
      - n ≥ 3  → 모든 target_type: moderation_status 'visible' → 'pending' (잠정 숨김, specs Decision 3).
      - n > 10 AND target_type = 'comment' → comments.moderation_status → 'removed' (자동 삭제).
        * 댓글 한정(사용자 결정). 다른 콘텐츠는 10건 넘어도 pending 유지(운영자 확정 필요).
        * removed 는 **원문 보존** — body 컬럼 그대로, UI가 status='removed' 면 i18n tombstone 문구 렌더.
          DB 원문 파기 안 함 → 운영자 복구(moderation_restore)·신고 타당성 검토 가능.
    이미 removed 면 변경 없음(멱등). pending→removed 전환은 허용.
    CASE target_type WHEN 'post' THEN community_posts ... WHEN 'comment' THEN comments ... 등 분기.
    임계값 3·10 은 트리거 함수 내 상수(추후 설정화 future).
  </threshold_trigger>

  <block_filter>
    SECURITY DEFINER 함수 blocked_user_ids() RETURNS setof uuid:
      auth.uid() 기준 양방향 — 내가 차단한 자(blocked_id) ∪ 나를 차단한 자(blocker_id) 전부 반환.
    각 콘텐츠 SELECT RLS USING 절에 AND author_id <> ALL (ARRAY(SELECT blocked_user_ids())) 추가.
    가시성 필터도 함께: AND (moderation_status = 'visible' OR author_id = auth.uid()).
    기존 정책은 USING 절 확장만 — 기존 허용 범위를 줄이지 않도록 AND 로만 결합. SQL 단위 테스트(§4-6)로
    "A 차단 후 B가 A 콘텐츠 못 봄 / A도 B 콘텐츠 못 봄 / 비차단 C는 정상" 검증.
  </block_filter>

  <follow_auto_release>
    차단 시 follows 양방향 자동 해제(specs Decision 4). user_blocks AFTER INSERT 트리거 또는
    block RPC 내에서 DELETE FROM follows WHERE (follower=blocker AND followee=blocked) OR 반대.
  </follow_auto_release>
</rls_and_triggers>

<admin_api>
  앱 내 admin UI 없음. Supabase Studio에서 수동 운영하되, **미래 admin 페이지가 그대로 호출할 RPC만** 지금 작성한다.
  모두 SECURITY DEFINER + 함수 진입부에서 caller 검증: (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' 아니면 RAISE EXCEPTION.
  Studio(service_role)에서도 직접 SQL로 동일 작업 가능. 일반 유저 호출 차단.

  RPC 목록(이번 범위 — 복구/삭제/기각만, 제재는 future):
  - moderation_restore(p_target_type text, p_target_id uuid) — 해당 콘텐츠 moderation_status → 'visible'.
  - moderation_remove(p_target_type text, p_target_id uuid)  — moderation_status → 'removed' (운영자 확정 삭제).
  - report_dismiss(p_target_type text, p_target_id uuid)     — 해당 target 의 reports.status → 'dismissed' (+ 필요 시 콘텐츠 visible 복원).
  CASE 분기로 target_type → 콘텐츠 테이블 매핑(트리거와 동일 매핑 재사용).

  VIEW: admin_pending_queue — moderation_status IN ('pending','removed') 콘텐츠를 target_type 무관 통합 + 고유 신고자 수·최근 신고시각으로 정렬. security_invoker=true, admin/role 또는 service_role 만 SELECT.
  NOTE: removed(10건 자동삭제 포함)도 큐에 노출 — 운영자가 복구 여부 검토할 수 있어야 하므로.
</admin_api>

<ui_entry_points>
  - ContentActionMenu(공용): 콘텐츠 우상단 ... (Ellipsis). 본인 콘텐츠면 수정/삭제, 타인 콘텐츠면 "신고". 프로필 헤더에선 "신고" + "차단/차단 해제".
  - ReportSheet: 사유 6종(spam/harassment/sexual/misinfo/impersonation/other) 라디오 + other 선택 시 textarea(필수). 제출 시 use-report → reports INSERT. 중복(UNIQUE 위반) 시 "이미 신고함" 안내.
  - BlockConfirmSheet: 차단 시 영향(양방향 비가시 + 팔로우 해제) 고지 후 확인. 해제도 동일 시트 재사용.
  - settings/blocked: 차단한 유저 목록(닉네임 + 해제 버튼). use-blocks.
  - settings/index "문의·신고" 행: 지원 이메일 노출(기둥 D) = **support@winemine.site** (Linking.openURL('mailto:...')). 스토어 메타데이터와 동일.
  - removed 댓글 렌더: 댓글 행에서 status='removed' 면 본문 대신 i18n tombstone("신고로 인해 삭제된 댓글입니다") + 작성자명·시각은 유지(스레드 구조 보존). 답글은 그대로 노출.
</ui_entry_points>

<i18n_keys>
  moderation 네임스페이스(ko/en 양쪽):
  - reason.spam / harassment / sexual / misinfo / impersonation / other (specs Decision 2 표 그대로)
  - report.title / report.submit / report.detailPlaceholder / report.duplicateNotice / report.success
  - block.confirmTitle / block.confirmBody / block.action / block.undo / block.success
  - blocked.title / blocked.empty / blocked.unblock
  - contact.row / contact.email / contact.notice  (email 값 support@winemine.site)
  - comment.removedTombstone ("신고로 인해 삭제된 댓글입니다" / "This comment was removed due to reports")
</i18n_keys>

<resolved_decisions>
  - 지원 이메일 = support@winemine.site (확정).
  - admin = Supabase Studio 수동 + RPC API만(앱 UI 없음). 자동화는 2단계 트리거로만 한정.
  - 10건 자동삭제 = 댓글만, 원문 보존 + 표시 계층 tombstone.
  - admin 인증 = profiles.role(user/admin) + RPC role 검증.
  - admin API 범위 = restore/remove/dismiss + pending 큐 VIEW (유저 제재는 future).
</resolved_decisions>

<open_questions>
  - 댓글 본문 LocalizedString vs 단일 문자열 — 기존 mock shape 대조 후 design-spec-author가 고정(빌드 시).
  - tasting_notes 신고 시 target_type='note'가 community_posts(type='note')와 혼동되지 않도록 명명 구분 필요(post vs note) — 빌드 시 enum 라벨 재검토.
  - removed 댓글의 reports.status 자동 처리 — 자동삭제 시 신고건을 'reviewed'로 표시할지, 운영자 확정까지 'open' 유지할지(현재: open 유지 → 큐 검토 대상으로 남김).
</open_questions>

<build_handoff>
  착수 경로: winemine-build 하네스.
  순서(흐름은 CLAUDE.md §9):
  1. supabase-engineer: 6개 마이그레이션 작성(comments/moderation_status+role/reports+2단계트리거/user_blocks/block_filter/admin_api) + RLS SQL 단위 테스트(차단 양방향/임계값 3·10/가시성/role 변경 차단/admin RPC 비admin 거부) + 기존 wines count diff 0 검증.
  2. design-spec-author: ReportSheet / BlockConfirmSheet / ContentActionMenu / blocked 화면 design-spec(_workspace/design-specs/).
  3. rn-screen-builder: 공용 컴포넌트 + 5개 진입점 MODIFY + settings 2행 + blocked 화면 + 훅 + i18n.
  4. design-reviewer: 시각 게이트(라이트 모드, §4-9).
  5. qa-inspector: RLS↔클라이언트 교차 검증, ko/en, emoji/hex/SERVICE_ROLE grep, 차단 양방향 회귀.
  브랜치: dev 기준 워크트리(§4-13). 코드/화면은 예외 없이 워크트리 경유.
</build_handoff>
</project_specification>
