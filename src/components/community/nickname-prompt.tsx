/**
 * NicknamePrompt — 첫 발행 시 1회 닉네임 설정 모달 (2026-05-30 정체성 모델).
 *
 * 작성 콘텐츠는 회원 닉네임으로 표시되므로, 닉네임 미설정 사용자가 발행을 시도하면
 * 이 모달로 닉네임을 받는다. 저장 후 onSubmit(nickname) 으로 발행을 이어간다.
 *
 * **light-only mode** (§0-2). §4-11: Pressable 은 opacity-only, visual 은 inner View.
 */
import { useState } from 'react';
import { Modal, View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { brand, light, withAlpha } from '@/lib/design-tokens';

interface NicknamePromptProps {
  visible: boolean;
  onClose: () => void;
  /** 유효한 닉네임 입력 후 호출 — caller 가 저장 + 발행 진행. */
  onSubmit: (nickname: string) => void;
  submitting?: boolean;
}

export function NicknamePrompt({ visible, onClose, onSubmit, submitting }: NicknamePromptProps) {
  const { t } = useTranslation();
  const [value, setValue] = useState('');
  const trimmed = value.trim();
  const valid = trimmed.length >= 2 && trimmed.length <= 20;

  const handleSubmit = () => {
    if (!valid || submitting) return;
    Haptics.selectionAsync().catch(() => undefined);
    onSubmit(trimmed);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable
          onPress={onClose}
          style={{
            flex: 1,
            backgroundColor: withAlpha(brand.textInk, 0.45),
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 28,
          }}
        >
          {/* inner card — stopPropagation 효과: 카드 탭은 닫지 않음 */}
          <Pressable onPress={() => undefined} style={{ width: '100%' }}>
            <View
              style={{
                backgroundColor: light.bg.surface,
                borderRadius: 18,
                padding: 22,
                borderWidth: 1,
                borderColor: light.border.default,
              }}
            >
              <Text
                accessibilityRole="header"
                allowFontScaling={false}
                style={{
                  fontFamily: 'Freesentation_6SemiBold',
                  fontSize: 17,
                  color: light.text.primary,
                }}
              >
                {t('community.noteShare.nicknameTitle')}
              </Text>
              <Text
                allowFontScaling={false}
                style={{
                  marginTop: 6,
                  fontFamily: 'Freesentation_4Regular',
                  fontSize: 12.5,
                  lineHeight: 18,
                  color: light.text.muted,
                }}
              >
                {t('community.noteShare.nicknameDesc')}
              </Text>

              <View
                style={{
                  marginTop: 16,
                  height: 46,
                  borderRadius: 12,
                  backgroundColor: light.bg.deep,
                  borderWidth: 1,
                  borderColor: valid ? withAlpha(brand.wineRed, 0.5) : light.border.default,
                  paddingHorizontal: 14,
                  justifyContent: 'center',
                }}
              >
                <TextInput
                  value={value}
                  onChangeText={setValue}
                  placeholder={t('community.noteShare.nicknamePlaceholder')}
                  placeholderTextColor={light.text.muted}
                  autoFocus
                  autoCorrect={false}
                  maxLength={20}
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                  style={{
                    fontFamily: 'Freesentation_4Regular',
                    fontSize: 14,
                    color: light.text.primary,
                    padding: 0,
                  }}
                />
              </View>

              <Pressable
                onPress={handleSubmit}
                disabled={!valid || submitting}
                accessibilityRole="button"
                accessibilityLabel={t('community.noteShare.nicknameSave')}
                accessibilityState={{ disabled: !valid || submitting }}
                style={({ pressed }) => ({ marginTop: 16, opacity: !valid || submitting ? 0.4 : pressed ? 0.9 : 1 })}
              >
                <View
                  style={{
                    height: 46,
                    borderRadius: 12,
                    backgroundColor: brand.wineRed,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    allowFontScaling={false}
                    style={{
                      fontFamily: 'Freesentation_6SemiBold',
                      fontSize: 14,
                      color: brand.cream,
                    }}
                  >
                    {t('community.noteShare.nicknameSave')}
                  </Text>
                </View>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
