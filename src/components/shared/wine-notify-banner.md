# WineNotifyBanner

화면 **상단에서 슬라이드인**하는 in-app 알림 확인 배너.  
좌측 winemine 로고 썸네일 + 우측 앱 레이블 · 제목 · 본문 구조 (Variant C · 라벨 카드).

> 디자인 출처: *winemine Notify Confirmations v2.html* — 6개 시안 중 C(라벨 카드) 채택.  
> 이유: 좌측 이미지 슬롯 구조가 재사용성 최고, 다크/라이트 모두 자연스러움.

## Props

| Prop | Type | Required | Default | 설명 |
|------|------|----------|---------|------|
| `visible` | `boolean` | yes | — | true → 슬라이드인 + autoDismiss 타이머 시작 |
| `title` | `string` | yes | — | 굵은 제목 (1줄, e.g. "알림 설정 완료") |
| `body` | `string` | yes | — | 보조 설명 (최대 2줄) |
| `onHide` | `() => void` | no | — | 슬라이드아웃 완료 후 콜백 — 부모에서 visible 상태 리셋 |
| `autoDismissMs` | `number` | no | `2500` | 슬라이드인 후 자동 닫힘까지 딜레이 (ms) |

## 언제 사용하는가

- 사용자 액션에 대한 **즉각적인 확인 피드백**이 필요하고, 일반 Toast보다 정보가 더 많아야 할 때
- 화면 아래쪽에 이미 CTA(DrinkThisCta 등)가 있어 하단 Toast와 겹칠 우려가 있을 때
- winemine 브랜드 톤의 확인 메시지가 필요할 때

| 상황 | 이 컴포넌트 | 기존 Toast |
|------|------------|-----------|
| 알림 토글 확인 | `WineNotifyBanner` | ~~Toast~~ |
| API 오류 (error) | — | `Toast` tone="error" |
| 편집 저장 성공 | — | `Toast` tone="success" |

## 기본 사용법

```tsx
const [banner, setBanner] = useState<{ title: string; body: string } | null>(null);

// 이벤트 발생 시
setBanner({
  title: t('cellar.notify.banner.onTitle'),
  body: t('cellar.notify.banner.onBody'),
});

// JSX (화면 root View의 직접 자식으로)
<WineNotifyBanner
  visible={!!banner}
  title={banner?.title ?? ''}
  body={banner?.body ?? ''}
  onHide={() => setBanner(null)}
/>
```

## 시나리오별 활용

### 1. 알림 설정 ON (현재 사용처 — NotifyToggleCard)

```tsx
// ko: "알림 설정 완료" / "절정 시점에 알림을 보내드릴게요"
// en: "Reminder set" / "We'll let you know when this wine reaches peak."
setBanner({
  title: t('cellar.notify.banner.onTitle'),
  body: t('cellar.notify.banner.onBody'),
});
```

### 2. 알림 설정 OFF

```tsx
// ko: "알림이 해제되었습니다" / "이 와인의 절정 알림이 꺼졌어요"
// en: "Reminder removed" / "You won't receive peak alerts for this wine."
setBanner({
  title: t('cellar.notify.banner.offTitle'),
  body: t('cellar.notify.banner.offBody'),
});
```

### 3. 셀러 추가 확인 (확장 예시)

```tsx
setBanner({
  title: t('cellar.add.successTitle'),   // "셀러에 추가됐어요" / "Added to cellar"
  body: t('cellar.add.successBody'),     // "내 셀러에서 확인하세요" / "Check it in your cellar"
});
```

### 4. autoDismiss 시간 조절

```tsx
// 긴 메시지나 중요 알림 → 4초 유지
<WineNotifyBanner
  visible={!!banner}
  title={banner?.title ?? ''}
  body={banner?.body ?? ''}
  onHide={() => setBanner(null)}
  autoDismissMs={4000}
/>
```

### 5. 화면에서 마운트 위치
반드시 화면의 **root `<View>` 직접 자식**으로 배치 — `position: absolute, zIndex: 100`.
ScrollView 안에 넣으면 스크롤과 함께 내려가므로 안 됨.

```tsx
return (
  <View className="flex-1 bg-bg-deepest">
    <BackHeader ... />
    <ScrollView>
      {/* 콘텐츠 */}
    </ScrollView>
    <DrinkThisCta ... />
    <WineNotifyBanner ... />  {/* ← 반드시 이 레이어 */}
  </View>
);
```

## 애니메이션 스펙

| 단계 | translateY | opacity | 시간 | easing |
|------|-----------|---------|------|--------|
| 초기 (숨김) | -140 | 0 | — | — |
| 슬라이드인 | safeArea.top + 8 | 1 | 380ms | ease-out cubic |
| autoDismiss 대기 | — | — | autoDismissMs | — |
| 슬라이드아웃 | -140 | 0 | 260 / 180ms | ease-in cubic |

`useNativeDriver: true` — JS bridge 없이 네이티브 레이어에서 처리.

## 시각 스펙

| 요소 | 다크 모드 | 라이트 모드 |
|------|---------|-----------|
| 카드 배경 | `rgba(20,10,15,0.96)` | `rgba(248,244,236,0.96)` |
| 카드 border | `rgba(201,168,76,0.35)` gold | `rgba(201,168,76,0.45)` gold |
| 앱 레이블 | `brand.gold` | `#7A6320` (goldInk) |
| 제목 | `#F4EBD8` (cream) | `#1E1410` (ink) |
| 본문 | `rgba(244,235,216,0.72)` | `#7C6A5E` (inkMuted) |
| 로고 컨테이너 | `#0D0A0B` (항상 다크) | `#0D0A0B` (항상 다크) |

레이아웃:
- 카드: `borderRadius: 22`, `padding: 10 14 10 10`, `flexDirection: row`, `gap: 12`
- 로고 박스: 44×56, `borderRadius: 8`, `backgroundColor: #0D0A0B`
- 로고 이미지: 38×38, `resizeMode: contain`

## i18n 키

```
cellar.notify.banner.onTitle   — "알림 설정 완료" / "Reminder set"
cellar.notify.banner.onBody    — "절정 시점에 알림을 보내드릴게요" / "We'll let you know when this wine reaches peak."
cellar.notify.banner.offTitle  — "알림이 해제되었습니다" / "Reminder removed"
cellar.notify.banner.offBody   — "이 와인의 절정 알림이 꺼졌어요" / "You won't receive peak alerts for this wine."
```

## 주의사항

- `pointerEvents="none"` — 배너 영역이 아래 스크롤·버튼 이벤트를 가로채지 않음
- `onHide`는 슬라이드아웃 **애니메이션 종료 후** 호출 — 즉시 호출이 아님에 주의
- 동일 화면에서 여러 번 토글 시: `visible`이 이미 true인 상태에서 다시 true로 변경되면 새 애니메이션이 시작되지 않음. 일시적으로 false → true 순환이 필요할 경우 부모에서 처리 필요.
- 로고 이미지 경로: `@/assets/logo.png` (`src/assets/logo.png`)
