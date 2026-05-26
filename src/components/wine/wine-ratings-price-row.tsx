/**
 * WineRatingsAndPriceRow — ExternalRatingsCard + AveragePricePill 50-50 가로 나란히 컨테이너.
 *
 * 사양: wine-detail-light-mode-tasks.md T4.
 * Pressable 없음 — 단순 View 컴포넌트 (CLAUDE.md §4-11 3-layer 패턴 불필요).
 *
 * 부모(ScrollView)에서 mx-4 margin을 이 컴포넌트가 담당한다.
 * ExternalRatingsCard + AveragePricePill 은 외부 margin 없음.
 *
 * V2 업데이트 (wine-detail-v2-tasks.md T10):
 *   - ratings?, priceData? props 추가 → 각 자식에 전달
 */
import { View } from 'react-native';
import { ExternalRatingsCard } from './external-ratings-card';
import { AveragePricePill } from './average-price-pill';
import type { ExternalRatings, AveragePriceData } from '@/lib/types/wine-detail';

interface Props {
  ratings?: ExternalRatings;
  priceData?: AveragePriceData;
}

export function WineRatingsAndPriceRow({ ratings, priceData }: Props) {
  return (
    <View style={{ marginHorizontal: 16, flexDirection: 'row', gap: 8 }}>
      <View style={{ flex: 1 }}>
        <ExternalRatingsCard ratings={ratings} />
      </View>
      <View style={{ flex: 1 }}>
        <AveragePricePill priceData={priceData} />
      </View>
    </View>
  );
}
