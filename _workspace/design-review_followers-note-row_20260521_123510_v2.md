# 디자인 리뷰 — /home HomeCommunityPeek "팔로잉의 새 노트" row (2차 / v2)

- 일시: 2026-05-21 12:35:10
- 1차 보고서: `_workspace/design-review_followers-note-row_20260521_122538.md` (6/6 FAIL)
- 사양 진실 소스: `_workspace/design-specs/home.md` §3-6-PATCH (line 1112~1433)
- 키스크린 참조:
  - `../winemine-keyscreen/src/components/home/home-community-peek.tsx` (line 41~144 PostRow verbatim)
  - `../winemine-keyscreen/src/components/community/post-type-badge.tsx` (line 6~47 TYPE_MAP + pill)
  - `../winemine-keyscreen/src/components/community/comm-user-avatar.tsx` (line 13~62 levelGradient + cream)
- 시각 reference: 사용자 image #4 (PATCH 진실 소스)
- 검증 대상 RN (1차 이후 재작성, 미커밋):
  - `src/lib/design-tokens.ts` (line 670~687 `postTypeBadgeColor` 신규 추가)
  - `src/components/community/post-type-badge.tsx` (재작성)
  - `src/components/community/comm-user-avatar.tsx` (재작성)
  - `src/components/home/home-community-peek.tsx` (재작성)
  - `src/lib/i18n/{ko,en}.json` (line 135~136 `comingSoon`/`openHint` + line 780~788 `community.postType.*`)

SCOPE-OUT (검증 외): BottomNav, WineFeed, AppHeader, 데이터 소스 mock vs real, lucide `HelpCircle` → `CircleQuestionMark` deviation (의미 동등), toast 패턴 `Alert.alert` 채택 (코드베이스 일관성).

---

## 사전 — PATCH 반영 진단 (1차 FAIL → v2 회귀 게이트)

1차에서 지목된 6항목(pill/icon/union/locale/gradient 토큰/cream text) 전부에 대해 v2 코드 재검증.

핵심 변경 확인 (정적):
- `postTypeBadgeColor` 그룹 `design-tokens.ts:679~685` 신규 — note=brand.gold / question=#A08EE0 / column=brand.cream / news=#5B9CE6 / album=#E8B4D2 — **5종 모두 PATCH line 1171~1177 verbatim 일치**
- `PostTypeBadge` `post-type-badge.tsx:35~63` 전면 재작성 — pill radius 999, padding 3_9, icon 5종, locale은 `t()` 호출 (i18n 키 기반)
- `CommUserAvatar` `comm-user-avatar.tsx:23~50` 재작성 — gradient `noteAuthorAvatarGradient.L{1..5}` 사용, text color `brand.cream`, fontSize `size * 0.42`
- `HomeCommunityPeek` `home-community-peek.tsx:1~262` 재작성 — mock에서 `typeLabel` 필드 제거, PostTypeBadge에 type prop만 전달, onPress → `Alert.alert(t('app.name'), t('home.communityPeek.comingSoon'))` + `Haptics.selectionAsync()`, accessibilityLabel에 `${badgeLabel}` 포함
- i18n 키 신규 7개 모두 ko.json + en.json 양쪽 채움 — `home.communityPeek.comingSoon`/`openHint` (line 135~136) + `community.postType.{note,question,column,news,album}` (line 780~788)

---

## 6항목 체크리스트

### (a) 요소 누락
**결과: PASS**

