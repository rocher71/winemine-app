/**
 * Label scan — adapter swap 가능 인터페이스.
 *
 * v0.1.0 active: mock (Supabase Edge Function 호출, 고정 LWIN 반환).
 * v0.2.0 후보: gemini (Edge Function 내부에서 Gemini Vision) / on-device (TFLite).
 *
 * 사용 측은 어떤 adapter인지 몰라도 됨:
 *   const result = await scanLabel({ photo_url });
 */
import { mockAdapter } from './adapters/mock';

export interface LabelScanInput {
  photo_url?: string;
  image_base64?: string;
}

export interface LabelScanResult {
  lwin: string;
  confidence: number;
  candidate_lwins?: string[];
}

export interface LabelScanAdapter {
  scan(input: LabelScanInput): Promise<LabelScanResult>;
  readonly name: 'mock' | 'gemini' | 'on-device';
}

// 현재 활성 adapter — env로 swap 가능하게 v0.2.0에서 확장
const activeAdapter: LabelScanAdapter = mockAdapter;

export async function scanLabel(input: LabelScanInput): Promise<LabelScanResult> {
  if (!input.photo_url && !input.image_base64) {
    throw new Error('scanLabel: photo_url 또는 image_base64 둘 중 하나 필요');
  }
  return activeAdapter.scan(input);
}

export function getActiveAdapterName(): LabelScanAdapter['name'] {
  return activeAdapter.name;
}
