/**
 * EmptyState — 데이터 없음 / 오류 상태 공통 레이아웃.
 *
 * 구조: illustration? → title → description? → action?
 * 중앙 정렬, flex-1 (부모가 남은 공간 채움).
 *
 * 사용 사례:
 *   - 셀러 비어있음 (GlassWater 56 gold + PrimaryButton → /capture)
 *   - 셀러 상세 미발견 (AlertCircle 48 gold + PrimaryButton back)
 *   - tasted 탭 비어있음
 *   - 노트 목록 비어있음
 */
import { View, Text } from 'react-native';
import { type ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  /** 상단 일러스트 (lucide icon 등) — cellar empty에서 GlassWater 56 strokeWidth 1.25 gold */
  illustration?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ title, description, illustration, action }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-6" accessibilityRole="text">
      {illustration ? <View style={{ marginBottom: 16 }}>{illustration}</View> : null}
      <Text className="font-playfair text-empty-title text-text-primary dark:text-text-primary text-center">
        {title}
      </Text>
      {description ? (
        <Text className="font-inter text-card-body text-text-muted mt-3 text-center">
          {description}
        </Text>
      ) : null}
      {action ? <View className="mt-6">{action}</View> : null}
    </View>
  );
}
