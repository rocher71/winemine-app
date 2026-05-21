# QA Followup — HomeCommunityPeek "팔로잉의 새 노트" 통합 정합성 게이트

- date: 2026-05-21 12:40:07 KST
- inspector: qa-inspector (integration-coherence-check)
- scope: uncommitted retroactive hardening — HomeCommunityPeek + PostTypeBadge + CommUserAvatar + 7 신규 i18n 키 + postTypeBadgeColor 3 신규 hex
- result: **PASS** (FAIL 0 / ADVISORY 1)
- scope-out (검증 제외): BottomNav, WineFeed, AppHeader, 데이터 소스 mock(실제 supabase 호출 아님)

---

## 1. 변경 파일 인벤토리 (양쪽 동시 읽기 대상)

| # | 파일 | 역할 | 변경 |
|---|---|---|---|
| 1 | src/lib/design-tokens.ts | 토큰 생산자 | +19 라인 (postTypeBadgeColor 5종 + PostTypeKey type) |
| 2 | src/components/community/post-type-badge.tsx | 토큰 소비자 / UI 생산자 | 재작성 (PostType union 변경, lucide icon 추가, withAlpha 적용) |
| 3 | src/components/community/comm-user-avatar.tsx | 토큰 소비자 / UI 생산자 | 재작성 (noteAuthorAvatarGradient 사용, brand.cream initial) |
| 4 | src/components/home/home-community-peek.tsx | 컴포넌트 소비자 | 재작성 (mock 2 posts type=note/album, PostRow + i18n 분기) |
| 5 | src/lib/i18n/ko.json | i18n 생산자 | +9 라인 (home.communityPeek 2 + community.postType 5 = 7 신규 키 + 1 trailing comma 정렬) |
| 6 | src/lib/i18n/en.json | i18n 생산자 | +9 라인 (동일 구조) |

---

## 2. 체크리스트 결과

### 2-1. ko/en 7 신규 키 양쪽 채움 + 영문 모드 한글 노출 X — PASS

git diff 결과:
- `home.communityPeek.comingSoon` (KO: "커뮤니티는 곧 출시됩니다" / EN: "Community coming soon") — NEW
- `home.communityPeek.openHint` (KO: "포스트 상세 화면으로 (곧 출시)" / EN: "Open post (coming soon)") — NEW
- `community.postType.note` (KO: "시음 노트" / EN: "Tasting Note") — NEW
- `community.postType.question` (KO: "질문" / EN: "Question") — NEW
- `community.postType.column` (KO: "칼럼" / EN: "Column") — NEW
- `community.postType.news` (KO: "소식" / EN: "News") — NEW
- `community.postType.album` (KO: "사진 앨범" / EN: "Album") — NEW

합계 정확히 7 신규 키. KO/EN 키 셋 100% 동일 (Python json.load → keys() 비교).

영문 모드 한글 스캔: regex `[가-힣]` 5개 신규 EN 값 + 2개 communityPeek EN 값 — **0건**. PASS.

home-community-peek.tsx의 `i18n.language === 'en' ? MOCK_POSTS_EN : MOCK_POSTS_KO` 분기로 author/title/initial까지 영문 mock 적용 (벨벳폭스 → velvetfox, 벨 → V). 영문 모드에서 한글 노출 0.

### 2-2. dark/light dual — postTypeBadgeColor 5종 양쪽 사용 일관 — PASS

postTypeBadgeColor는 theme-fixed (single object, no dark/light split). 설계 의도 코드 주석 명시:
```
// 양쪽 모드 동일 (badge 색은 type identity — 테마 무관).
```
note=brand.gold (theme-fixed 골드 strike) 채택 근거: 사용자 요청에 "note=gold theme-fixed OK" 명시. 키스크린 TYPE_MAP verbatim 포팅이라는 사양 추적성도 주석 내 명시 (design-spec home.md §3-6-PATCH).

bg/border alpha 처리(0.10 / 0.33)는 dark/light 양쪽에서 surface(bg-surface) 위에 동일한 색조 강도로 표현됨 — withAlpha 헬퍼가 hex→rgba 변환 일관 처리. PASS.

