# Day 6 — wine-detail retroactive hardening

- 작성: rn-screen-builder
- 날짜: 2026-05-20
- 사양: `_workspace/design-specs/wine-detail.md`
- 1차 design-review: `_workspace/design-review_wine-detail_20260520_200703.md` (FAIL 6/6)
- 결과: 6/6 FAIL 카테고리 모두 해결 시도

## 변경 파일

### 토큰·인프라 (3)
- `src/lib/design-tokens.ts` — wineTypeDot×6, servingTempDefault×6, wsetGridBg.{dark,light}, radius['18'], typography 7종 (cardSectionTitle/cardBig/ratingPillScore/wineStoryHeadline/wsetMiniDim/microLabel/servingTempPill), shadows.wineRedCardSm/Lg
- `tailwind.config.ts` — borderRadius['18'], fontSize 7종 동기화
- `src/components/shared/wm-bottle.tsx` — producer/label/vintage SvgText 옵션 추가 (88×290 hero에서만, thumbnail backward-compat)

### i18n (2)
- `src/lib/i18n/ko.json` — wineDetail.{servingTemp,fav,myNote,writeNote,externalRatings,avgPrice,priceChart,communityPeak,story,reviews,a11y} ~40 키 + notes.beginner.wsetShort 5 키
- `src/lib/i18n/en.json` — 동일 양쪽 모드

### 신규 컴포넌트 (10)
- `src/components/wine/serving-temp-pill.tsx` — Hero abs gold pill (type별 default)
- `src/components/wine/favorite-toggle.tsx` — BackHeader right slot (로컬 state — wine_favorites 마이그레이션 후 supabase upsert TODO)
- `src/components/wine/my-tasting-note-card.tsx` — 노트 있을 때 (border gold + goldGlow shadow + WSET 4-grid mini)
- `src/components/wine/write-note-cta.tsx` — 노트 없을 때 (icon circle + glass SVG + CTA pill wineRedCardSm shadow)
- `src/components/wine/external-ratings-card.tsx` — 3-col grid placeholder + Info button toast
- `src/components/wine/average-price-pill.tsx` — empty state placeholder
- `src/components/wine/price-chart-stub.tsx` — range toggle + chart empty + details link
- `src/components/wine/community-drink-window-card.tsx` — Users header + empty fallback (사양 verbatim 메시지) — community-peak-placeholder.tsx 대체
- `src/components/wine/wine-story-card.tsx` — minHeight 220 + empty fallback
- `src/components/wine/review-list.tsx` — Sort toggle + empty fallback
- `src/components/wine/add-to-cellar-cta.tsx` — height 52 radius 14 wine-red + wineRedCardLg shadow

### 신규 훅 (1)
- `src/hooks/use-my-note-for-wine.ts` — `tasting_notes where user_id=auth.uid() and wine_lwin=lwin order tasted_at desc limit 1`

### 재작성 (2)
- `src/components/wine/wine-hero.tsx` — radial→LinearGradient 수직 fade (start={0.5,0}, end={0.5,1}, locations=[0,0.7], alpha 0.21), light/dark gradient end 분기 (§4-9), WMBottle 88×290 + 텍스트 SVG, ServingTempPill abs, type dot + name + producer + region·country·vintage 메타 블록 — verbatim
- `app/wine/[lwin].tsx` — BackHeader+FavToggle / WineHero / MyNoteCard|WriteCta / ExternalRatings / AvgPrice / PriceChart / CommunityDrinkWindow / WineStory / ReviewList / AddToCellarCta inline + ScrollView gap:16 paddingBottom:32

## 데드 코드 (제거 결정 — 사양 §12 Q1/Q2)
- `src/components/wine/wine-meta.tsx` — keyscreen verbatim 위반, screen에서 import 제거 (파일은 남김 — 후속 정리)
- `src/components/wine/drinking-window-bar.tsx` — keyscreen 등가물 없음, screen에서 import 제거 (셀러 detail에서는 여전히 import 중 — 별도 화면 영향)
- `src/components/wine/community-peak-placeholder.tsx` — CommunityDrinkWindowCard로 교체, import 제거

## FAIL 카테고리 해결 매트릭스

