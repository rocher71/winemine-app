# DrinkThisCta

셀러 상세 **Section 6**: 화면 하단 고정 "이 와인 마시기" CTA. Fade 그라데이션 + wine-red 풀폭 버튼.

## Props

| Prop | Type | Required | Default | 설명 |
|------|------|----------|---------|------|
| `onConfirm` | `() => void \| Promise<void>` | yes | — | ConfirmDialog 확인 후 실행 콜백 |
| `disabled` | `boolean` | no | `false` | 버튼 비활성 상태 (API 호출 중 등) |

## 언제 사용하는가

- 셀러 상세에서 **`item.status === 'cellared'`**일 때만 렌더
- consumed 상태에서는 렌더하지 않음 (이미 마신 와인)

```tsx
{item.status === 'cellared' ? (
  <DrinkThisCta onConfirm={onDrinkThisConfirm} disabled={busy} />
) : null}
```

## 기본 사용법

```tsx
const onDrinkThisConfirm = async () => {
  setBusy(true);
  try {
    await setCellarStatus(item.id, 'consumed');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    router.push(`/notes/new/write?from=cellar&wine_lwin=${encodeURIComponent(wine.lwin)}&itemId=${encodeURIComponent(item.id)}`);
  } catch (err) {
    flashToast('error', t('cellar.swipe.updateFailed'));
  } finally {
    setBusy(false);
  }
};

<DrinkThisCta onConfirm={onDrinkThisConfirm} disabled={busy} />
```

## 시나리오별 활용

### 1. 표준 플로우 — 탭 → 확인 → 노트 작성

```
사용자 탭
  -> ConfirmDialog 열림 ("이 와인을 마셨나요?")
  -> "예" 탭
  -> onConfirm() 호출
  -> status 'consumed' 업데이트
  -> /notes/new/write 이동
```

### 2. disabled 상태 — API 호출 중

```tsx
<DrinkThisCta onConfirm={onConfirm} disabled={true} />
// -> 버튼 opacity 0.6, 탭 무반응
// -> ConfirmDialog도 열리지 않음
```

### 3. ConfirmDialog 취소

```tsx
// "아니요" 탭 또는 바깥 영역 탭
// -> onConfirm 호출 안 됨
// -> CTA 다시 탭 가능 상태로 복귀
```

### 4. API 오류 처리

```tsx
const onDrinkThisConfirm = async () => {
  try {
    await setCellarStatus(item.id, 'consumed');
    // 성공 → 네비게이션
  } catch {
    // 실패 → Toast 표시, 화면 유지
    flashToast('error', t('cellar.swipe.updateFailed'));
  }
};
```

## 내부 구성

```
View (position:absolute, bottom:0, left:0, right:0, zIndex:10, pointerEvents:box-none)
  LinearGradient (180deg, transparent → bg-deepest 0.95, locations:[0, 0.6])
    paddingHorizontal:16, paddingTop:12, paddingBottom:18+safeArea.bottom
    Pressable (opacity feedback)
      View (100% width, height:52, borderRadius:14, bg:brand.wineRed, shadows.wineRedCardLg)
        GlassWater 18 cream
        Text "이 와인 마시기" (Inter 15 semibold cream)
ConfirmDialog (visible=confirmOpen)
```

## 시각 스펙

| 요소 | 스펙 |
|------|------|
| Fade gradient | `cellarBottomFade[scheme]` — transparent → bg-deepest 0.95 |
| 버튼 | height 52, `borderRadius: 14`, `brand.wineRed`, `shadows.wineRedCardLg` |
| 아이콘 | `GlassWater` 18px, strokeWidth 1.75, `brand.cream` |
| 텍스트 | `font-inter-semibold` 15px, `brand.cream` |
| disabled opacity | 0.6 |
| pressed opacity | 0.92 |
| safe area | `paddingBottom: 18 + Math.max(0, insets.bottom)` |

## 주의사항

- `pointerEvents="box-none"` — fade 그라데이션 영역이 스크롤 이벤트를 가로채지 않음 (버튼 자체는 탭 가능)
- `ConfirmDialog`가 내부 상태(`confirmOpen`)로 관리됨 — 부모에서 별도 다이얼로그 상태 관리 불필요
- press 시 `Haptics.impactAsync(Medium)` 자동 실행
- `onConfirm` 내부 haptic은 성공 시 부모에서 추가 (`NotificationFeedbackType.Success`)