CommUserAvatar의 noteAuthorAvatarGradient도 theme-fixed (line 656 주석: "양쪽 모드 동일 (라이트에서도 어두운 음영 — keyscreen verbatim)"). cream initial 텍스트가 어두운 gradient 위 가독성 확보. PASS.

home-community-peek.tsx 자체는 `text-text-primary dark:text-text-primary`, `text-text-muted dark:text-text-muted`, `bg-surface dark:bg-surface`, `border-border-default dark:border-border-default` 모두 dual 토큰 className 사용. border bottom hairline은 `useThemeTokens().border.default`로 dynamic 분기. PASS.

### 2-3. emoji grep — PASS

검증 대상 6개 파일에서 emoji + U+FE0F variation selector 정규식(`[\U0001F000-\U0001FFFF\U00002600-\U000027BF️]`) 스캔 — **0건**.

note: i18n viewAll "→" (U+2192 rightwards arrow) 및 메타 separator "·" (U+00B7 middle dot)는 일반 텍스트 punctuation으로 CLAUDE.md §4-1 emoji 정의 범위 외(이미 기존 viewAll 값에서 사용 중). 회귀 아님.

### 2-4. 하드코딩 hex/rgba grep — 변경 파일 — PASS

3 컴포넌트 파일(post-type-badge.tsx, comm-user-avatar.tsx, home-community-peek.tsx) 모두 `#[0-9a-fA-F]{3,8}` 및 `rgba\(` 정규식 매칭 **0건**.

색은 100% design-tokens.ts 경유 (postTypeBadgeColor, noteAuthorAvatarGradient, brand.gold/cream, withAlpha, useThemeTokens). 컴포넌트 파일은 토큰 소비자 역할 충실.

