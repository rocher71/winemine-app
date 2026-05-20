/**
 * Gemini adapter — v0.2.0 stub.
 * Edge Function 내부에서 GOOGLE_GENAI_API_KEY로 Gemini Vision 호출 예정.
 */
import type { LabelScanAdapter, LabelScanInput, LabelScanResult } from '../index';

export const geminiAdapter: LabelScanAdapter = {
  name: 'gemini',
  async scan(_input: LabelScanInput): Promise<LabelScanResult> {
    throw new Error('NotImplemented: Gemini adapter는 v0.2.0에서 활성됩니다');
  },
};
