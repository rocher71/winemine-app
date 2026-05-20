/**
 * ConfirmDialog — 커스텀 modal.
 *
 * 사양: design-spec cellar-detail.md §3-12.
 * 키스크린 원본: src/components/shared/confirm-dialog.tsx (109 LOC).
 *
 * 구조:
 *   Modal transparent backdrop (overlay.bgScrim alpha)
 *     dialog (mx 24, max-w 400, bg-surface border radius 16 padding 20)
 *       title (Playfair 22 cream)
 *       desc (Inter 14 secondary mt 8)
 *       actions (mt 16, flex-row gap 12)
 *         └── Cancel (PrimaryButton secondary md flex-1)
 *         └── Confirm (PrimaryButton primary md flex-1)
 *
 * Alert.alert를 RN 표준으로 쓸 수도 있지만 시각 일관성 위해 커스텀 (사양 §3-12 추천).
 */
import { Modal, View, Text, Pressable } from 'react-native';
import { PrimaryButton } from '@/components/shared/primary-button';
import { overlay } from '@/lib/design-tokens';
import { useThemeTokens } from '@/lib/use-theme-tokens';

interface Props {
  visible: boolean;
  title: string;
  description?: string | null;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  /** primary CTA tone — confirm 버튼이 destructive(wine-red) or primary 둘 다 wine-red 동일 */
  destructive?: boolean;
}

export function ConfirmDialog({
  visible,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: Props) {
  const { scheme } = useThemeTokens();
  const scrim = overlay.bgScrim[scheme];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <Pressable
        onPress={onCancel}
        accessibilityLabel={cancelLabel}
        accessibilityRole="button"
        style={{
          flex: 1,
          backgroundColor: scrim,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 24,
        }}
      >
        {/* dialog body — onPress 캡쳐 X (backdrop만 dismiss) */}
        <Pressable
          onPress={() => undefined}
          className="bg-surface dark:bg-surface border border-border-default"
          style={{
            maxWidth: 400,
            width: '100%',
            borderRadius: 16,
            padding: 20,
          }}
        >
          <Text
            accessibilityRole="header"
            className="font-playfair text-text-primary dark:text-text-primary"
            style={{ fontSize: 22, lineHeight: 26.4 }}
          >
            {title}
          </Text>
          {description ? (
            <Text
              className="font-inter text-text-secondary dark:text-text-secondary"
              style={{ fontSize: 14, lineHeight: 21, marginTop: 8 }}
            >
              {description}
            </Text>
          ) : null}
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
            <View style={{ flex: 1 }}>
              <PrimaryButton
                label={cancelLabel}
                size="md"
                variant="secondary"
                onPress={onCancel}
              />
            </View>
            <View style={{ flex: 1 }}>
              <PrimaryButton
                label={confirmLabel}
                size="md"
                variant="primary"
                onPress={onConfirm}
              />
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
