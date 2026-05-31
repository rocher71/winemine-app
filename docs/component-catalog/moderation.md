# Moderation — Component Catalog

> 신고·차단 모더레이션(M3) 공용 컴포넌트 목록 및 사용 설명서.
> 사양: `docs/spec/moderation.md` + `_workspace/design-specs/moderation-*.md` (5개).
> 마지막 업데이트: 2026-05-31

---

## 1. 공용 컴포넌트 (3종)

### `src/components/moderation/content-action-menu.tsx`

콘텐츠 우상단 `...` 메뉴. 모든 신고/차단/수정/삭제 진입의 단일 게이트.
RN 에 web dropdown popover 가 없어 `@gorhom/bottom-sheet` action sheet 로 구현(기존 sheet 스택 일관).

**export 2종**

| export | 역할 |
|---|---|
| `ActionMenuTrigger` | `...` 트리거 버튼. `variant: 'vertical' \| 'horizontal'`, `size?`(댓글 행은 14). 호출처가 인라인 배치. |
| `ContentActionMenu` | 항목 시트. `open` / `actions: MenuAction[]` / `onClose`. 빈 배열이면 미노출. |

**데이터 주도 설계**: 호출처가 `actions` 배열 주입. 메뉴는 onPress 트리거만 — owner/profile 분기를
메뉴 내부에 가두지 않음. 흐름: `... 탭 → 메뉴 open → 항목 탭 → onClose → 호출처 state 로 다음 시트 open`.

```ts
type ActionKind = 'report' | 'block' | 'unblock' | 'edit' | 'delete';
interface MenuAction { kind: ActionKind; onPress: () => void }
```

- 파괴적 항목(report/block/delete)은 `brand.wineRed` 색으로 구분(RN destructive role 미지원).
- snapPoints 동적(항목수 × 52 + 여유). light-only.

### `src/components/moderation/report-sheet.tsx`

신고 사유 선택 바텀시트. 모든 신고 진입점(post/comment/note/list/profile) 공유.

```ts
interface ReportSheetProps {
  open: boolean;
  targetType: 'post' | 'comment' | 'note' | 'list' | 'profile';
  targetId: string;        // uuid — UI Text 출력 금지 (§4-5)
  onClose: () => void;
  onSubmitted?: () => void; // 성공 후 부모 토스트 트리거
}
```

- 사유 6종 라디오(spam/harassment/sexual/misinfo/impersonation/other) + other 선택 시
  `BottomSheetTextInput`(필수, maxLength 1000) 노출.
- 제출 = `useReport().submit`. UNIQUE 위반 → `isDuplicate` 인라인 안내(오류 아님, 별도 토스트 없음).
- 제출 disabled 조건: 사유 미선택 / (other && detail 빈값) / 중복 / 로딩.
- 골격 레퍼런스: `visibility-sheet.tsx`. light-only.

### `src/components/moderation/block-confirm-sheet.tsx`

차단/해제 확인 바텀시트. 단일 컴포넌트 `mode='block' | 'unblock'`.

```ts
interface BlockConfirmSheetProps {
  open: boolean;
  mode: 'block' | 'unblock';
  anonymousDisplay: string;  // 익명 표시명만 (§4-5)
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: () => void;     // use-blocks.toggle 연결은 부모
}
```

- block: Ban 아이콘(wineRed) + ImpactCard 2 bullet(양방향 비가시 + 팔로우 해제) + 확인 primary.
- unblock: UserCheck 아이콘(gold) + ImpactCard 생략 + 확인 secondary.
- undoBody 에 "팔로우 자동 복구 안 됨" 명시(follow_auto_release 트리거 정합).
- 골격 레퍼런스: `visibility-sheet.tsx`. light-only.

---

## 2. 훅 (2종)

### `src/hooks/use-report.ts`

`reports` INSERT. `submit({ targetType, targetId, reason, detail }) → 'ok' | 'duplicate' | 'error'`.
- reporter_id 는 `getCurrentUserId()` 로 채워 RLS WITH CHECK 통과.
- Postgres 23505(unique_violation) → 'duplicate' 매핑(동일 유저 동일 타깃 재신고는 정상 흐름).

### `src/hooks/use-blocks.ts`

`user_blocks` 목록/토글. `{ blockedList, isBlocked, toggle, loading, error, refresh }`.
- 목록 = `user_blocks` SELECT(RLS blocker_id=auth.uid()) + `profiles_public` 조인(표시명/핸들, §4-5).
- `toggle(userId)` → INSERT/DELETE. follows 양방향 해제는 DB 트리거(클라이언트 추가 호출 없음).

---

## 3. 진입점 (5개 콘텐츠 MODIFY)

| 화면 | 트리거 | 타인 actions | 본인 actions |
|---|---|---|---|
| `app/community/[postId]/index.tsx` | 헤더 우상단 vertical | report | (없음 — 편집/삭제 경로 부재 v0.1.0) |
| `app/community/[postId]/comments.tsx` | 댓글 행 footer(14px) | report | delete |
| `app/notes/[noteId].tsx` | 헤더 우상단 | report | (기존 Edit/Delete 유지) |
| `app/cellar/lists/[id]/index.tsx` | 헤더 우상단 horizontal | report | (기존 액션 유지, 신고 미노출) |
| `app/profile/[userId]/index.tsx` | 헤더 MoreHorizontal(기존 교체) | report + block/unblock | (본인은 /profile redirect) |

- 각 화면이 `menuOpen` / `reportOpen` / (프로필) `blockOpen` state 보유. 시트는 화면 루트에 마운트.
- owner 판정: 콘텐츠 `author_id`/`user_id` === `currentUserId`. DEMO_MODE 면 owner=false(신고 노출).

## 4. 설정 (MODIFY)

- `app/settings/index.tsx`: "안전 및 지원" 섹션 — "차단 목록" 행(→ `/settings/blocked`) +
  "문의·신고" 행(`Linking.openURL('mailto:support@winemine.site')`, canOpenURL 체크).
- `app/settings/blocked.tsx`(NEW): 차단 목록 + 해제(BlockConfirmSheet unblock 재사용).
  states: default / loading(skeleton ×4) / empty(EmptyState ShieldOff) / error(retry).

## 5. removed 댓글 tombstone (MODIFY)

`src/components/community/comment-row.tsx`: `status?: 'visible' | 'pending' | 'removed'` + `onMore?` prop 추가.
- `removed` → 본문 자리에 tombstone(`moderation.comment.removedTombstone`, italic muted + Flag 아이콘).
  원문 보존(DB body 유지) — UI 표시 계층만 교체. 작성자명·시각·답글 유지, 반응·메뉴 비노출.

## 6. 데이터 모듈 (mock → 실 테이블)

`src/lib/community/comments.ts`(NEW): 기존 mock `lib/mock/community-comments.ts` 의 조회를
실 `comments` 테이블로 교체.
- `fetchCommentsByPost(postId)` → comments SELECT + `profiles_public` 조인(표시명/레벨) +
  `registerCommunityUser`(CommentRow 의 getCommunityUser lookup 호환). RLS 가 차단/가시성 자동 필터.
- `insertComment` / `deleteComment`. DEMO_MODE 면 comments 화면이 mock fallback.
- 본문은 단일 text(사용자 입력 단일 언어) — CommComment.body LocalizedString shape 에 동일 문자열 양쪽 담아 호환.