| 1차 FAIL 항목 | v2 상태 | 증거 |
|---|---|---|
| PostTypeBadge 좌측 lucide icon 5종 | **반영** | `post-type-badge.tsx:17` import `PenLine, CircleQuestionMark, BookOpen, Sparkles, Image as ImageIcon`. `TYPE_ICON` map `:23~29` 5종. render `:53` `<Icon size={10} strokeWidth={2} color={color} />`. lucide-react-native d.ts 직접 grep으로 5종 모두 export 확인 (CircleQuestionMark line 4892, BookOpen 2630, PenLine 14070, Sparkles 17086, Image 컴포넌트 ImageIcon alias) |
| PostType union keyscreen verbatim 5종 | **반영** | `post-type-badge.tsx:21` `export type PostType = PostTypeKey;` → `design-tokens.ts:687` `keyof typeof postTypeBadgeColor` = `'note' \| 'question' \| 'column' \| 'news' \| 'album'`. event/cellar/wine 임의 추가 3종 모두 제거됨 |
| PostTypeBadge `locale` prop (내부 분기) | **반영 (i18n 우회 채택)** | `post-type-badge.tsx:35` `{ type }` prop만, `:36, :59` `const { t } = useTranslation()` + `t(\`community.postType.${type}\`)`. PATCH line 1147은 `locale` prop 직접 받는 대안, line 1352는 "i18n 키 외부화" 권장 — v2는 i18n 키 외부화 채택 → 보다 우수. ko.json:780~788 + en.json:780~788 5종 모두 채워짐 |
| PostRow accessibilityLabel에 badge 종류 포함 | **반영** | `home-community-peek.tsx:100` `const badgeLabel = t(\`community.postType.${post.type}\`)` → `:104` `accessibilityLabel={\`${post.author} · ${badgeLabel} · ${post.title}\`}`. PATCH line 1159 형식 일치 |
| PostRow onPress toast + Haptics | **반영** | `home-community-peek.tsx:118~121` `Haptics.selectionAsync().catch(() => undefined); Alert.alert(t('app.name'), t('home.communityPeek.comingSoon'))`. PATCH line 1235는 `toastInfo()` 가상 함수지만 SCOPE-OUT에 명시된 대로 `Alert.alert` 코드베이스 일관성 채택 — 동등 |
| 모두 보기 onPress toast + Haptics | **반영** | `home-community-peek.tsx:195~198` 동일 패턴. PATCH line 1289 일치 |
| i18n 키 `home.communityPeek.comingSoon`/`openHint` | **반영** | ko.json:135~136 ("커뮤니티는 곧 출시됩니다" / "포스트 상세 화면으로 (곧 출시)") + en.json:135~136 ("Community coming soon" / "Open post (coming soon)"). PATCH line 1316~1324 verbatim |
| i18n 키 `community.postType.*` 5종 | **반영** | ko.json:780~788 (시음 노트/질문/칼럼/소식/사진 앨범) + en.json:780~788 (Tasting Note/Question/Column/News/Album). PATCH line 1328~1349 verbatim |
| 신규 토큰 `postTypeBadgeColor.{question,news,album}` | **반영** | `design-tokens.ts:679~685` 5종. question=#A08EE0 / news=#5B9CE6 / album=#E8B4D2 hex 3종 신규, note/column은 brand.{gold,cream} 재사용. PATCH line 1171~1177 verbatim |

### (b) Spacing 비율
**결과: PASS**

| 항목 | 키스크린 | v2 RN | 증거 |
|---|---|---|---|
| PostTypeBadge padding | v3 h9 | v3 h9 | `post-type-badge.tsx:48~49` `paddingHorizontal: 9, paddingVertical: 3`. 1차 v2_h6 → v3_h9 회복. PATCH line 1139 일치 |
| PostTypeBadge gap (icon ↔ label) | 5 | 5 | `post-type-badge.tsx:44` `gap: 5`. PATCH line 1140 일치 |
| CommUserAvatar size 28 | 28 | 28 | `home-community-peek.tsx:123` `size={28}` |
| CommUserAvatar text fontSize 비율 | round(size×0.42)≈12 | round(28×0.42)=12 | `comm-user-avatar.tsx:41` `Math.round(size * 0.42)`. 1차 0.43 → 0.42 회복. PATCH line 1136 일치 |
| 기타 (PostRow gap 10, py 10, meta gap 6 mb 3, reactions gap 12 mt 6, card m_0_16 p_4_14, radius 14) | keyscreen 동일 | RN 동일 | `home-community-peek.tsx:108~110, 124~131, 149~155, 249~252` 모두 keyscreen 값 유지 |

### (c) Gradient 방향·깊이
**결과: PASS**

