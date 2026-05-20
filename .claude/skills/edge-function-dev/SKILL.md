---
name: edge-function-dev
description: "winemine Supabase Edge Functions 작성 가이드. label-scan mock adapter 작성, Gemini/on-device adapter swap 가능한 interface 패턴, Deno 표준 라이브러리 사용, verify_jwt 처리, 200 LOC 한계(Plan D 제약) 준수. Edge Function 작성, label-scan 구현, Deno deploy 요청 시 사용."
---

# Edge Function Dev — winemine Deno + Supabase Edge Runtime

이 스킬은 supabase-engineer가 winemine의 Edge Function을 작성할 때 따르는 절차다. v0.1.0에서는 `label-scan` 1개만 작성.

## Plan D 제약 (CRITICAL)

- **Edge Function 코드량 < 200 LOC** — 비대화 방지. 200 LOC 넘으면 비즈니스 로직이 들어간 것 → SQL 함수로 이전 검토.
- **외부 API wrapper만** — 라벨 인식(Gemini), 익명화(v0.2.0 anonymize-id) 같은 외부 호출만. 도메인 로직 (XP 계산, drink-window 등)은 SQL 함수로.
- 6개월 후 Spring 전환 시 Edge Function = Java 재작성 비용. 작을수록 좋다.

## label-scan 인터페이스 (필수 호환)

클라이언트 호출은 다음 시그니처로 고정:

```ts
// 입력
type LabelScanInput = {
  photo_url?: string;       // Supabase Storage label-photos/{uid}/{uuid}.jpg
  image_base64?: string;    // 또는 base64 (on-device 사전 압축 시)
};

// 출력
type LabelScanResult = {
  lwin: string;             // 7/11/13 자리 숫자 문자열
  confidence: number;       // 0~1
  candidate_lwins?: string[]; // 신뢰도 낮을 때 후보
};
```

이 shape이 변하면 RN 측 `src/lib/label-scan/adapters/mock.ts`와 Edge Function 호출자 모두 깨짐 — 변경 시 양쪽 동시 업데이트 (qa-inspector 검증 대상).

## v0.1.0 mock 구현

```ts
// supabase/functions/label-scan/index.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

// 실제 DB에서 SELECT lwin FROM wines LIMIT 1로 확인한 인기 LWIN 사용
const MOCK_LWIN = "1012345"; // TODO: 실제 존재하는 LWIN으로 교체

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }
  // verify_jwt: true는 supabase config.toml에서 설정되어 자동 검증됨
  // 익명 세션도 통과
  const body = await req.json().catch(() => ({}));
  // v0.1.0: 입력 무시하고 고정 응답
  return new Response(
    JSON.stringify({ lwin: MOCK_LWIN, confidence: 0.92 }),
    { headers: { "Content-Type": "application/json" } }
  );
});
```

## v0.2.0 swap 대비 — adapter 패턴

```ts
// supabase/functions/label-scan/adapters.ts (v0.2.0 추가)
export interface ScanAdapter {
  scan(input: LabelScanInput): Promise<LabelScanResult>;
}

export class MockAdapter implements ScanAdapter {
  async scan(_: LabelScanInput) {
    return { lwin: "1012345", confidence: 0.92 };
  }
}

export class GeminiAdapter implements ScanAdapter {
  // GOOGLE_GENAI_API_KEY로 Gemini Vision 호출
  // 응답 텍스트에서 LWIN 추론 → confidence 계산
  async scan(input: LabelScanInput): Promise<LabelScanResult> {
    throw new Error("v0.2.0 TODO");
  }
}

// 환경변수로 어댑터 선택
const adapter = Deno.env.get("LABEL_SCAN_ADAPTER") === "gemini"
  ? new GeminiAdapter()
  : new MockAdapter();
```

v0.1.0은 adapter 분리 강제하지 않음 (over-engineering). interface만 RN 측에 동일 시그니처로 두면 충분. v0.2.0 진입 시 위 구조로 리팩토링.

## verify_jwt 설정

`supabase/config.toml`:
```toml
[functions.label-scan]
verify_jwt = true  # 익명 세션 JWT도 통과
```

기본값. 명시적으로 두는 게 안전.

## 배포

```bash
supabase functions deploy label-scan --linked
# 검증
curl -X POST https://{ref}.supabase.co/functions/v1/label-scan \
  -H "Authorization: Bearer {anon_key}" \
  -H "Content-Type: application/json" \
  -d '{}'
# 응답: { "lwin": "1012345", "confidence": 0.92 }
```

## 절대 금지

- 비즈니스 로직 (XP 계산 등) Edge Function에 작성 → SQL 함수로
- Edge Function에서 service_role key 사용 시 클라이언트 입력 검증 없이 RLS 우회 → 명시적 user_id 검증 없으면 사용 금지
- Edge Function > 200 LOC
- emoji
- console.log에 사용자 UUID 직접 출력 → 익명화 후 출력

## 자세한 reference

스펙: `docs/spec/v0.1.0.md`의 `<route_definitions>.<edge_functions>`, `<core_functionality>.<label_scan_flow>`
