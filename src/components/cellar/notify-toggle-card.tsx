/**
 * NotifyToggleCard — Section 3: "절정 시점에 알림받기" + AnimatedSwitch.
 *
 * 사양: design-spec cellar-detail.md §2 line 101~112, §3-5.
 * 키스크린 원본: src/app/cellar/[id]/page.tsx line 178~240 verbatim.
 *
 * 구조:
 *   outer (mx-4 rounded-[14px] bg-surface border padding 14 16, flex-row items-center justify-between)
 *     Label (Inter 13 500 primary)
 *     AnimatedSwitch (44×26 — shared/animated-switch)
 *
 * 토글 변경 시 onChange → 상위에서 Toast (cellar.notify.{toggledOn,toggledOff}) 처리.
 */
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AnimatedSwitch } from '@/components/shared/animated-switch';

interface Props {
  notify: boolean;
  onChange: (next: boolean) => void;
}

export function NotifyToggleCard({ notify, onChange }: Props) {
  const { t } = useTranslation();
  return (
    <View
      className="mx-4 flex-row items-center justify-between bg-surface dark:bg-surface border border-border-default"
      style={{ paddingHorizontal: 16, paddingVertical: 14, borderRadius: 14 }}
    >
      <Text
        className="font-inter-medium text-text-primary dark:text-text-primary"
        style={{ fontSize: 13, lineHeight: 15.6 }}
        numberOfLines={1}
      >
        {t('cellar.notify.label')}
      </Text>
      <AnimatedSwitch
        value={notify}
        onChange={onChange}
        accessibilityLabel={t('cellar.notify.label')}
        accessibilityHint={t('cellar.notify.a11yHint')}
      />
    </View>
  );
}
