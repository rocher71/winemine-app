# Design Review — /notes/[noteId] (1차)

> 검증 대상: notes-detail 화면 retroactive hardening 1차 게이트
> 검증일: 2026-05-21 01:30 KST
> reviewer: design-reviewer

## 대상 3축

| 축 | 경로 | 비고 |
|---|---|---|
| 사양 | `_workspace/design-specs/notes-detail.md` (917 LOC) | design-spec-author Day 6 retroactive 산출물 |
| 키스크린 (원본) | `../winemine-keyscreen/src/app/notes/[noteId]/page.tsx` (882 LOC) | JSX 직접 비교 X (사양 §2 verbatim 인용에 의존) — read-only 정책 §4-3 준수 |
| 키스크린 스크린샷 | `_workspace/keyscreen-shots/notes_noteId.png` | Expert · dark · ko — 멀티모달 비교 |
| 현재 RN | `app/notes/[noteId].tsx` (212 LOC) + `src/components/notes/{note-body-beginner,note-body-expert,star-rating-readonly,wset-readonly}.tsx` | Day 5 1차 + Day 6 일부 |

---

## Executive Summary

**전체 결과: FAIL**
**FAIL 항목 수: 6/6 (체크리스트 전체 불합격)**

현재 RN 구현은 노트 상세의 **시각 정보 위계 전체가 뒤집혀 있다**:

- 키스크린은 **노트 본문이 주제** → 와인은 컴팩트 thumb 헤더로 보조. 가장 시각 비중이 높은 카드는 (1) 작성자 메타 (gold border) + (2) 메모 (bg-sunken italic).
- 현재 RN은 **WineHero (88×290 큰 hero)가 주제** → 작성자 카드 부재, 메모는 body 내부에 묻혀 있음. 메타는 `tasted_at + mode pill + blind chip` 일행 strip 뿐 (rating/price/author 모두 부재).

이 차이는 단순 "스타일 미세 조정"이 아니라 **레이아웃 구조 차이**이므로 retroactive 수정 범위는 §10 E1/E3/E4 + 신규 컴포넌트 3개 (NoteWineHeaderLink, NoteAuthorCard, NoteMemoCard) 도입 필수.

---

## 6항목 체크리스트

### (1) 요소 누락 — FAIL (P0)

키스크린 verbatim 대비 누락 요소 (사양 §2 + §12 표):

