# AnimatedSwitch

**44×26 커스텀 토글 스위치**. ON/OFF 전환 시 knob 슬라이드 + track 배경색 애니메이션 (200ms ease-out).

## Props

| Prop | Type | Required | Default | 설명 |
|------|------|----------|---------|------|
| `value` | `boolean` | yes | — | 현재 on/off 상태 |
| `onChange` | `(next: boolean) => void` | yes | — | 상태 변경 콜백 (내부에서 haptic 포함) |
| `accessibilityLabel` | `string` | no | `undefined` | `role="switch"` 접근성 레이블 |
| `accessibilityHint` | `string` | no | `undefined` | 접근성 힌트 |
| `hitSlop` | `number` | no | `8` | 탭 영역 확장 (px) |

## 언제 사용하는가

- 이진(on/off) 상태 전환이 필요한 **모든 토글 행**에서 사용
- 현재 사용처: `NotifyToggleCard`
- 예상 확장 사용처:
  - 설정 화면 — 다크 모드 토글, 알림 허용, 데이터 동기화 등
  - 필터 화면 — 특정 조건 on/off
  - 온보딩 — 선호도 설정

## 기본 사용법

```tsx
const [enabled, setEnabled] = useState(false);

<AnimatedSwitch
  value={enabled}
  onChange={setEnabled}
  accessibilityLabel="다크 모드"
/>
```

## 시나리오별 활용

### 1. 라벨과 함께 행 구성 (NotifyToggleCard 패턴)

```tsx
<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
  <Text style={{ fontSize: 13 }}>알림 받기</Text>
  <AnimatedSwitch
    value={notify}
    onChange={setNotify}
    accessibilityLabel="알림 받기"
    accessibilityHint="절정 시점에 알림을 받으려면 활성화하세요"
  />
</View>
```

### 2. 설정 화면 토글 목록

```tsx
{SETTINGS.map((s) => (
  <View key={s.key} style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 16 }}>
    <Text>{s.label}</Text>
    <AnimatedSwitch value={settings[s.key]} onChange={(v) => updateSetting(s.key, v)} />
  </View>
))}
```

### 3. 초기값 서버 동기화

```tsx
const { data } = useUserPreferences();
const [value, setValue] = useState(data?.notifications ?? false);

// data 로드 후 초기값 반영
useEffect(() => {
  if (data) setValue(data.notifications);
}, [data]);

<AnimatedSwitch value={value} onChange={setValue} />
```

### 4. hitSlop 확장 — 좁은 레이아웃

```tsx
// 기본 8px보다 더 넓은 탭 영역이 필요할 때
<AnimatedSwitch value={v} onChange={onChange} hitSlop={16} />
```

### 5. 상태 변경 후 API 연동

```tsx
const handleChange = async (next: boolean) => {
  setValue(next); // 낙관적 업데이트
  try {
    await updatePreference('notifications', next);
  } catch {
    setValue(!next); // 실패 시 롤백
    flashToast('error', '설정 저장 실패');
  }
};

<AnimatedSwitch value={value} onChange={handleChange} />
```

## 애니메이션 스펙

| 요소 | OFF | ON | 전환 시간 |
|------|-----|-------|---------|
| knob 위치 (`left`) | 3px | 21px | 200ms ease-out |
| track 배경 | `border.default` | `brand.gold` | 200ms ease-out |

track: width 44, height 26, borderRadius 13.  
knob: width 20, height 20, borderRadius 10, `brand.cream`.

## 주의사항

- 탭 시 `Haptics.selectionAsync()` 자동 실행 — 부모에서 별도 haptic 추가 불필요
- `Animated.Value`는 `value` prop 변경 시 `useEffect`로 동기화 — 외부에서 `value`를 바꾸면 애니메이션 자동 실행
- `useNativeDriver: false` — 배경색 애니메이션은 JS 드라이버 필요 (interpolate 사용)