design-tokens.ts에 새로 추가된 3 hex (#A08EE0 question, #5B9CE6 news, #E8B4D2 album)는 토큰 정의의 적법 위치 — CLAUDE.md §4-9 / docs/THEME_VERIFICATION.md 정책 준수 (centralized token definition은 hex literal 사용 허용 — design-tokens.ts·design-tokens 파일 자체가 예외). note=brand.gold, column=brand.cream 2종은 기존 토큰 재사용 (신규 hex 0). 사용자 요청의 "postTypeBadgeColor 3 신규" 표현과 일치.

### 2-5. PostType union 변경 영향 grep — PASS

이전 union: `'note' | 'question' | 'event' | 'cellar' | 'wine'` (git diff src/components/community/post-type-badge.tsx 확인)
신규 union: `'note' | 'question' | 'column' | 'news' | 'album'` (= PostTypeKey, design-tokens.ts)

전체 src/ + app/ grep:
- `PostType` 타입 import — post-type-badge.tsx + home-community-peek.tsx **단 2곳**
- `'cellar'` / `'event'` 리터럴 (PostType 맥락) — **0건** (cellar-summary-section 등 다른 도메인 'cellar'는 PostType과 무관)
- `PostTypeBadge` 컴포넌트 사용처 — home-community-peek.tsx **1곳**
- `label` prop이 v1에 있었음 (git diff: `<PostTypeBadge type={post.type} label={post.typeLabel} />` → `<PostTypeBadge type={post.type} />`) — label prop 제거되었고 호출자도 동시에 업데이트됨. 다른 호출자 0.

회귀 위험 0. 사용자 요청의 "home-community-peek 단독 import만 영향" 가설 검증 완료.

### 2-6. CommUserAvatar gradient 변경의 다른 사용처 regression — PASS

전체 src/ + app/ grep `CommUserAvatar` — home-community-peek.tsx **1곳만** import/사용. 다른 사용처 0건이므로 gradient 변경(이전: 미상/이번: noteAuthorAvatarGradient.L{1..5} + cream initial)으로 인한 regression 위험 없음.

app/_layout.tsx 라인 32는 주석 내 docstring 언급일 뿐(font preload context: `// (LevelChip avatar + CommUserAvatar initial — see home spec §3-1, §3-6),`). 실제 import 아님.

note: noteAuthorAvatarGradient 토큰은 notes-detail 화면과 공유 (comm-user-avatar.tsx docstring 명시). 토큰을 늘리지 않고 재사용 — 토큰 표면 안정성 PASS.

### 2-7. SUPABASE_SERVICE_ROLE_KEY 격리 — PASS

검증 6개 파일에서 grep — **0건**. 변경 파일은 모두 클라이언트 UI/i18n/토큰 레이어로, supabase 직접 호출 없음 (mock 데이터). 격리 보장.

### 2-8. Haptics import 정상 — PASS

home-community-peek.tsx line 21: `import * as Haptics from 'expo-haptics';`
node_modules/expo-haptics/ 설치됨 (package.json + android/ 디렉토리 존재 확인).
사용처 2건: PostRow onPress(line 119) + onViewAll(line 196). 둘 다 `.catch(() => undefined)`로 silent fail 처리 — 시뮬레이터/물리 디바이스 호환성 안전.

---

## 3. 경계면 교차 검증 (양쪽 동시 읽기)

| 경계면 | 좌: 생산자 | 우: 소비자 | 결과 |
|---|---|---|---|
| postTypeBadgeColor 토큰 | design-tokens.ts:679-685 (5 keys) | post-type-badge.tsx:37 `postTypeBadgeColor[type]` | KEYS 매칭 (note/question/column/news/album) PASS |
| PostTypeKey 타입 | design-tokens.ts:687 | post-type-badge.tsx:19,21 (PostType = PostTypeKey) | 단일 source of truth PASS |
| noteAuthorAvatarGradient | design-tokens.ts:660-666 L1~L5 | comm-user-avatar.tsx:24 (`L${levelId}` template) | levelId: 1|2|3|4|5 union이 키 5개와 정확 매칭 PASS |
| home.communityPeek.* i18n | ko/en.json:131-137 (eyebrow/title/viewAll/comingSoon/openHint) | home-community-peek.tsx t('home.communityPeek.{key}') 5호출 | 5/5 키 모두 양쪽 locale 존재 PASS |
| community.postType.* i18n | ko/en.json:780-787 (5 type 키) | post-type-badge.tsx:59 + home-community-peek.tsx:100 (a11y label 빌드용) | 5/5 키 모두 양쪽 locale 존재 PASS |
| app.name i18n | ko/en.json (winemine) | home-community-peek.tsx:120,197 Alert title | 기존 키 재사용 — 존재 확인 PASS |
| useThemeTokens shape | use-theme-tokens.ts:24-26 TokenBag (border.default, text.muted) | home-community-peek.tsx:115,168 사용 | shape 일치 PASS |
| withAlpha 시그니처 | design-tokens.ts:296 (hex,alpha) → string | post-type-badge.tsx:45,46 withAlpha(color, 0.1) / 0.33 | hex 인자(brand.gold/cream/etc) 호환 PASS |

---

## 4. 발견 사항

### FAIL — 0건

### ADVISORY — 1건 (FAIL 아님, 정보 제공)

**[A-1] column 타입의 light 모드 대비 (잠재 이슈, v0.1.0 런타임 무관)**
- 위치: src/lib/design-tokens.ts:682 `column: brand.cream` (#F5F0E8)
- 관찰: light 모드에서 surface bg(크림 계열 #F5F0E8 근방)와 column 배지의 cream + 10%-alpha 배경이 매우 흡사한 색역 — WCAG AA 4.5:1 미달 가능성.
- 영향 평가: v0.1.0 mock posts는 `type='note'` (gold)와 `type='album'` (pink)만 사용. column 타입은 **런타임에 렌더되지 않음** → 사용자 노출 0. 따라서 v0.1.0 게이트 통과에는 영향 없음.
- 권고: 실데이터 column posts 등장 시점(v0.2.0+)에 light 대비 재검토. design-reviewer 영역으로 이관 적절.
- 분류: ADVISORY (FAIL 아님). 게이트 통과 가능.

---

## 5. 결론

- 통과: 8/8 체크리스트
- 실패: 0/8
- 어드바이저리: 1 (column 타입 light 대비, v0.1.0 런타임 무관)
- 게이트 결정: **PASS** — 커밋 진행 가능

scope-out(BottomNav, WineFeed, AppHeader, 데이터 소스 mock)은 본 게이트 비대상으로 검증 생략.