| # | 키스크린 요소 | 현재 RN 상태 | 사양 위치 | 수정 요청 |
|---|---|---|---|---|
| 1-A | **WineHeaderLink** — 44×64 BottleThumb + name + "{vintage} · {region} · {country}" 한 줄 (`<Link>`) | 부재. `<WineHero />` 88×290 큰 hero로 대체됨 (`app/notes/[noteId].tsx:137~144`) | §2-2, §10 E1 (a) | `<WineHero />` 제거 → 신규 `<NoteWineHeaderLink wine={wine} />` 컴포넌트 추가. BottleThumb 44×64 radius 6 border `withAlpha(brand.gold, 0.18)` + LinearGradient(notesDetailBottleThumbGradient(bottleColor)) + name (WineNameDisplay size="card") + sub (vintage·region·country) |
| 1-B | **AuthorMetaCard** — gold border 카드, avatar(32×32 gradient + 한 글자) + name("예진" / "Me") + TemplatePill("전문가용 노트") + DateChip + RatingChip("★ 92/100") + PriceChip("₩1,180,000") | **완전 부재**. 현재 RN은 `app/notes/[noteId].tsx:146~174`에 단순 strip (date·mode pill·blind chip + 별도 줄에 StarRatingReadOnly) 만 있음. avatar/이름/price 모두 없음 | §2-3, §12 | 신규 `<NoteAuthorCard />` 컴포넌트. gold border (`border-gold` brand.gold #C9A84C 양쪽 동일) + `bg-surface` + Row1(avatar+name+TemplatePill) + Row2(DateChip+RatingChip+PriceChip+BlindChip flex-wrap). 스크린샷 line 4~7 verbatim 매칭 |
| 1-C | **AuthorAvatar** (32×32 radius 999, gradient L1~L5, border `withAlpha(brand.gold, 0.30)`, 가운데 Playfair 13 700 cream 한 글자) | 부재 | §2-3 + §6-2 | `noteAuthorAvatarGradient.L1` fallback (level_id 컬럼 v0.2.0). 한 글자 = anonymous_display.charAt(0) 또는 fallback "M"/"나" |
| 1-D | **TemplatePill** — Inter 10 muted, "입문자/Beginner" or "전문가/Expert" — radius 999 border-default | 부재 (현재 RN의 mode pill은 별개 위치 + bg-bg-deep + gold text — 스타일·위치 모두 다름) | §2-3 + §6-1 | AuthorMetaCard Row1 우측 — 현재 mode pill 제거 → TemplatePill로 통합 |
| 1-E | **MemoCard (mode 무관 공통)** — bg-sunken radius 14 border-default, Eyebrow "메모/Memo" Inter 10 600 gold uppercase ls 1.8 + Body Playfair 14 italic cream lh 1.65 | **위치·스타일·폰트 모두 부재**. 현재 RN은 Beginner body 내부 `notes.detail.sectionComment` Section(`note-body-beginner.tsx:108~116`)에서만 표시 — Inter 13 text-primary (italic X) + Section eyebrow 14 (10 X). Expert에는 메모 자체가 없음 (§10 E4) | §2-4, §10 E3 (a) | 신규 `<NoteMemoCard memo={...} />` 컴포넌트. Detail 화면 mode 무관 직접 렌더, NoteBodyBeginner Comment Section 제거. eyebrow size 10 + ls 1.8 + i18n key 변경 (sectionMemo) + body Playfair italic |
| 1-F | **Expert memo 데이터 자체 부재** — ExpertFields shape에 `memo` 필드 없음 | n/a — schema 부재 | §10 E4 (a) | ExpertFields에 `memo: string` 필드 추가 (jsonb이라 마이그레이션 불필요), expert-form 폼에 textarea 추가. **별도 cycle**: notes-write 사양 갱신 + expert-form 수정 → 본 화면은 `expertFields.memo ?? ''` 로 안전 fallback |
| 1-G | **PriceChip** ("₩1,180,000") | 부재 (현재 RN은 price를 expert.conclusions.estimated_price_krw에서 NoteBodyExpert 내부 표시 — 위치 다름) | §2-3 PriceChip | AuthorMetaCard Row2에 PriceChip 추가. 데이터는 `expertFields?.conclusions?.estimated_price_krw` fallback (v0.1.0 SCOPE-OUT 컬럼 부재) |
| 1-H | **EditBtn** (Pencil 18 stroke 1.75 text-secondary, BackHeader right slot) | 부재 — 현재 RN은 Delete 만 노출 | §2-1, §9-1, §12 | BackHeader right slot: `<Edit + Delete>` 2-icon. (Share는 §10 E7 (b) 채택으로 미노출 — keep) |
| 1-I | **하단 "이 와인 보기" CTA** | 현재 RN `app/notes/[noteId].tsx:183~202` 별도 CTA로 노출 | §12 표 "Wine header link" | WineHeaderLink가 이 역할을 대체 — CTA 제거 (중복) |

증거 (스크린샷 시각 비교):
- 키스크린: 헤더 line 1 BackBtn + "테이스팅 노트" + Pencil + Share2 (4 elements)
- 현재 RN: 헤더 line 1 BackBtn + (와인명을 헤더 title로 사용) + Trash2 only (3 elements, title 다름)
- 키스크린: line 2~3 = 컴팩트 와인 thumb + name + meta
- 현재 RN: line 2~14 = WineHero 큰 박스 (88×290) — 키스크린의 ~4배 면적 차지

**판정: FAIL** — 핵심 정보 위계 컴포넌트 9개 누락 / 위치 오류.

---

### (2) Spacing 비율 — FAIL (P1)

| 위치 | 키스크린 | 현재 RN | 차이 |
|---|---|---|---|
| ScrollView paddingBottom | 40 | `paddingBottom: 32` (`app/notes/[noteId].tsx:134`) | 8px 적음 (BottomNav 부재라 keyscreen verbatim 40으로 통일 권장) |
| WineHeaderLink padding | `px 20 py 14` (paddingHorizontal 20 paddingVertical 14) | `<WineHero />` 자체 padding (별 비교 의미 X — 컴포넌트 자체 교체 대상) | n/a (E1) |
| AuthorMetaCard padding | `p 14` (14px) + gap 10 (row gap) | 부재 → 단순 strip이 `mt-5 mx-4 rounded-xl p-4` (16px) | 카드 자체 부재 |
| AuthorMetaCard mx | mx 16 (16px) | `mx-4` (16px) | OK (동일) |
| MemoCard padding | `p 16` + mt 16 | 부재 — Beginner body Section은 `p-4` (16) — OK | (E3 적용 후 동일 px) |
| MemoCard gap (eyebrow ↔ body) | mb 8 (eyebrow → body) | `mt-3` (12px) on body — 4px 더 | eyebrow mb 8 / body mt 0으로 통일 |
| Card 사이 gap (vertical) | `mt 16` 각 카드 = 16px | 현재 `mt-5` (20px) — 4px 큼 | `mt-4` (16px)로 통일 |
| DimGrid gap | 6 (`gap-1.5`) | n/a (현재 RN dot bar 사용 — §10 E5 (b) 유지) | n/a |
| BottleThumb shrink | `flexShrink 0` (`shrink-0`) | n/a (WineHero 사용 중) | E1 적용 후 적용 |
| Aroma chip gap | 5 (수평) | `gap-2` (8px) — 3px 큼 | `gap-1.5` (6px)로 — 키스크린 5에 가장 근사한 토큰 |

**판정: FAIL** — 8개 위치에서 spacing 비율 오차. 특히 카드 간 mt-5 → mt-4 통일, ScrollView paddingBottom 32 → 40 통일은 §12 verbatim과 함께 일괄 수정.

---

### (3) Gradient 방향·깊이 — FAIL (P1)

| 위치 | 키스크린 verbatim | 현재 RN | 차이 |
|---|---|---|---|
| **BottleThumb (44×64)** | `linear-gradient(160deg, ${bottleColor} 0%, #1a0a1e 70%)` ≈ `start={{x:0,y:0}} end={{x:0.342,y:0.94}} locations={[0,0.7]}` | 부재 (WineHero 사용) — WineHero 자체 gradient (`gradients.wineHeroBottle(...)`) 와 다른 토큰 | E1 채택 시 신규 토큰 `notesDetailBottleThumbGradient(bottleColor)` 적용 (사양 §6-2). end 색은 양쪽 모드 모두 `dark.bg.bottleShelf` = #1a0a1e (사양 §10 E6 (a) 채택) |
| **AuthorAvatar (32×32)** L1~L5 | `linear-gradient(135deg, ...)` × 5 (L1 #555560→#2a2a35, L2 #4a6fa5→#1a2a45, L3 #b8b8c0→#3a3a48, L4 brand.gold→#0F0718, L5 brand.wineRed→#3a0810) | 부재 | 신규 토큰 `noteAuthorAvatarGradient.L{1~5}` 추가 (사양 §6-2). v0.1.0은 L1 fallback (level_id 컬럼 v0.2.0). 스크린샷 line 4의 avatar는 어두운 navy/gray L1~L2 톤 — 정확히 일치 |

**판정: FAIL** — gradient 토큰 2종 미정의 + 사용처(BottleThumb, AuthorAvatar) 자체 부재. infra-architect P0 세션 의존 (사양 §6 12개 신규 토큰 일괄 적용 필요).

---

### (4) Corner Radius — PARTIAL FAIL (P2)

| 위치 | 키스크린 | 현재 RN | 차이 |
|---|---|---|---|
| WineHeaderLink (Pressable 자체) | radius 0 (테두리 없음) | `rounded-xl` 12 (WineHero 사용) | E1 채택 후 thumb 카드 자체는 radius 0 (헤더 line), thumb 만 radius 6 |
| BottleThumb | radius 6 | n/a | E1 적용 후 `rounded-md` (6) |
| AuthorMetaCard | radius 14 | n/a (메타 strip이 `rounded-xl` 12) | 카드 자체 부재 — 신규 카드 `rounded-[14px]` 또는 토큰 `radius[14]` |
| MemoCard | radius 14 | n/a (Beginner Comment Section은 `rounded-xl` 12) | 신규 카드 `rounded-[14px]` |
| DimensionsExpert Section (NoteBodyExpert `note-body-expert.tsx:23`) | radius 14 (각 카드) | `rounded-xl` 12 | radius 14로 통일 |
| TemplatePill / DateChip / RatingChip / PriceChip / BlindChip | radius 999 | mode pill / blind chip 은 `rounded-full` (OK) | OK 부분 |
| Aroma chip | radius 999 | `rounded-full` | OK |

**판정: PARTIAL FAIL** — 카드 radius 12 → 14 변경 + 컴포넌트 신규 추가 모두 radius 14 적용.

---

### (5) Typography 위계 — FAIL (P0)

키스크린은 Eyebrow 위계(Inter 10 600 gold uppercase ls 1.8) 가 모든 카드 타이틀 공통. 현재 RN은 `text-section-title` (Inter 14 600 secondary uppercase) — 4px 큼 + ls 부재 + 색 다름.

| 위치 | 키스크린 verbatim | 현재 RN | 차이 |
|---|---|---|---|
| Card Eyebrow ("메모", "WSET 차원", "구조", "여운·온도", "아로마", "오프닝 타임라인", "음용 적기 추정", "감지된 결함") | Inter 10 600 **gold** uppercase **ls 0.18em (1.8px)** mb 10 (사양 §2-4, §2-5B) | NoteBodyExpert Section title (`note-body-expert.tsx:24`): `text-section-title` (14) + `text-gold` + uppercase — ls 부재 + size 4px 큼 / NoteBodyBeginner `note-body-beginner.tsx:57, 83, 110`: `text-section-title` + `text-text-secondary` (gold X) | size 10 + ls 1.8 + color gold 통일. `typography.beginnerEyebrow` 재사용 (사양 §4-2: 11/11 ls 1.76 — 0.04 차이 무시 가능) 또는 신규 토큰 |
| Wine name (헤더) | Playfair 16 cream lh 1.3 (`typography.cardTitle`) | `WineHero` 내부 큰 헤더 + `WineNameDisplay size="card"` (CTA 하단) | E1 적용 후 thumb 옆 name = `WineNameDisplay size="card"` (현재와 동일 토큰) — OK |
| Wine sub ("2018 · 보르도 · 프랑스") | Inter 12 text-muted mt 2 (`typography.cardMeta`) | 부재 (WineHero에는 vintage 표시만, region/country 부재) | 신규 line. `font-inter text-card-meta text-text-muted mt-0.5` |
| Author name ("예진" / "Me") | Playfair 14 cream (`noteAuthorName` 신규 §6-1) | 부재 | 신규 토큰 + 컴포넌트 |
| Avatar 한 글자 ("예") | Playfair 13 **700** cream (`noteAvatarLetter` 신규) | 부재 | 신규 |
| TemplatePill ("전문가용 노트") | Inter 10 muted (`noteTemplatePill` 신규) | 현재 mode pill은 `text-card-meta` (12) + gold — size 2px 큼 + color 다름 | 신규 토큰 + 위치 이동 (AuthorMetaCard Row1로) |
| DateChip ("2025-09-14") | Inter 12 text-muted (`typography.cardMeta`) | `text-card-meta text-text-muted uppercase` (`app/notes/[noteId].tsx:148`) — uppercase 불필요 (날짜는 uppercase X) | uppercase 제거, 12 muted 유지 |
| RatingChip ("★ 92/100") | Star 12 fill gold + Inter 12 600 gold (`noteRatingChip` 신규) | StarRatingReadOnly 별 5개 시각 (1행 차지) — 위치 다름 + 단위 다름 (§10 E2) | §10 E2 (b) 권장 하이브리드: AuthorMetaCard Row2의 RatingChip에는 `★ ${rating}/5` 텍스트 — 별 5개 컴포넌트는 제거 (메타 strip 자체 제거 대상) |
| PriceChip ("₩1,180,000") | Inter 12 text-secondary | 부재 (NoteBodyExpert 내부 `text-card-body` 표시) | AuthorMetaCard로 이동 |
| BlindChip ("블라인드 시음") | Inter 10 600 gold (현재 RN enhancement) | `text-card-meta text-gold` (12) — size 2px 큼 | size 10으로 |
| MemoCard body | Playfair 14 **italic** cream lh 1.65 (`noteMemoBody` 신규) | `font-inter text-card-body text-text-primary` (Inter 14 not-italic) — font family + italic 모두 다름 | Playfair + italic + lh 23.1 |
| DimGrid cell value (Beginner) | Playfair 14 cream lh 1.1 `${v}/5` (`noteBeginnerDimValue` 신규) | n/a (dot bar 유지 §10 E5 (b)) | n/a |
| DimGrid wsetShort (Expert 5-col) | Inter 단어 "낮음/중−/중/중+/높음" + 스크린샷 line 13~14 보면 size 작음 (10~12) | n/a — 현재 RN은 dot bar (§10 E5 (b) 유지). **단** 스크린샷의 5-col WSET 차원 카드는 dot bar 아닌 단어 표기 — §10 E5 결정 재확인 필요 | **escalation**: 스크린샷이 단어 표기를 verbatim으로 보여줌. (b) dot bar 유지의 미적 이점 vs (a) verbatim 단어 일관성 — 사용자 결정 필요 (본 리뷰 1차에서는 (b) 권장 그대로 — 변경 X) |
| Row label / value | Inter 12 muted / Playfair 12 cream (`noteRowValue` 신규) | n/a (현재 RN ExpertFields shape 차이 — §10 D2 SCOPE-OUT) | n/a (E8 (a) 4-section 유지) |

**판정: FAIL** — 11개 위치에서 폰트 크기·색·계열·italic·letter-spacing 미일치. 특히 Card Eyebrow 위계 (10 gold ls 1.8) 적용 안 되면 키스크린 톤 절대 안 나옴.

---

### (6) Color 사용 — PARTIAL FAIL (P2)

| 위치 | 키스크린 | 현재 RN | 판정 |
|---|---|---|---|
| AuthorMetaCard border | `border-gold` (#C9A84C 양쪽 동일) | n/a (카드 부재) | 신규 적용 — `border-gold` 토큰 사용 (`tailwind.config.ts` 기존 정의) |
| BottleThumb border | `withAlpha(brand.gold, 0.18)` = rgba(201,168,76,0.18) | n/a | `withAlpha` 헬퍼 사용 (이미 design-tokens.ts 에 존재) |
| MemoCard bg | `bg-bg-sunken` (dark rgba(0,0,0,0.28) / light rgba(42,26,20,0.06)) | 현재 NoteBodyBeginner Comment Section은 `bg-surface` (dark #3D2A4A) — 깊이 다름 | `bg-bg-sunken` 변경 (스크린샷 보면 메모 카드가 다른 카드보다 약간 더 어두움 — 정확히 bg-sunken 의도) |
| MemoCard border | `border-border-default` | n/a (현재 Section은 bg-surface only, border 부재) | border 1 추가 |
| Eyebrow text | `text-gold` (#C9A84C) | NoteBodyBeginner는 `text-text-secondary`, NoteBodyExpert는 `text-gold` (mixed) | **전부 `text-gold` 통일** |
| Fault chip (스크린샷에 없음 — Expert v0.2.0 SCOPE-OUT) | bg rgba(139,26,42,0.18) + border `brand.wineRed` + text `brand.wineRedHover` | n/a (§10 D2 SCOPE-OUT) | n/a |
| 하드코딩 hex grep | n/a | `app/notes/[noteId].tsx:25` `brand` import 사용 only (직접 hex 없음) — `app/notes/[noteId].tsx:75, 86, 125, 161, 201` 모두 `brand.gold`, `brand.wineRed` 토큰 사용 — OK | OK 부분 (P0 회피) |
| StarRatingReadOnly color | brand.gold | OK | OK |
| AuthorAvatar gradient L1~L5 | 고정 5종 gradient (양쪽 모드 동일) | n/a | 신규 토큰 (§6-2) |
| `text-text-muted dark:text-text-muted` 중복 | n/a | `app/notes/[noteId].tsx:148, 162` 등에 `text-text-muted dark:text-text-muted` 패턴 — NW v4 dual 정의가 이미 dark/light 양쪽 처리하므로 dark: 중복 — 단 사양 §3-2에서 명시적 dual 권장 (안전성) | 무해. P3 (clean-up) |

**판정: PARTIAL FAIL** — 카드 부재로 인한 색 적용 누락 (border-gold, bg-bg-sunken)이 주. 하드코딩 hex는 0 (P0 회피). text-gold 통일 + bg-sunken 변경이 핵심.

---

## 다크/라이트 양쪽 모드 — 미검증 (블로커)

현재 RN 자체가 키스크린 verbatim과 레이아웃 차이가 크므로 dark/light dual 검증은 **재구현 후 2차 게이트에서** 수행. 1차 게이트에서는 토큰 dual 정의 여부만 확인:

- `bg-bg-sunken`: dark rgba(0,0,0,0.28) / light rgba(42,26,20,0.06) — 토큰 존재 OK (`tailwind.config.ts`)
- `border-gold`: #C9A84C 양쪽 동일 — OK
- `noteAuthorAvatarGradient` 양쪽 모드 동일 — 토큰 부재 (§6-2 신규 필요)
- `notesDetailBottleThumbGradient` end 색 양쪽 #1a0a1e 고정 — 토큰 부재 (§6-2 신규 필요)

→ **2차 게이트 (E1+E3+E4 적용 후)에서 light 모드 캡처 의무 (CLAUDE.md §4-9).**

---

## 스크린샷 vs RN 시각 차이 (멀티모달 요약)

스크린샷의 화면 점유 비율 (대략):
- BackHeader: 6%
- 와인 thumb + name 헤더 (line 2~3): **6%**
- AuthorMetaCard (gold border, line 4~7): **15%**
- MemoCard (line 8~11): **13%**
- WSET 차원 (line 12~15): 10%
- 구조 (line 16~20): 13%
- (… 이하 6 cards)

현재 RN 점유 비율:
- BackHeader: 6%
- WineHero (line 2~10): **~28%** (키스크린 6% 대비 4.6배)
- 메타 strip (line 11~13): 7%
- (mode body 영역…)
- "이 와인 보기" CTA: 6% (키스크린 0%)

**시각 무게 중심 차이**: 키스크린 = 메모/AuthorMeta가 28%, 와인은 6%. 현재 RN = 와인이 28%, 메타·메모가 ~13%. **2배 가까운 정보 우선순위 역전** — 시각적 인상이 키스크린과 완전히 다른 화면.

---

## SCOPE-IN / SCOPE-OUT 재판단 (사양 §10 escalation 8건)

본 1차 리뷰의 권장 결정:

| ID | 항목 | 사양 권장 | 본 리뷰 판정 | 사유 |
|---|---|---|---|---|
| **E1** | WineHero → 컴팩트 thumb | (a) 교체 | **SCOPE-IN (P0)** | 스크린샷 비교 시 화면 점유 28% vs 6% — 정보 위계 역전이 시각 인상의 가장 큰 차이. 본 화면 핵심 fix |
| **E2** | rating /5 vs /100 | (b) /5 유지 + RatingChip 텍스트 병기 | **SCOPE-IN partial** | 스크린샷은 "★ 92/100" — keyscreen verbatim은 100점. **단** RN 작성 폼이 0~5 half-step이므로 작성-읽기 일관성 ↑가 더 중요. **하이브리드**: RatingChip 텍스트 `★ ${rating}/5` (사양 §10 E2 권장 그대로). StarRatingReadOnly 별 5개 컴포넌트는 메타 strip 제거 대상이므로 자연 제거. **사용자 결정 가능**: /100 표시 원하면 `★ ${Math.round(rating * 20)}/100` |
| **E3** | MemoCard 위치 | (a) Dimensions 위 (mode 무관 공통) | **SCOPE-IN (P0)** | 스크린샷 line 8~11 메모가 명확히 mode-agnostic 공통 카드. NoteBodyBeginner 내부 Comment Section 제거 + Detail 직접 렌더 |
| **E4** | Expert memo 필드 | (a) ExpertFields에 memo 추가 | **SCOPE-IN (P1)** | 단, **별도 cycle**: notes-write 사양 갱신 + expert-form 추가 필요. 본 화면은 `expertFields?.memo ?? ''` 안전 fallback으로 시작. expert-form에 memo 필드 추가는 별 cycle (rn-screen-builder가 notes-write와 함께 작업) |
| **E5** | WSET scale 라벨 (단어 vs dot bar) | (b) dot bar 유지 | **SCOPE-OUT (RE-ESCALATE)** | 스크린샷 line 13~14의 5-col WSET 차원이 "낮음/중+/높음/중/높음" 단어 표기를 명확히 보여줌. 사양 §10 E5 (b) 권장 (dot bar 유지)는 시각적 강점이 있지만 **keyscreen verbatim 원칙 위반**. **본 리뷰 의견**: (b) 유지하되 NoteBodyExpert에 더해 **5-col 요약 카드 ("WSET 차원" 단어 라벨)를 추가**하는 하이브리드 — 사용자 결정 필요. 1차에서는 (b) keep 권장 동의 (RN shape 차이로 5-col WSET 구성 어려움) |
| **E6** | BottleThumb end 색 양쪽 모드 | (a) `dark.bg.bottleShelf` (#1a0a1e) 양쪽 고정 | **SCOPE-IN (P2)** | 토큰 정의 결정. 라이트 모드 화이트 끝색은 와인 분위기 손상 |
| **E7** | Share btn v0.1.0 | (b) 미노출 | **SCOPE-OUT 유지 (현재 RN 일치)** | 현재 RN이 이미 Share 미노출. v0.2.0 native Share API 도입 시 추가 |
| **E8** | DimensionsExpert 4-section vs 10-card | (a) 4-section 유지 | **SCOPE-OUT 유지 (현재 RN 일치)** | RN ExpertFields shape 부재 필드 5개 (bubbles, aromaWheel, evolution, faults, wouldBuyAgain) — v0.2.0 schema 확장 필요. NoteBodyExpert 4-section keep. **단** Card Eyebrow 위계 (size 10 + ls 1.8 + gold) 는 (5)에서 P0 수정 대상 |

요약:
- **SCOPE-IN (P0)**: E1, E3
- **SCOPE-IN (P1)**: E4 (별도 cycle)
- **SCOPE-IN (P2)**: E2 (partial), E6 (토큰 정의)
- **SCOPE-OUT**: E5 (RE-ESCALATE 가능), E7 (현재 RN 일치), E8 (현재 RN 일치)

---

## 라우팅 — 수정 요청

### → infra-architect (P0 토큰 확장 세션)

사양 §6 신규 토큰 12개 일괄 추가:

1. typography 10개 (`src/lib/design-tokens.ts` typography 객체):
   - `noteAuthorName`, `noteAvatarLetter`, `noteTemplatePill`, `noteRatingChip`, `noteMemoBody`, `noteBeginnerDimValue`, `noteRowValue`, `noteAromaCatLabel`, `notePeakNote`, `chipLabelRegular`
2. gradient 2개 (`src/lib/design-tokens.ts` export):
   - `notesDetailBottleThumbGradient(bottleColor)` factory
   - `noteAuthorAvatarGradient.L1~L5` object

### → rn-screen-builder (notes-detail 재구현 — retroactive cycle 1)

`_workspace/design-specs/notes-detail.md` §13 체크리스트 준수. 다음 항목 수정 (우선순위순):

**P0 (1차 게이트 통과 필수)**:
1. `app/notes/[noteId].tsx` 재구성:
   - `<WineHero />` 제거 → `<NoteWineHeaderLink wine={wine} />` 신규
   - 메타 strip (line 146~174) 제거 → `<NoteAuthorCard note={note} wine={wine} />` 신규
   - `<NoteMemoCard memo={resolveMemo(mode, beginnerFields, expertFields)} />` 신규 (mode 무관 공통, NoteBody 위)
   - 하단 "이 와인 보기" CTA (line 183~202) 제거 (WineHeaderLink가 대체)
   - BackHeader right slot: `<EditBtn />` + `<DeleteBtn />` (Share 보류, §10 E7)
2. 신규 컴포넌트 3개:
   - `src/components/notes/note-wine-header-link.tsx` (BottleThumb 44×64 + name + meta)
   - `src/components/notes/note-author-card.tsx` (gold border, avatar + name + chip row)
   - `src/components/notes/note-memo-card.tsx` (bg-sunken, eyebrow + italic body)
3. `src/components/notes/note-body-beginner.tsx`:
   - Comment Section 제거 (line 108~116) — Memo는 §2-4 책임
   - Section eyebrow 폰트: size 10 + `text-gold` + ls 1.8 (typography.beginnerEyebrow 사용)
4. `src/components/notes/note-body-expert.tsx`:
   - Section eyebrow 폰트: size 10 + ls 1.8 (위와 동일 토큰)
   - 각 Section radius 14 (`rounded-[14px]`)

**P1 (별도 cycle)**:
- E4 Expert memo 필드 추가 → notes-write 사양 갱신 의존 (design-spec-author 트리거)

**P2 (clean-up)**:
- DateChip uppercase 제거 (`app/notes/[noteId].tsx:148`)
- 카드 vertical gap mt-5 → mt-4 통일
- ScrollView paddingBottom 32 → 40
- Aroma chip gap `gap-2` → `gap-1.5` (`note-body-beginner.tsx:91`)

### → design-spec-author (사양 보완 — 1건)

- §10 E4 (Expert memo) — notes-write.md 갱신 trigger. ExpertFields shape에 `memo: string` 추가 명세 + expert-form 폼 위치 (Conclusions Section 끝 또는 별도 marginTop 16 textarea) 결정.

### → 사용자 의사결정 (escalation re-check)

- **E2 rating 단위**: 사양 권장 (b) `/5` 동의. 다른 의도면 알려달라.
- **E5 WSET scale 단어 라벨**: 스크린샷 verbatim은 단어. 사양 (b) 권장 (dot bar 유지)와 충돌. **현재 1차에서는 (b) keep**.

---

## 결정 (1차 게이트)

| 항목 | 값 |
|---|---|
| 결과 | **FAIL** |
| FAIL 항목 수 | **6/6** ((1) 요소 누락 / (2) spacing / (3) gradient / (4) radius / (5) typography / (6) color 모두 FAIL 또는 PARTIAL FAIL) |
| 차단 사유 | E1 (WineHero → 컴팩트 thumb 교체), E3 (MemoCard 끌어올림), AuthorMetaCard 신규 추가 — 세 가지가 화면 시각 인상의 80% 결정 |
| 후속 | rn-screen-builder 재작업 → 2차 게이트 (dark/light dual 검증 포함) |
| 재검증 시점 | rn-screen-builder가 notes-detail.md §13 체크리스트 수정 완료 후 SendMessage 받음 |
| 의존 작업 | infra-architect P0 (토큰 12개) 선행 — 토큰 없으면 또 하드코딩으로 도망갈 위험 |

---

## SCOPE-OUT 항목 (본 리뷰 미수행, 별도 cycle)

- Day 6 settings 3 sub + settings hub + (tabs)/settings/_layout + BottomNav tabs 구성
- AppHeader 재작성
- tasting_notes.is_public 컬럼 (supabase-engineer 영역) + Share UI
- shared notes / expert 풀 트리 / profiles.level_id (사양 §10 D1~D3 v0.2.0)
- notes/[noteId].tsx pre-existing TS narrowing 에러 (별도 cycle)

— 끝.
