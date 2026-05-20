# label-scan

라벨 인식 swap 가능 인터페이스. 사용 측은 `scanLabel(input)` 만 호출하고 adapter 구현체는 모름.

## 활성 adapter (v0.1.0)

`mock` — Supabase Edge Function `label-scan` 호출. Edge Function이 고정 LWIN을 반환한다.

## v0.2.0 후보

| adapter | 위치 | 동작 |
|---|---|---|
| `gemini` | Edge Function 내부에서 GOOGLE_GENAI_API_KEY로 Gemini Vision REST 호출 | 정확도 우선, 비용 발생 |
| `on-device` | 클라이언트 react-native-fast-tflite + 와인 라벨 모델 | 오프라인 동작, 정확도/모델 크기 트레이드오프 |

선택은 v0.2.0 PoC 결과에 따른다. 현재는 stub.

## adapter 교체 방법

`src/lib/label-scan/index.ts` 의 `activeAdapter` 상수를 다른 import로 교체하면 됨. 시그니처는 모두 `LabelScanAdapter` 인터페이스를 따른다.
