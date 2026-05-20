/**
 * FavoriteToggle — BackHeader children slot에 들어가는 별 토글 버튼.
 *
 * 사양: wine-detail.md §3-1 — 32×32, Star 22 stroke 1.75. active gold fill, idle text-secondary.
 * Press → optimistic toggle + Toast.
 *
 * SCOPE-OUT 처리: wine_favorites 마이그레이션 부재 (사양 §9 P0 supabase-engineer 트리거 미완)
 * → 로컬 state만 토글. UI 시각은 verbatim. 데이터 저장 TODO 주석.
 * v0.2.0에서 wine_favorites 테이블 + supabase upsert/delete + rollback 패턴 적용.
 */
import { useState } from 'react';
import { Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useColorScheme } from 'react-native';
import { brand, dark, light } from '@/lib/design-tokens';

interface FavoriteToggleProps {
  // wine_lwin은 v0.2.0 supabase 연동 시 사용. 현재는 라벨 의미만.
  wineLwin: string;
  onToggle?: (next: boolean) => void;
}

export function FavoriteToggle({ onToggle }: FavoriteToggleProps) {
  const { t } = useTranslation();
  const scheme = useColorScheme();
  const idleColor = scheme === 'light' ? light.text.secondary : dark.text.secondary;
  const [active, setActive] = useState(false);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    const next = !active;
    setActive(next);
    onToggle?.(next);
    // TODO(v0.2.0): wine_favorites 테이블 마이그레이션 후
    //   - active=true:  supabase.from('wine_favorites').upsert({user_id, wine_lwin})
    //   - active=false: supabase.from('wine_favorites').delete().eq('wine_lwin', wineLwin)
    //   실패 시 rollback (setActive(!next)) + Toast(t('errors.generic'))
  };

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={
        active ? t('wineDetail.fav.remove') : t('wineDetail.fav.add')
      }
      className="w-8 h-8 items-center justify-center"
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
    >
      <Star
        size={22}
        strokeWidth={1.75}
        color={active ? brand.gold : idleColor}
        fill={active ? brand.gold : 'transparent'}
      />
    </Pressable>
  );
}
