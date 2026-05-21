# 디자인 리뷰 — /home HomeCommunityPeek "팔로잉의 새 노트" row (1차)

- 일시: 2026-05-21 12:25:38
- 대상 화면: `/(tabs)/index` 안의 `HomeCommunityPeek` 섹션 ("팔로잉의 새 노트" 카드 안 2개 PostRow)
- 사양 진실 소스: `_workspace/design-specs/home.md` §3-6-PATCH (line 1112~1433)
- 키스크린 참조:
  - `../winemine-keyscreen/src/components/home/home-community-peek.tsx` (line 41~144 = PostRow horizontal verbatim)
  - `../winemine-keyscreen/src/components/community/post-type-badge.tsx` (line 6~47 = TYPE_MAP + pill)
  - `../winemine-keyscreen/src/components/community/comm-user-avatar.tsx` (line 13~62 = levelGradient + cream text)
- 시각 reference: 사용자 image #4 (PATCH가 진실 소스로 지정)
- 검증 대상 RN:
  - `src/components/home/home-community-peek.tsx`
  - `src/components/community/comm-user-avatar.tsx`
  - `src/components/community/post-type-badge.tsx`
- 토큰 환경: `src/lib/design-tokens.ts` line 560~566 (`gradients.levelChip`), line 660~666 (`noteAuthorAvatarGradient.L{1..5}`)
- 스크린샷 비교: `_workspace/keyscreen-shots/home.png` 존재. 현재 시뮬레이터 캡처 없음 → JSX·CSS·토큰 기반 검증 (사용자 image #3 = 현재 RN 회귀 상태, image #4 = 키스크린 reference 양쪽 참조)

SCOPE-OUT (검증 외): BottomNav, WineFeed, AppHeader, 데이터 소스 mock vs real.

---

## 사전 정합성 — PATCH 갱신 진단

PATCH §3-6-PATCH가 키스크린 line-by-line 재현을 명시함. 현재 RN은 PATCH **이전** 상태. PATCH 진단(line 1116~1123) 자체가 5축의 회귀(pill vs 사각, icon 부재, union 임의 확장, locale hardcode, gradient 토큰 mismatch + dark-on-dark text)를 정확히 지목 — 본 1차 검증은 PATCH 갱신 항목이 코드에 반영됐는지 확인하는 회귀 게이트.

---

## 6항목 체크리스트

### (a) 요소 누락
**결과: FAIL**

| 누락/추가 요소 | 키스크린 위치 | 현재 RN 위치 | 증거 |
|---|---|---|---|
| PostTypeBadge 좌측 lucide icon (PenLine/HelpCircle/BookOpen/Sparkles/Image 5종) | `keyscreen post-type-badge.tsx:43` `<Icon size={10} strokeWidth={2}/>` | `src/components/community/post-type-badge.tsx:38~45` — `<View>` 안에 `<Text>`만 있고 icon import 없음 (`import { brand, withAlpha }`만) | 누락. PATCH §3-6-PATCH line 1141 "신규 — icon 추가" 미반영 |
| PostType union `'column' \| 'news' \| 'album'` 3종 | `keyscreen post-type-badge.tsx:10~14` (note/question/column/news/album) | `src/components/community/post-type-badge.tsx:11` — `'note' \| 'question' \| 'event' \| 'cellar' \| 'wine'` (column/news/album 누락, event/cellar/wine 임의 추가) | 누락 3종 + 임의 추가 3종. PATCH line 1148 verbatim 위반 |
| PostTypeBadge `locale` prop (내부 labelKo/labelEn 분기) | `keyscreen post-type-badge.tsx:17~25` `type Props = { type, locale }` | `src/components/community/post-type-badge.tsx:21~24` — `{ type, label }` (외부에서 hardcode 받음) | 누락. PATCH line 1147 위반 — `label` prop 자체가 PATCH에서 제거 대상 |
| PostRow accessibilityLabel에 badge 종류 포함 | (keyscreen 미구현 영역) | `src/components/home/home-community-peek.tsx:105` — `${post.author} ${post.title}`만 (badge 종류 없음) | 누락. PATCH line 1159 "badge label 포함" 위반 |
| PostRow onPress 시 `toastInfo("곧 출시")` + `Haptics.selectionAsync()` | (v0.1.0 RN 추가 deviation) | `src/components/home/home-community-peek.tsx:118~120` — 빈 콜백 (`// noop`) | 누락. PATCH line 1157, 1235 "dead-press 방지 위해 toast info" 위반 |
| 모두 보기 버튼 onPress 시 toast + Haptics | (v0.1.0 RN 추가 deviation) | `src/components/home/home-community-peek.tsx:227~229` — 빈 콜백 | 누락. PATCH line 1289 위반 |
| i18n 키 `home.communityPeek.comingSoon` / `openHint` | (PATCH 신규) | `src/lib/i18n/ko.json:131~135` — eyebrow/title/viewAll 3개만 | 누락. PATCH line 1316~1324 위반 |
| i18n 키 `community.postType.{note,question,column,news,album}` | (PATCH 신규) | `src/lib/i18n/ko.json` — `community` 객체 line 27/654 존재하나 `postType` 하위 없음 | 누락. PATCH line 1328~1349 위반 |
| 신규 토큰 `postTypeBadgeColor.{question,news,album}` | (PATCH 신규) | `src/lib/design-tokens.ts` grep 결과 `postTypeBadgeColor` 자체가 없음 | 누락. PATCH line 1171~1177 위반 |

### (b) Spacing 비율
**결과: FAIL**

| 항목 | 키스크린 값 | 현재 RN 값 | 증거 |
|---|---|---|---|
| PostTypeBadge padding | vertical 3, horizontal 9 (`padding: '3px 9px'`) | vertical 2, horizontal 6 (`paddingVertical: 2, paddingHorizontal: 6`) | `keyscreen post-type-badge.tsx:33` vs `src/components/community/post-type-badge.tsx:34~35`. PATCH line 1139 "padding 2_6 → 3_9" 위반. **결과적으로 badge 시각 부피 약 67% → "벨"/"실" avatar(28px) 옆에서 사각 chip이 더 작고 납작하게 보여, image #3의 "사각 chip이 row 위에 얹힌" 인상 발생** |
| PostTypeBadge gap (icon ↔ label) | 5 (`gap: 5`) | 없음 (icon 자체가 없음) | `keyscreen post-type-badge.tsx:32` vs `src/components/community/post-type-badge.tsx:29~37` — gap 자체 정의 없음. PATCH line 1140 "신규 5" 위반 |
| 기타 spacing (PostRow gap 10, py 10, meta gap 6, mb 3, reactions gap 12 mt 6, card m 0_16 p 4_14 radius 14) | keyscreen 동일 | RN 동일 (PATCH 변경 대상 아님 — 이미 정확) | `src/components/home/home-community-peek.tsx:109~110, 124~131, 148~154, 242~247` — 모두 keyscreen 값. PASS 항목 |
| CommUserAvatar size 28 | 28 | 28 | `keyscreen home-community-peek.tsx:67` vs `src/components/home/home-community-peek.tsx:122` — 일치. PASS 항목 |
| CommUserAvatar text fontSize 비율 | `Math.round(size * 0.42)` | `Math.round(size * 0.43)` | `keyscreen comm-user-avatar.tsx:59` vs `src/components/community/comm-user-avatar.tsx:37`. 28*0.42=11.76→12, 28*0.43=12.04→12 — 실제 px 동일이지만 비율 verbatim 위반. PATCH line 1136 — 미세 (실 픽셀 영향 0) |

### (c) Gradient 방향·깊이
**결과: FAIL**

| Gradient | 키스크린 색·각도 | 현재 RN 토큰 | 증거 |
|---|---|---|---|
| CommUserAvatar L1 | `linear-gradient(135deg, #555560, #2a2a35)` (gray darken) | `gradients.levelChip.L1` = `['#9B8B7A', '#9B8B7A99']` (단색 + alpha 60%) | `keyscreen comm-user-avatar.tsx:15` vs `design-tokens.ts:561`. PATCH line 1134/1229 위반 — 색 자체가 다름 (warm gray vs cool darken) |
| CommUserAvatar L2 | `linear-gradient(135deg, #4a6fa5, #1a2a45)` (steel blue darken) | `gradients.levelChip.L2` = `['#C9A84C', '#C9A84C99']` (gold + alpha) | `keyscreen comm-user-avatar.tsx:16` vs `design-tokens.ts:562`. **색조 정체성 자체가 mismatch — 블루를 골드로 표시** |
| CommUserAvatar L3 | `linear-gradient(135deg, #b8b8c0, #3a3a48)` (silver darken) | `gradients.levelChip.L3` = `['#C9A84C', '#C9A84C99']` (gold + alpha — L2와 동일) | `keyscreen comm-user-avatar.tsx:17` vs `design-tokens.ts:563`. **L3 mock 데이터 "실키나이트"의 silver 정체성 깨짐** |
| CommUserAvatar L4 | `linear-gradient(135deg, #C9A84C, #0F0718)` (gold → deep navy) | `gradients.levelChip.L4` = `['#8B1A2A', '#8B1A2A99']` (wineRed + alpha) | `keyscreen comm-user-avatar.tsx:18` vs `design-tokens.ts:564`. **L4 mock "벨벳폭스" gold 정체성이 wineRed로 표시** — 직접적 회귀 |
| CommUserAvatar L5 | `linear-gradient(135deg, #8B1A2A, #3a0810)` (wineRed → deep) | `gradients.levelChip.L5` = `['#A02030', '#A0203099']` (lighter wineRed + alpha) | `keyscreen comm-user-avatar.tsx:19` vs `design-tokens.ts:565`. 색조 mismatch (`darker`이 아닌 alpha 변형) |

`noteAuthorAvatarGradient.L1~L5`는 `design-tokens.ts:660~666`에 이미 키스크린 verbatim으로 정의되어 있음 — **PATCH line 1187, 1229의 "import 교체"만 하면 됨**. 현재 RN은 `gradients.levelChip` (AppHeader 용도) import 중 — PATCH 위반.

### (d) Corner radius
**결과: FAIL**

| 요소 | 키스크린 | 현재 RN | 증거 |
|---|---|---|---|
| PostTypeBadge radius | **999 (pill)** | **4 (rounded rect)** | `keyscreen post-type-badge.tsx:34` `borderRadius: 999` vs `src/components/community/post-type-badge.tsx:36` `borderRadius: 4`. **PATCH §3-6-PATCH line 1116~1117가 명시한 "핵심 회귀 원인 (image #3 사각 chip 인상의 원인)" 그 자체**. PATCH line 1139, 1231 정면 위반 |
| CommUserAvatar radius | 999 | 9999 | `keyscreen comm-user-avatar.tsx:50` vs `src/components/community/comm-user-avatar.tsx:29`. 둘 다 완전 원형 — PASS |
| 카드 outer radius 14 | 14 | 14 | `keyscreen home-community-peek.tsx:36` vs `src/components/home/home-community-peek.tsx:244`. PASS |

### (e) Typography 위계
**결과: FAIL**

| 요소 | 키스크린 | 현재 RN | 증거 |
|---|---|---|---|
| CommUserAvatar initial text color | `color: 'var(--color-cream)'` (#F8F4ED) | `color: brand.deepestDark` (#05020A) | `keyscreen comm-user-avatar.tsx:57` vs `src/components/community/comm-user-avatar.tsx:39`. **PATCH §3-6-PATCH line 1121이 명시한 회귀 — "darken gradient 위에 darken 색"으로 "글자가 거의 안 보이고 아바타가 단색 chip처럼 보임"**. PATCH line 1135, 1230, 1371 위반. dark mode 가독성 (cream on noteAuthorAvatarGradient.L4 평균 #6B5530 → contrast ~7.2:1 AAA로 PATCH §접근성 분석)에서 cream → deepestDark로 바꿀 시 contrast 1.x:1로 추정 (실측 미수행, 시각 검증 추후 멀티모달 캡처 필요) |
| CommUserAvatar fontFamily Playfair | Playfair | `PlayfairDisplay_400Regular` | `keyscreen:58` vs `RN:36`. 동등 — PASS |
| CommUserAvatar fontWeight 700 | 700 | `'700'` | 일치 — PASS |
| PostTypeBadge text fontSize/weight/spacing | 10/600/0.04em (=0.4px) | 10/600/0.4px | `keyscreen:38~40` vs `RN:41`. 일치 — PASS (단 color는 (a)/(c)와 별도, 토큰 mismatch는 별도 항목) |
| PostRow title Playfair 13 lh 1.3 (=16.9) 2줄 clamp | Playfair 13 lh 1.3 cream | `font-playfair text-text-primary` size 13 lineHeight 16.9 numberOfLines 2 | `keyscreen:84~94` vs `RN:141~146`. 일치 — PASS |
| author/ago text 10 muted | 10 muted | 10 text-muted | `keyscreen:78` vs `RN:133~139`. PASS |
| reactions text 10 muted | 10 muted | 10 text-muted | `keyscreen:104` vs `RN:158~173`. PASS |
| appellation chip 9 gold tracking 0.06em (=0.54px) | 9/gold/0.06em | 9/gold/0.54 | `keyscreen:131~133` vs `RN:178`. PASS |
| eyebrow Inter 10 500 gold UPPER tracking 0.18em (=1.8px) | 동일 | 동일 | `keyscreen:171~183` vs `RN:208~218`. PASS |
| title Playfair 17 cream lh 1.2 (=20.4) | 동일 | 17 lh 20.4 text-primary | `keyscreen:185~193` vs `RN:219~224`. PASS |
| viewAll Inter 11 600 gold | 동일 | 동일 | `keyscreen:198~209` vs `RN:232~237`. PASS |

위계 회귀 핵심 1건 (avatar text color) — 사용자 image #3의 "벨"/"실"이 사실상 invisible해진 직접 원인.

### (f) Color 사용
**결과: FAIL**

| 색 | 키스크린 | 현재 RN | 증거 |
|---|---|---|---|
| PostTypeBadge note color | `#C9A84C` (gold) | `brand.gold` (= #C9A84C) | `keyscreen:10` vs `src/components/community/post-type-badge.tsx:14`. 일치 — PASS |
| PostTypeBadge question color | `#a08ee0` (purple) | `brand.wineRedHover` (wine 계열) | `keyscreen:11` vs `src/components/community/post-type-badge.tsx:15`. **불일치 — 토큰 매핑이 brand 내부 alone로 처리되어 keyscreen 5색(gold/purple/cream/blue/pink) 다양성 깨짐**. PATCH line 1149 위반 — `postTypeBadgeColor.question = '#A08EE0'` 신규 토큰 필요 |
| PostTypeBadge column/news/album | cream/sky blue/pink | (그런 type 자체가 union에 없음 — event/cellar/wine으로 대체) | type 자체 누락 → 색도 누락. PATCH §3-6-PATCH line 1148~1149 위반 |
| 하드코딩 hex grep | — | 검토 — `src/components/home/home-community-peek.tsx` 본문 hex 없음 (`brand.gold` 토큰 사용), `comm-user-avatar.tsx` hex 없음 (토큰 사용), `post-type-badge.tsx` hex 없음 (`brand.*` 토큰) | 토큰 사용 측면은 PASS. 단 (c) gradient 토큰 자체가 잘못 매핑된 별도 문제 |
| CommUserAvatar text color brand.deepestDark | (위 (e) 참조) | 잘못된 색 | (e)에 종합 |
| Card bg/border 토큰 (bg-surface, border-default) | `var(--color-surface)`, `var(--color-border-default)` | `bg-surface dark:bg-surface border border-border-default dark:border-border-default` | `keyscreen:37~38` vs `src/components/home/home-community-peek.tsx:241`. 일치 — PASS (양쪽 모드 토큰 분기) |
| PostRow borderBottom hairline | `'0.5px solid var(--color-border-default)'` | `StyleSheet.hairlineWidth` + `tokens.border.default` | `keyscreen:62~64` vs `RN:113~116`. 동등 — PASS |
| PostTypeBadge bg/border alpha helper | `${color}1a` / `${color}55` (10% / 33%) | `withAlpha(color, 0.1)` / `withAlpha(color, 0.33)` | `keyscreen:35~36` vs `RN:31~32`. 일치 — PASS |
| eyebrow gold, title cream, viewAll gold, Wine icon gold, appellation gold | 동일 | 동일 (`brand.gold` + `text-text-primary` 토큰) | PASS |

---

## 다크/라이트 양쪽 모드

| 항목 | 다크 | 라이트 |
|---|---|---|
| 카드 bg/border | `bg-surface dark:bg-surface` — Tailwind 토큰 dual 정의 | 동일 (양쪽 자동 분기) — 코드상 OK |
| title text-text-primary | dark.cream | light.primary — 자동 분기 OK |
| author/ago/reactions text-text-muted | 양쪽 자동 분기 OK | 양쪽 자동 분기 OK |
| Wine icon `brand.gold` | gold (양쪽 동일 토큰) | gold — light에서 darker 배경 대비 OK 추정 (실측 미수행) |
| MessageSquare icon `tokens.text.muted` | dark.muted | light.muted — `useThemeTokens` 분기 OK |
| CommUserAvatar gradient | (PATCH 위반: 잘못된 levelChip 토큰 + dark text → 양쪽 모두 가독성 회귀) | 동일 회귀. PATCH 의도(gradient는 양쪽 모드 동일, cream text 유지)와 동작 일치 ❌ |
| PostTypeBadge bg/border alpha+color | dark mode `brand.gold` 위 10% bg = 거의 투명, gold text 충분 contrast | light mode 동일 색 — alpha bg 10%가 light bg 위에서 거의 보이지 않을 가능성 (column type cream text on light bg 대비 문제는 PATCH line 1303, 1417에서 P3 인지 — v0.1.0 mock에는 column 없음 → 즉시 회피) |
| pressed feedback opacity 0.85 | OK (RN style 함수) | OK | 양쪽 동일 |

**실제 시뮬레이터 캡처 미수행** — JSX·토큰 정적 분석만. 멀티모달 캡처가 가능해지면 image #4(reference) vs 라이트/다크 양쪽 캡처 3-way 비교 권장.

---

## 스크린샷 비교 (멀티모달)

| 자료 | 상태 |
|---|---|
| `_workspace/keyscreen-shots/home.png` | 존재 — image #4와 동일 reference로 추정 |
| 현재 RN 시뮬레이터 캡처 | 미보유 (사용자 image #3을 회귀 증거로 PATCH가 인용 — image #3 = 사각 chip + dark-on-dark avatar) |
| 시각 차이 | image #3 vs image #4 차이가 PATCH §3-6-PATCH line 1116~1123 진단과 100% 일치 — pill→사각, icon 누락, avatar 글자 invisible. 본 1차 검증 시점에 코드는 image #3 상태 |

스크린샷 캡처 보강 권장 (P2 세션이 채울 영역) — JSX·토큰 단독으로도 6/6 FAIL 명백.

---

## 결정

| 항목 | 값 |
|---|---|
| 결과 | **FAIL** |
| FAIL 항목 수 | **6 / 6** ((a) 요소 누락 / (b) spacing 비율 / (c) gradient 색·방향 / (d) corner radius / (e) typography 위계(avatar text color) / (f) color 사용(PostType union + badge 색 다양성)) |
| 핵심 회귀 (시각 우선순위) | 1. PostTypeBadge radius 4 → 999 (pill) — image #3 사각 chip 인상 직접 원인 / 2. CommUserAvatar gradient 토큰 `levelChip` → `noteAuthorAvatarGradient` 교체 — L4 gold 정체성 회복 / 3. CommUserAvatar text color `deepestDark` → `brand.cream` — "벨"/"실" 가독성 회복 / 4. PostTypeBadge icon 5종 신규 / 5. PostType union 키스크린 verbatim 5종 복원 + mock type='cellar' → 'album' (PATCH 권장) / 6. PostTypeBadge locale prop 분기 + mock typeLabel 제거 |
| 라우팅 | **rn-screen-builder**: 위 6항목 PATCH §3-6-PATCH line 1126~1235 매핑표대로 구현. 영향 파일 6개 (PATCH line 1391~1397에 열거). 신규 토큰 3색 (PATCH line 1171~1177), 신규 i18n 키 7개 (PATCH line 1314~1349) |
| 라우팅 (사양) | 사양은 PATCH로 이미 충분. **design-spec-author 추가 작업 없음** |
| 라우팅 (토큰) | `postTypeBadgeColor` 3종은 rn-screen-builder가 PATCH 명세대로 추가 (`infra-architect` 별도 호출 불필요 — 사양에 색 hex 명시됨) |
| escalation | mock row 2 `type` `'cellar'` → `'note'` vs `'album'` 중 선택 — **리더 결정 필요** (PATCH line 1416 권장: `'album'`, 사진 앨범으로 mock 메시지 "셀러에 보르도 빈티지 새로 추가했어요." 의미 보존) |
| 재검증 시점 | rn-screen-builder 수정 완료 후 동일 6항목 체크리스트 + 시뮬레이터 dark/light 양쪽 캡처 → image #4 3-way 비교 |
| 통과 후 다음 단계 | qa-inspector (RLS·hex grep·i18n·shape — 본 row는 mock 데이터라 RLS 영향 없으나 i18n 키 7개 신규는 ko/en 동시 채움 필수, hex 3종 design-tokens.ts 한정 grep 통과 필요) |

---

## 작업자 노트

- 본 검증은 PATCH 갱신(2026-05-21) 직후 1차 회귀 게이트. PATCH 자체가 회귀 원인을 line-by-line 진단하고 수정 매핑까지 완성 — rn-screen-builder는 매핑표 그대로 실행만 하면 통과 가능 (PATCH line 1409~1415 LOC 추정 ~80 LOC).
- 6항목 모두 FAIL이지만 **수정 부피는 작음** (3 컴포넌트 + 토큰 + i18n). 핵심 회귀 1~3번 (pill / gradient 토큰 / cream text)이 시각 임팩트의 80%+ 차지 — 우선 수정 권장.
- `gradients.levelChip` 토큰은 AppHeader LevelChip 용도로 유지 (삭제 X — PATCH line 1401). CommUserAvatar만 import 교체.
- light 모드 column type cream-on-cream 대비 문제는 v0.1.0 mock에 column 없음 → 즉시 회피 가능 (PATCH line 1417 P3). 본 1차 검증에서는 미지적.
- 사용자 UUID 노출 검증 (§4-5): mock author 이름이 "벨벳폭스"/"velvetfox" 등 익명화 패턴 형태 — PASS (UUID 직접 노출 없음).
- 멀티모달 캡처가 비어 있으나 PATCH 진단 + JSX 정적 분석 + 토큰 mismatch가 6/6 FAIL을 명백히 입증 — 1차 게이트 결과 보류 사유 없음.
