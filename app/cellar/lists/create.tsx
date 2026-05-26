/**
 * /cellar/lists/create — 새 리스트 생성 모달.
 * modal presentation (Stack.Screen options={{ presentation: 'modal' }}).
 * 제목(필수) + 설명(선택) + 공개/비공개 토글.
 * 와인 추가는 v0.2.1 (search / 마셔본 목록) — 현재 빈 상태로 생성 후 상세 화면에서 추가.
 * 디자인 원본: wm-lists-screens.jsx ScreenListCreate.
 */
import { useState, useCallback } from 'react';
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
import { X, Lock, Globe, Search, Bookmark, GripVertical } from 'lucide-react-native';
import { brand, withAlpha } from '@/lib/design-tokens';
import { useThemeTokens } from '@/lib/use-theme-tokens';
import { AnimatedSwitch } from '@/components/shared/animated-switch';
import { Toast } from '@/components/shared/toast';
import { useCreateList, type ListVisibility } from '@/hooks/use-wine-lists';

export default function ListCreateScreen() {
  const { t } = useTranslation();
  const { bg, text, border } = useThemeTokens();
  const { create, isLoading } = useCreateList();
  const { prefillTitle, prefillLwins } = useLocalSearchParams<{
    prefillTitle?: string;
    prefillLwins?: string;
  }>();

  const [title, setTitle] = useState(prefillTitle ?? '');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [wines, setWines] = useState<string[]>(
    () => prefillLwins?.split(',').filter(Boolean) ?? [],
  );
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const removeWine = useCallback((lwin: string) => {
    setWines((prev) => prev.filter((w) => w !== lwin));
  }, []);

  const showComingSoon = useCallback(() => {
    setToastMsg(t('lists.create.v030Feature'));
  }, [t]);

  const canSubmit = title.trim().length > 0 && !isLoading;

  const handleCreate = useCallback(async () => {
    if (!canSubmit) return;
    try {
      const id = await create({
        title: title.trim(),
        description: description.trim() || null,
        visibility: isPublic ? 'public' : 'private',
      });
      setToastMsg(t('lists.create.success'));
      setTimeout(() => {
        router.replace(`/cellar/lists/${id}`);
      }, 600);
    } catch {
      setToastMsg(t('lists.create.error'));
    }
  }, [canSubmit, create, title, description, isPublic, t]);

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
              {t('lists.create.title')}
            </Text>
          </View>

          {/* Submit button */}
          <View>
            <Pressable
              onPress={handleCreate}
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
                {isLoading ? (
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
                    {t('lists.create.submit')}
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
            autoFocus
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
                : <Lock size={15} strokeWidth={1.9} color={text.secondary} />
              }
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

          {/* Wines section */}
          <View style={{ marginTop: 28 }}>
            {/* Section header */}
            <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
              <View style={{ flex: 1 }}>
                <Text
                  allowFontScaling={false}
                  style={{
                    fontFamily: 'Freesentation_6SemiBold',
                    fontSize: 10,
                    letterSpacing: 1.5,
                    color: text.muted,
                    textTransform: 'uppercase',
                  }}
                >
                  {t('lists.create.winesSection')}
                </Text>
                <Text
                  allowFontScaling={false}
                  style={{
                    fontFamily: 'Inter_500Medium',
                    fontSize: 13,
                    color: text.primary,
                    marginTop: 4,
                  }}
                >
                  {t('lists.create.addWinesTitle')}
                </Text>
              </View>
              <Text
                allowFontScaling={false}
                style={{
                  fontFamily: 'Inter_700Bold',
                  fontSize: 12,
                  color: brand.gold,
                }}
              >
                {`· ${wines.length}`}
              </Text>
            </View>

            {/* 2-column stub buttons */}
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
              {/* Search stub */}
              <View style={{ flex: 1 }}>
                <Pressable
                  onPress={showComingSoon}
                  style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
                  accessibilityRole="button"
                >
                  <View
                    style={{
                      paddingVertical: 14,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderStyle: 'dashed',
                      borderColor: withAlpha(brand.gold, 0.45),
                      alignItems: 'center',
                      flexDirection: 'row',
                      justifyContent: 'center',
                      gap: 6,
                    }}
                  >
                    <Search size={14} strokeWidth={1.9} color={text.muted} />
                    <Text
                      allowFontScaling={false}
                      style={{ fontFamily: 'Inter_500Medium', fontSize: 12, color: text.secondary }}
                    >
                      {t('lists.create.addBySearch')}
                    </Text>
                  </View>
                </Pressable>
              </View>

              {/* Tasted stub */}
              <View style={{ flex: 1 }}>
                <Pressable
                  onPress={showComingSoon}
                  style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
                  accessibilityRole="button"
                >
                  <View
                    style={{
                      paddingVertical: 14,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderStyle: 'dashed',
                      borderColor: withAlpha(brand.gold, 0.45),
                      alignItems: 'center',
                      flexDirection: 'row',
                      justifyContent: 'center',
                      gap: 6,
                    }}
                  >
                    <Bookmark size={14} strokeWidth={1.9} color={text.muted} />
                    <Text
                      allowFontScaling={false}
                      style={{ fontFamily: 'Inter_500Medium', fontSize: 12, color: text.secondary }}
                    >
                      {t('lists.create.addFromTasted')}
                    </Text>
                  </View>
                </Pressable>
              </View>
            </View>

            {/* Prefilled wine drag rows */}
            {wines.length > 0 && (
              <View style={{ marginTop: 10, gap: 6 }}>
                {wines.map((lwin) => (
                  <View
                    key={lwin}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 10,
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                      borderRadius: 10,
                      backgroundColor: bg.surface,
                      borderWidth: 1,
                      borderColor: border.default,
                    }}
                  >
                    <GripVertical size={14} strokeWidth={1.9} color={text.muted} />
                    <Text
                      allowFontScaling={false}
                      numberOfLines={1}
                      style={{ flex: 1, fontFamily: 'Inter_400Regular', fontSize: 12, color: text.secondary }}
                    >
                      {lwin}
                    </Text>
                    <Pressable
                      onPress={() => removeWine(lwin)}
                      style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                      accessibilityRole="button"
                      hitSlop={8}
                    >
                      <View
                        style={{
                          width: 24,
                          height: 24,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <X size={16} strokeWidth={2} color={text.muted} />
                      </View>
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
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
