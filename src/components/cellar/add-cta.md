# AddCta

셀러 TitleBar 오른쪽의 **"+ 등록" 버튼**. 새 와인을 셀러에 추가하는 진입점.

## Props

| Prop | Type | Required | Default | 설명 |
|------|------|----------|---------|------|
| `onPress` | `() => void` | yes | — | 버튼 탭 콜백 |

## 언제 사용하는가

- 셀러 탭이 활성화된 상태에서 상단 TitleBar 우측에 배치
- **tasted 탭**에서는 렌더하지 않음 (마신 와인에서 추가 등록 불필요)

## 기본 사용법

```tsx
// v0.1.0: 탭 시 toast 표시
const [toastMsg, setToastMsg] = useState<string | null>(null);

const onAdd = () => {
  setToastMsg(t('cellar.addToast'));
  setTimeout(() => setToastMsg(null), 2500);
};

<AddCta onPress={onAdd} />
```

## 시나리오별 활용

### 1. v0.1.0 — Toast 피드백 (현재)
바텀시트 미구현 단계에서 "곧 추가 예정" 안내 toast 표시.

```tsx
<AddCta onPress={() => {
  setToastMsg(t('cellar.addToast'));
  setTimeout(() => setToastMsg(null), 2500);
}} />
```

### 2. v0.2.0 — AddToCellarSheet open
와인 검색 → 수량/구매정보 입력 바텀시트를 열 때.

```tsx
<AddCta onPress={() => setShowAddSheet(true)} />
// ...
<AddToCellarSheet visible={showAddSheet} mode="add" onClose={() => setShowAddSheet(false)} />
```

### 3. 탭 조건부 렌더
tasted 탭에서는 숨겨야 함.

```tsx
{tab === 'cellar' && <AddCta onPress={onAdd} />}
```

## 시각 스펙

- `Plus` 아이콘 14px, `brand.gold`
- 텍스트: `Freesentation_4Regular` 12px, `brand.gold`
- 컨테이너: `borderWidth: 1`, `borderColor: border.default`, `borderRadius: 10`, `paddingHorizontal: 10`, `paddingVertical: 6`
- press: opacity 0.7

## 주의사항

- 탭 시 `Haptics.selectionAsync()` 자동 실행
- 버튼 자체는 toast/sheet 로직을 모름 — 부모가 `onPress`에서 처리
