# PrimaryButton

앱 전체에서 사용하는 **공통 버튼 컴포넌트**. 4가지 variant + 3가지 size + disabled/loading 상태 지원.

## Props

| Prop | Type | Required | Default | 설명 |
|------|------|----------|---------|------|
| `label` | `string` | yes | — | 버튼 텍스트 |
| `onPress` | `() => void` | yes | — | 탭 콜백 |
| `size` | `'sm' \| 'md' \| 'lg'` | no | `'md'` | 버튼 높이 |
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'cellar'` | no | `'primary'` | 시각 스타일 |
| `disabled` | `boolean` | no | `false` | 비활성 상태 |
| `loading` | `boolean` | no | `false` | 로딩 상태 (ActivityIndicator 표시) |
| `accessibilityLabel` | `string` | no | `label` | 스크린 리더 레이블 |

## size 스펙

| size | height | paddingX | 텍스트 크기 |
|------|--------|----------|-----------|
| `sm` | 36px | 12px | 13px |
| `md` | 44px | 16px | 14px |
| `lg` | 48px | 20px | 15px |

## variant 스펙

| variant | 활성 배경 | 활성 텍스트 | 사용 상황 |
|---------|---------|-----------|---------|
| `primary` | `bg-wine-red` + border wine-red | cream | 주요 CTA (온보딩, 캡처 진행 등) |
| `secondary` | `bg-surface` + border gold | gold | 보조 액션 (편집, 돌아가기 등) |
| `ghost` | transparent | `text-text-primary` | 3순위 액션 (상태 전환 등) |
| `cellar` | transparent + border gold | gold | 캡처 화면 "셀러에 추가" 버튼 |

비활성(disabled/loading) 시 모든 variant: `bg-text-disabled` + `text-text-muted`.

## 언제 사용하는가

- 화면에서 **사용자가 수행해야 하는 주요 액션**이 있을 때
- EmptyState의 `action` prop으로 사용
- 바텀시트, 다이얼로그의 확인/취소 버튼

## 기본 사용법

```tsx
<PrimaryButton
  label="다음"
  onPress={() => router.push('/next')}
/>
```

## 시나리오별 활용

### 1. 온보딩 메인 CTA — primary lg

```tsx
<PrimaryButton
  label={t('onboarding.cta.start')}
  size="lg"
  variant="primary"
  onPress={() => router.push('/onboarding/step-2')}
/>
```

### 2. 편집/보조 액션 — secondary md

```tsx
<PrimaryButton
  label={t('cellar.detail.edit')}
  size="md"
  variant="secondary"
  onPress={() => setShowEdit(true)}
/>
```

### 3. 상태 전환 — ghost md

```tsx
<PrimaryButton
  label={item.status === 'cellared' ? '마심 처리' : '셀러로 복귀'}
  size="md"
  variant="ghost"
  loading={busy}
  onPress={onToggleStatus}
/>
```

### 4. 로딩 상태 — API 호출 중

```tsx
<PrimaryButton
  label="저장"
  size="md"
  onPress={onSave}
  loading={saving}
  disabled={saving}
/>
// loading=true → label 대신 ActivityIndicator 표시
// disabled=true → 중복 탭 방지
```

### 5. EmptyState 액션

```tsx
<EmptyState
  title="셀러가 비어있어요"
  action={
    <PrimaryButton
      label="와인 스캔하기"
      size="md"
      onPress={() => router.push('/(tabs)/capture')}
    />
  }
/>
```

### 6. 비활성 — 폼 유효성 미충족

```tsx
const isValid = name.trim().length > 0 && date.length > 0;

<PrimaryButton
  label="저장"
  size="lg"
  onPress={onSave}
  disabled={!isValid}
/>
// disabled: bg-text-disabled + text-text-muted (opacity 없음)
```

### 7. 풀 폭 버튼

```tsx
<View style={{ paddingHorizontal: 24 }}>
  <PrimaryButton label="완료" size="lg" onPress={onDone} />
</View>
// PrimaryButton 자체는 flex-row items-center justify-center
// 부모 View가 폭 제어
```

## 주의사항

- press: `transform scale(0.97)` — `Pressable style 함수` 사용 (§4-11: layout prop 없어서 안전)
- haptic: `impactAsync Light` 자동 실행 — disabled/loading 시 실행 안 됨
- `loading=true`이면 label 자리에 `ActivityIndicator` 렌더 — label이 숨겨짐
- `accessibilityLabel` 미지정 시 `label`이 스크린 리더 레이블로 사용됨