| # | 카테고리 | 1차 status | 해결 |
|---|---|---|---|
| 1 | 요소 누락 (12 영역 중 4만 존재) | FAIL | 12 영역 모두 시각 verbatim 구현 (FavoriteToggle/ServingTempPill/WMBottle text/hero meta/MyNoteCard/WriteCta/ExternalRatings/AvgPrice/PriceChart/CommunityDrinkWindow/WineStory/ReviewList/AddToCellarCta) |
| 2 | Spacing | FAIL | Hero padding 32_0_24 (top 32 bot 24), mx-4(px-4) 적용, ScrollView gap:16, AddToCellarCta height 52 |
| 3 | Gradient | FAIL | radial→LinearGradient 수직(start={0.5,0} end={0.5,1} locations=[0,0.7]), alpha 0.21 (withAlpha), light gradient end 분기 |
| 4 | Corner radius | FAIL | Hero rounded-[18px] (radius['18'] 토큰), 9 cards 16/12/14 verbatim, ServingTempPill rounded-full, WriteCta circle rounded-full |
| 5 | Typography | FAIL | cardSectionTitle/cardBig/ratingPillScore/wineStoryHeadline/wsetMiniDim/microLabel/servingTempPill 7 토큰 추가 + tailwind 동기화 + 카드 적용 |
| 6 | Color | FAIL | wineTypeDot×6, wsetGridBg.dark/light, wineRedCardSm/Lg shadow, light 모드 gradient end 분기. 하드코딩 hex 0건 (design-tokens.ts·tailwind.config.ts·lwin.ts 외) |

## 미해결 항목

- **wine_favorites 마이그레이션 부재**: FavoriteToggle은 로컬 state만 토글 (UI verbatim). 데이터 영속 X → supabase-engineer 트리거 필요 (v0.2.0 P0)
- **wines.serving_temp_{min,max} 컬럼 부재**: ServingTempPill은 wine type별 servingTempDefault fallback 사용 (red 16-18, white 8-12 등) — UI verbatim. 컬럼 추가 시 자동 우선됨 (supabase-engineer)
- **PriceChart 실 차트**: purchases 테이블 부재 → empty placeholder만 (사양 §12 Q4 채택)
- **CommunityDrinkWindowCard 히스토그램**: community_peak_estimates 테이블 부재 → empty fallback verbatim (사양 §12 Q5 채택)
- **WineStoryCard funFact popover**: wine_stories 테이블 부재 → empty fallback (사양 §12 Q6 채택)
- **ReviewList 실 데이터**: reviews 테이블 + 공개 정책 미정 → empty fallback (사양 §12 Q7 채택)
- **MyTastingNoteCard community compare ≥10 expert**: reviews 부재로 부분 미구현 (전체 카드는 표시 — 사양 §12 Q15 deferred 채택)
- **Tabs row (노트/가격/스토리/리뷰)**: 키스크린 스크린샷에 있으나 사양 §2 트리에 명시 X — 사양 갭. design-spec-author SendMessage 필요 (이번 세션에서는 미구현, anchor scroll vs 실 tab nav 결정 후 보강 가능)
- **/wine/{lwin}/{prices,community-peak,story} 후속 화면**: v0.2.0 deferred — PriceChart/CommunityDrinkWindow details link는 Toast 안내로 처리 (사양 §12 Q9)
- `wine-meta.tsx` / `drinking-window-bar.tsx` / `community-peak-placeholder.tsx` 파일 자체는 미삭제 (cellar/[lwin]에서 drinking-window-bar 여전히 사용 — 셀러 화면 retroactive 시 함께 결정)

## TypeScript 컴파일 (내 변경 파일 한정)

- `npx tsc --noEmit | grep wine-detail|wine-hero|wm-bottle|design-tokens|i18n|use-my-note` → **0 errors**
- 전체 23 errors는 모두 사전 존재 (cellar/[lwin], notes/[noteId] string-null 타입, edge function deno import, nativewind preset declare) — 본 세션 무관

## 다음 단계 권고

1. **design-reviewer 재검증**: 6항목 체크리스트 재실행 + dark/light·ko/en 4 조합 시각 캡처 비교
2. **design-spec-author**: Tabs row 사양 보강 (anchor vs tab nav 결정)
3. **supabase-engineer**: wine_favorites 마이그레이션 (P0), wines.serving_temp_{min,max} 컬럼 (P1) — 추가 후 FavoriteToggle/ServingTempPill 코드 한 줄 수정만으로 실 데이터 연결
4. **cellar/[lwin] retroactive**: DrinkingWindowBar 사용 종료 결정 (wine-detail에서 제거 → 셀러에서도 동일 처리)
