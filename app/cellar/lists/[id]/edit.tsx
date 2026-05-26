/**
 * /cellar/lists/[id]/edit — 리스트 수정 모달.
 * modal presentation (Stack.Screen options={{ presentation: 'modal' }}).
 * create.tsx 레이아웃 미러 — 제목(필수) + 설명(선택) + 공개/비공개 토글.
 * 기존 리스트 데이터를 useListDetail 로 prefill, useUpdateList 로 저장.
 * 디자인 원본: wm-lists-screens.jsx ScreenListCreate (수정 variant).
 */
import { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { X, Lock, Globe } from 'lucide-react-native';
import { brand } from '@/lib/design-tokens';
import { useThemeTokens } from '@/lib/use-theme-tokens';
import { AnimatedSwitch } from '@/components/shared/animated-switch';
import { Toast } from '@/components/shared/toast';
import { useListDetail, useUpdateList } from '@/hooks/use-wine-lists';

export default function ListEditScreen() {
  const { t } = useTranslation();
  const { bg, text, border } = useThemeTokens();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { list, isLoading: detailLoading } = useListDetail(id ?? '');
  const { update, isLoading: saving } = useUpdateList();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [prefilled, setPrefilled] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // 기존 리스트 데이터 prefill (최초 1회).
  useEffect(() => {
    if (list && !prefilled) {
      setTitle(list.title);
      setDescription(list.description ?? '');
      setIsPublic(list.visibility === 'public');
      setPrefilled(true);
    }
  }, [list, prefilled]);

  const canSubmit = title.trim().length > 0 && !saving;

  const handleSave = useCallback(async () => {
    if (!canSubmit || !id) return;
    try {
      await update(id, {
        title: title.trim(),
        description: description.trim() || null,
        visibility: isPublic ? 'public' : 'private',
      });
      router.back();
    } catch {
      setToastMsg(t('lists.create.error'));
    }
  }, [canSubmit, id, update, title, description, isPublic, t]);

  if (detailLoading && !prefilled) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: bg.deepest, alignItems: 'center', justifyContent: 'center' }}
      >
        <ActivityIndicator color={brand.gold} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg.deepest }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Top bar */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderBottomWidth: 0.5,
            borderBottomColor: border.default,
          }}
        >
          {/* Close */}
          <View>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              accessibilityRole="button"
              hitSlop={8}
            >
              <View
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  backgroundColor: bg.surface,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={20} strokeWidth={2.2} color={text.primary} />
              </View>
            </Pressable>
          </View>

          {/* Title */}
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text
              allowFontScaling={false}
              style={{
                fontFamily: 'Inter_700Bold',
                fontSize: 15,
                color: text.primary,
                letterSpacing: -0.2,
              }}
            >
              {t('lists.edit.title')}
            </Text>
          </View>

          {/* Save button */}
          <View>
            <Pressable
              onPress={handleSave}
              disabled={!canSubmit}
              style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
              accessibilityRole="button"
            >
              <View
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 20,
                  backgroundColor: canSubmit ? brand.wineRed : bg.surface,
                  borderWidth: canSubmit ? 0 : 1,
                  borderColor: border.default,
                  shadowColor: canSubmit ? brand.wineRed : 'transparent',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.4,
                  shadowRadius: 8,
                  elevation: canSubmit ? 3 : 0,
                }}
              >
                {saving ? (
                  <ActivityIndicator size="small" color={brand.cream} />
                ) : (
                  <Text
                    allowFontScaling={false}
                    style={{
                      fontFamily: 'Inter_700Bold',
                      fontSize: 13,
                      color: canSubmit ? brand.cream : text.disabled,
                    }}
                  >
                    {t('lists.edit.save')}
                  </Text>
                )}
              </View>
            </Pressable>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 24, paddingBottom: 48 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Title input */}
          <TextInput
            value={title}
            onChangeText={(v) => setTitle(v.slice(0, 50))}
            placeholder={t('lists.create.titlePlaceholder')}
            placeholderTextColor={text.disabled}
            maxLength={50}
            returnKeyType="next"
            style={{
              fontFamily: 'PlayfairDisplay_600SemiBold',
              fontStyle: 'italic',
              fontSize: 28,
              color: text.primary,
              letterSpacing: -0.5,
              lineHeight: 34,
              paddingBottom: 6,
              borderBottomWidth: 1,
              borderBottomColor: brand.gold,
            }}
          />
          <Text
            allowFontScaling={false}
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 10.5,
              color: text.muted,
              marginTop: 4,
              letterSpacing: 0.3,
            }}
          >
            {t('lists.create.titleHint')}
          </Text>

          {/* Description input */}
          <TextInput
            value={description}
            onChangeText={(v) => setDescription(v.slice(0, 200))}
            placeholder={t('lists.create.descPlaceholder')}
            placeholderTextColor={text.disabled}
            maxLength={200}
            multiline
            numberOfLines={3}
            style={{
              marginTop: 18,
              fontFamily: 'Inter_400Regular',
              fontSize: 13.5,
              color: text.primary,
              lineHeight: 21.6,
              paddingVertical: 12,
              borderTopWidth: 0,
              borderBottomWidth: 0,
              minHeight: 56,
            }}
          />
          <Text
            allowFontScaling={false}
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 10.5,
              color: text.muted,
              letterSpacing: 0.3,
              marginTop: -4,
            }}
          >
            {t('lists.create.descHint')}
          </Text>

          {/* Visibility toggle row */}
          <View
            style={{
              marginTop: 24,
              padding: 14,
              borderRadius: 14,
              backgroundColor: bg.surface,
              borderWidth: 1,
              borderColor: border.default,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: bg.deep,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isPublic
                ? <Globe size={15} strokeWidth={1.9} color={brand.goldSoft} />
                : <Lock size={15} strokeWidth={1.9} color={text.secondary} />}
            </View>

            <View style={{ flex: 1 }}>
              <Text
                allowFontScaling={false}
                style={{
                  fontFamily: 'Inter_700Bold',
                  fontSize: 13.5,
                  color: text.primary,
                  letterSpacing: -0.1,
                }}
              >
                {isPublic ? t('lists.visibility.public') : t('lists.visibility.private')}
              </Text>
              <Text
                allowFontScaling={false}
                style={{
                  fontFamily: 'Inter_400Regular',
                  fontSize: 11,
                  color: text.muted,
                  marginTop: 1,
                }}
              >
                {isPublic ? t('lists.visibility.publicSub') : t('lists.visibility.privateSub')}
              </Text>
            </View>

            <AnimatedSwitch
              value={isPublic}
              onChange={setIsPublic}
              accessibilityLabel={t('lists.visibility.public')}
            />
          </View>
        </ScrollView>

        {/* Toast */}
        {!!toastMsg && (
          <View style={{ position: 'absolute', bottom: 32, left: 16, right: 16 }}>
            <Toast message={toastMsg} />
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
