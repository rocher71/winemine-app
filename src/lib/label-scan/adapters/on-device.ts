/**
 * On-device adapter — v0.2.0 후보 stub.
 * react-native-fast-tflite + 와인 라벨 모델로 오프라인 인식 검토.
 */
import type { LabelScanAdapter, LabelScanInput, LabelScanResult } from '../index';

export const onDeviceAdapter: LabelScanAdapter = {
  name: 'on-device',
  async scan(_input: LabelScanInput): Promise<LabelScanResult> {
    throw new Error('NotImplemented: on-device adapter는 v0.2.0+ 검토 중입니다');
  },
};
