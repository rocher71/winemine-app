# CommunityShortcutCard

홈 화면에서 커뮤니티로 진입하는 **숏컷 카드**. wine-red → white 대각 그라디언트 배경.

## Props

없음. 내부에서 `getCommunityPosts()[0]`으로 최신 포스트 제목을 preview로 표시.

## 사용처

```tsx
// app/(tabs)/home 내 ScrollView
<CommunityShortcutCard />
```

## 동작

- 탭 시 v0.1.0 deferredToast (`community.shortcut.deferredToast`) 표시 후 2.5초 auto-dismiss
- v0.2.0에서 `router.push('/(tabs)/community')` 로 교체 예정

## 시각 스펙

- LinearGradient: `wineRed@20%` → `light.bg.surface`, start(0,0) end(1,1)
- border: 1px `gold@33%`, radius 14
- 좌측 콘텐츠: COMMUNITY badge (gold tint uppercase) + NEW badge (wine-red solid) + 타이틀 + preview 1줄
- 우측: ChevronRight 16 `light.border.active`
- Toast: `position: absolute, bottom: -56` (카드 아래 노출)

## 주의

이 컴포넌트는 **홈 화면 전용**. 커뮤니티 탭 자체에서는 사용되지 않음. `src/components/community/` 에 위치하지만 home에서 import.
