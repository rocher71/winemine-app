/**
 * ProcessingOverlay — live-camera stage 위에 떠 있는 분석 중 overlay.
 *
 * design-spec capture.md §3-10 + §10-2 권고: SimulatingView로 통일.
 * choose stage에서 갤러리 경로 → SimulatingView 단독 렌더 (overlay 아님).
 * live-camera에서 shutter 후에는 카메라 라이브뷰 가림용 fullscreen overlay → bg deepest + SimulatingView.
 */
import { View } from 'react-native';
import { SimulatingView } from './simulating-view';

interface ProcessingOverlayProps {
  source: 'scan' | 'gallery';
  message: string;
}

export function ProcessingOverlay({ source, message }: ProcessingOverlayProps) {
  return (
    <View
      className="absolute inset-0 items-center justify-start bg-bg-deepest dark:bg-bg-deepest"
      accessibilityViewIsModal
    >
      <SimulatingView source={source} message={message} />
    </View>
  );
}
