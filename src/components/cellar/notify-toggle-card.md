# NotifyToggleCard

셀러 상세 **Section 3**: "절정 시점에 알림받기" 라벨 + `AnimatedSwitch` 토글 행.

토글 변경 시 하단 `Toast` 대신 **`WineNotifyBanner`** (상단 슬라이드인 카드)로 확인 피드백.  
→ 배너 스펙: [`src/components/shared/wine-notify-banner.md`](../shared/wine-notify-banner.md)

## Props

| Prop | Type | Required | Default | 설명 |
|------|------|----------|---------|------|
| `notify` | `boolean` | yes | — | 현재 알림 on/off 상태 |
| `onChange` | `(next: boolean) => void` | yes | — | 상태 변경 콜백 |

## 언제 사용하는가

- 셀러 상세 화면에서 DrinkWindowCard 아래에 항상 렌더
- 와인의 절정 시점 알림 구독/해제
- v0.1.0: UI만 구현 (실제 알림 전송 미구현). 상태 변경 시 Toast 피드백만.

## 기본 사용법

```tsx
const [notify, setNotify] = useState(false);

const handleNotifyChange = (next: boolean) => {
  setNotify(next);
  flashToast('success', next ? t('cellar.notify.toggledOn') : t('cellar.notify.toggledOff'));
};

<NotifyToggleCard notify={notify} onChange={handleNotifyChange} />
```

## 시나리오별 활용

### 1. 알림 OFF → ON

```tsx
// 토글 탭
// -> AnimatedSwitch gold 배경으로 애니메이션
// -> onChange(true) 호출
// -> 상위에서 "절정 알림이 설정되었습니다" Toast
```

### 2. 알림 ON → OFF

```tsx
// -> AnimatedSwitch border-default 배경으로 애니메이션
// -> onChange(false) 호출
// -> 상위에서 "절정 알림이 해제되었습니다" Toast
```

### 3. WineNotifyBanner 연동 패턴 (현재 구현)

토글 변경 시 하단 Toast 대신 상단 슬라이드인 배너로 확인.

```tsx
const [notifyBanner, setNotifyBanner] = useState<{ title: string; body: string } | null>(null);

<NotifyToggleCard
  notify={notify}
  onChange={(next) => {
    setNotify(next);
    setNotifyBanner({
      title: next ? t('cellar.notify.banner.onTitle') : t('cellar.notify.banner.offTitle'),
      body:  next ? t('cellar.notify.banner.onBody')  : t('cellar.notify.banner.offBody'),
    });
  }}
/>

{/* 화면 root View의 직접 자식으로 배치 */}
<WineNotifyBanner
  visible={!!notifyBanner}
  title={notifyBanner?.title ?? ''}
  body={notifyBanner?.body ?? ''}
  onHide={() => setNotifyBanner(null)}
/>
```

i18n 키:
- `cellar.notify.banner.onTitle` / `cellar.notify.banner.onBody`
- `cellar.notify.banner.offTitle` / `cellar.notify.banner.offBody`

### 4. 초기값 — 서버 상태 동기화 (v0.2.0 예정)
현재는 항상 `false`로 초기화. 추후 Supabase에서 사용자 알림 구독 상태를 fetch해서 초기값 설정.

```tsx
// v0.2.0
const { notifyEnabled } = useCellarNotification(item.id);
const [notify, setNotify] = useState(notifyEnabled ?? false);
```

## 내부 구성

```
View (mx-4, flex-row, justify-between, bg-surface, border, py:14, px:16, borderRadius:14)
  Text  "절정 시점에 알림받기" (Inter 13 medium, text-text-primary)
  AnimatedSwitch (shared/)  <- value=notify, onChange
```

## 시각 스펙

- 컨테이너: `paddingHorizontal: 16`, `paddingVertical: 14`, `borderRadius: 14`
- 라벨: `font-inter-medium` 13px, `text-text-primary`
- AnimatedSwitch: 44×26, gold(ON) / border-default(OFF)

## 주의사항

- Haptic(`selectionAsync`)은 `AnimatedSwitch` 내부에서 처리 — 별도 추가 불필요
- `onChange` 콜백은 상태만 받음 — Toast, API call은 모두 부모 책임
- i18n 키: `cellar.notify.label`, `cellar.notify.toggledOn`, `cellar.notify.toggledOff`, `cellar.notify.a11yHint`
