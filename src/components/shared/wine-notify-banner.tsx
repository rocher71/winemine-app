/**
 * WineNotifyBanner — 화면 상단 슬라이드인 알림 확인 배너 (Variant C · 라벨 카드).
 *
 * 좌측 logo.png 썸네일 + 우측 텍스트 컬럼 구조.
 * visible=true 시 safe area 아래로 슬라이드 인, autoDismissMs 후 슬라이드 아웃.
 *
 * 사용 사례:
 *   - NotifyToggleCard 토글 확인 (알림 설정/해제)
 *   - 향후 모든 in-app 알림 확인 배너 (셀러 추가, 노트 저장 등)
 */
import {useEffect, useRef} from 'react';
import {View, Text, Image, Animated, Easing} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {brand} from '@/lib/design-tokens';
import {useThemeTokens} from '@/lib/use-theme-tokens';

// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
const LOGO = require('@/assets/logo.png');

interface WineNotifyBannerProps {
  /** 배너 표시 여부 — true로 변경 시 슬라이드 인 + autoDismiss 타이머 시작 */
  visible: boolean;
  /** 굵은 제목 텍스트 (e.g. "알림 설정 완료") */
  title: string;
  /** 보조 설명 텍스트 (최대 2줄) */
  body: string;
  /** 슬라이드 아웃 애니메이션 종료 후 호출 — 부모에서 visible 상태 초기화용 */
  onHide?: () => void;
  /** 자동 닫힘 딜레이 ms (기본 2500) */
  autoDismissMs?: number;
}

export function WineNotifyBanner({
  visible,
  title,
  body,
  onHide,
  autoDismissMs = 2500,
}: WineNotifyBannerProps) {
  const insets = useSafeAreaInsets();
  const {scheme} = useThemeTokens();
  const translateY = useRef(new Animated.Value(-140)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onHideRef = useRef(onHide);
  onHideRef.current = onHide;

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: insets.top + 8,
          duration: 380,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        timerRef.current = setTimeout(() => {
          Animated.parallel([
            Animated.timing(translateY, {
              toValue: -140,
              duration: 260,
              easing: Easing.in(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 180,
              useNativeDriver: true,
            }),
          ]).start(({finished}) => {
            if (finished) onHideRef.current?.();
          });
        }, autoDismissMs);
      });
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visible, insets.top, autoDismissMs, translateY, opacity]);

  const isDark = scheme === 'dark';

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 0,
        left: 10,
        right: 10,
        zIndex: 100,
        transform: [{translateY}],
        opacity,
      }}
    >
      <View
        style={{
          borderRadius: 22,
          backgroundColor: isDark ? 'rgba(20,10,15,0.96)' : 'rgba(248,244,236,0.96)',
          borderWidth: 1,
          borderColor: isDark ? 'rgba(201,168,76,0.35)' : 'rgba(201,168,76,0.45)',
          padding: 10,
          paddingRight: 14,
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: 12,
          shadowColor: '#1E1410',
          shadowOffset: {width: 0, height: 8},
          shadowOpacity: isDark ? 0.32 : 0.16,
          shadowRadius: 20,
          elevation: 10,
        }}
      >
        {/* 좌측: winemine 로고 썸네일 */}
        <View
          style={{
            width: 44,
            height: 56,
            borderRadius: 8,
            backgroundColor: '#0D0A0B',
            flexShrink: 0,
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <Image
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            source={LOGO}
            style={{width: 38, height: 38}}
            resizeMode="contain"
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          />
        </View>

        {/* 우측: 텍스트 컬럼 */}
        <View
          style={{flex: 1, minWidth: 0, paddingVertical: 2, justifyContent: 'center'}}
        >
          {/* 앱 레이블 + now */}
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
            <Text
              allowFontScaling={false}
              style={{
                fontFamily: 'Freesentation_7Bold',
                fontSize: 10,
                color: isDark ? brand.gold : '#7A6320',
                letterSpacing: 1.4,
                textTransform: 'uppercase',
              }}
            >
              winemine
            </Text>
            <View
              style={{
                width: 3,
                height: 3,
                borderRadius: 9999,
                backgroundColor: isDark ? 'rgba(244,235,216,0.4)' : '#A89A8A',
              }}
            />
            <Text
              allowFontScaling={false}
              style={{
                fontFamily: 'Freesentation_4Regular',
                fontSize: 11,
                color: isDark ? 'rgba(244,235,216,0.55)' : '#A89A8A',
              }}
            >
              now
            </Text>
          </View>

          {/* 제목 */}
          <Text
            allowFontScaling={false}
            style={{
              fontFamily: 'Freesentation_6SemiBold',
              fontSize: 14,
              color: isDark ? '#F4EBD8' : '#1E1410',
              marginTop: 3,
              letterSpacing: -0.2,
              lineHeight: 16.8,
            }}
            numberOfLines={1}
          >
            {title}
          </Text>

          {/* 본문 */}
          <Text
            allowFontScaling={false}
            style={{
              fontFamily: 'Freesentation_4Regular',
              fontSize: 12,
              color: isDark ? 'rgba(244,235,216,0.72)' : '#7C6A5E',
              marginTop: 2,
              lineHeight: 16.2,
            }}
            numberOfLines={2}
          >
            {body}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}