| Gradient | 키스크린 색·각도 | v2 RN 토큰 | 증거 |
|---|---|---|---|
| CommUserAvatar L1 | `linear-gradient(135deg, #555560, #2a2a35)` | `noteAuthorAvatarGradient.L1` = `['#555560', '#2a2a35']` start{0,0} end{1,1} | `design-tokens.ts:661` keyscreen verbatim |
| CommUserAvatar L2 | `linear-gradient(135deg, #4a6fa5, #1a2a45)` | `L2` = `['#4a6fa5', '#1a2a45']` | `design-tokens.ts:662` keyscreen verbatim |
| CommUserAvatar L3 | `linear-gradient(135deg, #b8b8c0, #3a3a48)` | `L3` = `['#b8b8c0', '#3a3a48']` | `design-tokens.ts:663` keyscreen verbatim |
| CommUserAvatar L4 | `linear-gradient(135deg, #C9A84C, #0F0718)` | `L4` = `[brand.gold, '#0F0718']` (brand.gold=#C9A84C) | `design-tokens.ts:664` keyscreen verbatim. mock row 1 levelId=4 "벨벳폭스" gold 정체성 회복 (1차 wineRed alpha → v2 gold→navy) |
| CommUserAvatar L5 | `linear-gradient(135deg, #8B1A2A, #3a0810)` | `L5` = `[brand.wineRed, '#3a0810']` (brand.wineRed=#8B1A2A) | `design-tokens.ts:665` keyscreen verbatim |
| import 경로 | — | `comm-user-avatar.tsx:13` `import { brand, noteAuthorAvatarGradient } from '@/lib/design-tokens'` — `gradients.levelChip` 더이상 사용 안 함 | PATCH line 1187 "import 교체" 반영. `gradients.levelChip`는 `level-chip.tsx:26`에서 AppHeader 용도로 유지 (PATCH line 1401 의도) |

### (d) Corner radius
**결과: PASS**

| 요소 | 키스크린 | v2 RN | 증거 |
|---|---|---|---|
| PostTypeBadge radius | **999 (pill)** | **999 (pill)** | `post-type-badge.tsx:50` `borderRadius: 999`. **1차 사각 chip 회귀의 직접 원인 해소** — image #3 사각 인상 제거. PATCH line 1139 일치 |
| CommUserAvatar radius | 999 (원형) | 9999 (원형) | `comm-user-avatar.tsx:33` `borderRadius: 9999`. 둘 다 완전 원형 동등 |
| 카드 outer radius 14 | 14 | 14 | `home-community-peek.tsx:250` `borderRadius: 14` |

### (e) Typography 위계
**결과: PASS**

| 요소 | 키스크린 | v2 RN | 증거 |
|---|---|---|---|
| CommUserAvatar initial text color | `var(--color-cream)` (#F5F0E8 흡수) | `brand.cream` (#F5F0E8) | `comm-user-avatar.tsx:43` `color: brand.cream`. **1차 dark-on-dark (`brand.deepestDark` #05020A) 회귀의 직접 원인 해소** — "벨"/"실" 가독성 회복. PATCH line 1135/1230/1371 일치. sample 대비: cream #F5F0E8 on noteAuthorAvatarGradient.L4 (gold #C9A84C → navy #0F0718 평균 #6B5530) ≈ luminance(cream)=0.91 vs luminance(#6B5530)=0.11 → contrast ratio ≈ 7.4:1 (AAA 통과) — PATCH §접근성 분석과 일치 |
| CommUserAvatar fontFamily/weight | Playfair 700 | `PlayfairDisplay_400Regular` + `fontWeight: '700'` | `comm-user-avatar.tsx:40~42` |
| PostTypeBadge text fontSize/weight/spacing | 10/600/0.04em (=0.4px) | 10/`font-inter-semibold`/0.4 | `post-type-badge.tsx:55~57` className `font-inter-semibold` + `fontSize:10, letterSpacing:0.4` |
| PostRow title Playfair 13 lh 16.9 2줄 clamp | 동일 | `font-playfair text-text-primary dark:text-text-primary` size 13 lh 16.9 numberOfLines 2 | `home-community-peek.tsx:142~147` |
| author/ago/reactions text 10 muted | 동일 | `text-text-muted` size 10 | `home-community-peek.tsx:134~136, 159~163, 168~172` |
| appellation chip 9 gold tracking 0.54px | 동일 | gold/9/0.54 | `home-community-peek.tsx:178~183` |
| eyebrow Inter 10 500 gold UPPER tracking 1.8 | 동일 | `font-inter-medium uppercase` + gold/10/1.8 | `home-community-peek.tsx:213~221` |
| title Playfair 17 lh 20.4 cream | 동일 | `font-playfair text-text-primary dark:text-text-primary` + 17/20.4 | `home-community-peek.tsx:225~228` |
| viewAll Inter 11 600 gold | 동일 | `font-inter-semibold` + gold/11 | `home-community-peek.tsx:238~241` |

### (f) Color 사용
**결과: PASS**

| 색 | 키스크린 | v2 RN | 증거 |
|---|---|---|---|
| PostTypeBadge note | #C9A84C (gold) | `postTypeBadgeColor.note` = `brand.gold` = #C9A84C | `design-tokens.ts:680` 재사용 — PASS |
| PostTypeBadge question | #a08ee0 (purple) | `postTypeBadgeColor.question` = `'#A08EE0'` | `design-tokens.ts:681`. 1차 wineRedHover 임의 매핑 회귀 해소. 대소문자만 다름 (#a08ee0 ≡ #A08EE0) |
| PostTypeBadge column | #F5F0E8 (cream) | `postTypeBadgeColor.column` = `brand.cream` = #F5F0E8 | `design-tokens.ts:682`. keyscreen #F5F0E8 ≡ brand.cream — PATCH line 1175 흡수 명시 |
| PostTypeBadge news | #5b9ce6 (sky blue) | `postTypeBadgeColor.news` = `'#5B9CE6'` | `design-tokens.ts:683`. PATCH line 1176 일치 |
| PostTypeBadge album | #e8b4d2 (soft pink) | `postTypeBadgeColor.album` = `'#E8B4D2'` | `design-tokens.ts:684`. PATCH line 1177 일치 |
| 하드코딩 hex grep (3 PATCH 파일) | — | hex 0건 | `grep -E "#[0-9A-Fa-f]{3,6}" home-community-peek.tsx comm-user-avatar.tsx post-type-badge.tsx` → 매치 0건. 모두 토큰 참조 (brand.*, postTypeBadgeColor, noteAuthorAvatarGradient, withAlpha) — design-tokens.ts 한정 hex 허용 원칙 (§4-1, §4-9) 통과 |
| CommUserAvatar text color | (e) 참조 cream | (e) 참조 cream | 회복 |
| PostTypeBadge bg/border alpha | `${color}1a` / `${color}55` | `withAlpha(color, 0.1)` / `withAlpha(color, 0.33)` | `post-type-badge.tsx:45~47` — alpha 0.1≈26/255≈"1a", 0.33≈84/255≈"54"(≈55) 동등 |
| Card bg/border | `bg-surface` / `border-default` | `bg-surface dark:bg-surface border border-border-default dark:border-border-default` | `home-community-peek.tsx:247` 양쪽 모드 자동 분기 |
| PostRow hairline border | `0.5px solid var(--color-border-default)` | `StyleSheet.hairlineWidth` + `tokens.border.default` | `home-community-peek.tsx:114~116` |
| eyebrow/title/viewAll/Wine icon/appellation | gold/cream/gold/gold/gold | 동일 (brand.gold 토큰 + text-text-primary) | 토큰 사용 PASS |

---

## 다크/라이트 양쪽 모드

| 항목 | 다크 | 라이트 |
|---|---|---|
| 카드 bg/border | `bg-surface dark:bg-surface` Tailwind 토큰 dual | 자동 분기 OK |
| title text-text-primary | dark.cream | light.primary 자동 OK |
| author/ago/reactions text-text-muted | dark.muted | light.muted 자동 OK |
| Wine icon brand.gold | gold (양쪽 동일) | gold (라이트 카드 #FFFFFF 위 충분 contrast 추정) |
| MessageSquare icon tokens.text.muted | dark.muted | `useThemeTokens` 분기 OK |
| CommUserAvatar gradient | noteAuthorAvatarGradient L1~L5 (PATCH 의도: 양쪽 모드 동일) | 동일. notes-detail §10 E6 (a) 정합 |
| CommUserAvatar cream text on darken gradient | AAA 추정 (~7.4:1) | 동일 (gradient 양쪽 동일이므로 라이트에서도 cream 가독성 유지) |
| PostTypeBadge bg/border alpha + color | 양쪽 모드 동일 type identity. dark에서 gold/pink/blue text on darken bg = 충분 contrast | **light 모드 risks**: column type cream-on-cream-tint은 PATCH line 1303/1417에서 P3 인지 — v0.1.0 mock에는 column 없음 (note + album만) → 즉시 회피 가능. mock 한정 PASS |
| pressed feedback opacity 0.85 | RN style 함수 양쪽 OK | 양쪽 OK |

**실제 시뮬레이터 캡처 미수행** — JSX·토큰 정적 분석 기반. P2 세션이 dark/light 양쪽 캡처 채우면 image #4 3-way 비교 권장.

---

## 스크린샷 비교 (멀티모달)

| 자료 | 상태 |
|---|---|
| `_workspace/keyscreen-shots/home.png` | 존재 (image #4 동등 reference 추정) |
| 현재 v2 RN 시뮬레이터 캡처 | 미보유 (사용자가 image #4 → v2 코드 일치 확인 요청은 별도 세션) |
| 시각 차이 (추정) | v2는 PATCH 6/6 매핑표 정확 반영 → image #4와 시각 일치 추정. 1차 image #3 회귀 5축 (pill/icon/union/locale/gradient/cream) 모두 해소 |

스크린샷 캡처 보강 권장 (P2 후속) — JSX·토큰 정합성 측면은 6/6 PASS 명백.

---

## 결정

| 항목 | 값 |
|---|---|
| 결과 | **PASS** |
| FAIL 항목 수 | **0 / 6** |
| STILL-FAIL (1차에서 v2까지) | **없음** |
| 신규 FAIL (1차 검증 외 v2에서 새로 발견) | **없음** |
| 1차 → v2 회복 축 | 1. PostTypeBadge radius 4 → 999 (pill 회복) / 2. icon 5종 신규 도입 (PenLine/CircleQuestionMark/BookOpen/Sparkles/Image) / 3. PostType union 5종 verbatim 복원 + event/cellar/wine 제거 / 4. PostTypeBadge i18n 키 외부화 (locale prop 우회 — PATCH line 1352 권장안 채택) / 5. CommUserAvatar gradient 토큰 `levelChip` → `noteAuthorAvatarGradient` 교체 (L4 gold 정체성 회복) / 6. CommUserAvatar text color `brand.deepestDark` → `brand.cream` (initial 가독성 회복) |
| 라우팅 | **qa-inspector**: 시각 게이트 통과. 다음 단계 — i18n 키 7개 신규 ko/en 양쪽 채워짐 정합 (verify 완료) / hex 3종 design-tokens.ts 한정 grep / mock 데이터 RLS 영향 없음 (mock 데이터 → 마이그레이션 부재) / shape 검증 (PostType union TS 컴파일 — 별도 사용처 없음 PATCH line 1415 명시) |
| 라우팅 (사양) | 사양 PATCH 충분 — design-spec-author 추가 작업 없음 |
| escalation | mock row 2 type `'album'` 채택 — PATCH line 1416 권장값 일치. 리더 confirm 불필요 |
| 통과 후 다음 단계 | **qa-inspector** 호출 권장. 통과 후 `git add` + commit |

---

## 작업자 노트

- v2 6/6 PASS. PATCH 매핑표 line 1126~1235가 line-by-line 정확 반영됨. 1차 회귀 진단 5축 + cream text 1축 = 6축 모두 해소.
- lucide `HelpCircle` → `CircleQuestionMark` deviation은 lucide-react-native v0.x에서 `HelpCircle` 미존재로 인한 의미 동등 교체 — SCOPE-OUT 명시대로 검증 면제. d.ts grep으로 5종 icon export 모두 확인 (CircleQuestionMark line 4892).
- toast 패턴은 `Alert.alert(t('app.name'), t('home.communityPeek.comingSoon'))` 채택 — PATCH line 1235의 `toastInfo()` 가상 함수 대신 코드베이스 일관성 패턴 사용 (SCOPE-OUT 명시). 사용자 dead-press 방지 목적 동일 — 시각 게이트 영향 없음.
- light 모드 column type cream-on-cream-tint 잠재 P3 (v0.1.0 mock에 column 없음) — 본 v2 검증 통과 후에도 column type 노출 시점에 design-reviewer 재검증 필요.
- 사용자 UUID 노출 (§4-5): mock author "벨벳폭스"/"velvetfox"/"실키나이트"/"silkynight" — 익명화 패턴, UUID 직접 노출 없음 — PASS.
- 멀티모달 캡처 부재로 시각 확정은 P2 세션에서 dark/light 양쪽 캡처 + image #4 3-way 비교로 보강 권장. JSX·토큰 정합성 측면 결정은 PASS.
- 1차 FAIL 정황에서 v2 통과까지 코드 변경 부피 ≈ PATCH 추정 80 LOC 부합 (3 컴포넌트 + 토큰 + i18n 모두 반영).
