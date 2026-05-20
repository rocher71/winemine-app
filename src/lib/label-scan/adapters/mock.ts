/**
 * Mock adapter — Supabase Edge Function `label-scan` 호출.
 * Edge Function이 mock 응답(고정 LWIN)을 반환. 클라이언트는 그대로 사용.
 */
import { supabase } from '../../supabase';
import type { LabelScanAdapter, LabelScanInput, LabelScanResult } from '../index';

export const mockAdapter: LabelScanAdapter = {
  name: 'mock',
  async scan(input: LabelScanInput): Promise<LabelScanResult> {
    const { data, error } = await supabase.functions.invoke<LabelScanResult>('label-scan', {
      body: input,
    });
    if (error) throw error;
    if (!data) throw new Error('label-scan: empty response');
    return data;
  },
};
