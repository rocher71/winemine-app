import React, { useRef, useEffect, useState } from 'react';
import { View, Text, Pressable, Animated, LayoutChangeEvent } from 'react-native';
import { useColorScheme } from 'nativewind';
import { light, dark, brand, ivory } from '@/lib/design-tokens';
import { useTranslation } from 'react-i18next';

export type KnowledgeTab = 'lesson' | 'region' | 'winery' | 'vintage';

const TABS: KnowledgeTab[] = ['lesson', 'region', 'winery', 'vintage'];

interface KnowledgeTabBarProps {
  active: KnowledgeTab;
  onChange: (tab: KnowledgeTab) => void;
}

export function KnowledgeTabBar({ active, onChange }: KnowledgeTabBarProps) {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const tokens = isDark ? dark : light;

  const [containerWidth, setContainerWidth] = useState(0);
  const underlineX = useRef(new Animated.Value(0)).current;
  const activeIdx = TABS.indexOf(active);
  const tabWidth = containerWidth / 4;

  useEffect(() => {
    if (containerWidth === 0) return;
    Animated.timing(underlineX, {
      toValue: activeIdx * tabWidth,
      duration: 280,
      useNativeDriver: true,
    }).start();
  }, [activeIdx, tabWidth]);

  const bgColor = isDark ? dark.bg.deepest : ivory.bg.page1;
  const goldColor = isDark ? brand.gold : light.border.active;

  function onRowLayout(e: LayoutChangeEvent) {
    setContainerWidth(e.nativeEvent.layout.width);
  }

  return (
    <View
      style={{
        paddingTop: 4,
        paddingHorizontal: 20,
        borderBottomWidth: 0.5,
        borderBottomColor: tokens.border.default,
        backgroundColor: bgColor,
      }}
    >
      <View onLayout={onRowLayout} style={{ flexDirection: 'row', position: 'relative' }}>
        {TABS.map((tab) => {
          const isActive = tab === active;
          return (
            <View key={tab} style={{ flex: 1 }}>
              <Pressable
                onPress={() => onChange(tab)}
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
              >
                <View style={{ paddingTop: 12, paddingBottom: 14, alignItems: 'center' }}>
                  <Text
                    style={{
                      fontFamily: isActive ? 'Freesentation_6SemiBold' : 'Freesentation_5Medium',
                      fontSize: 14,
                      letterSpacing: -0.07,
                      color: isActive ? tokens.text.primary : tokens.text.muted,
                    }}
                  >
                    {t(`knowledge.tabs.${tab}`)}
                  </Text>
                </View>
              </Pressable>
            </View>
          );
        })}

        {/* Sliding gold underline (Animated.View translateX) */}
        {containerWidth > 0 && (
          <Animated.View
            style={{
              position: 'absolute',
              bottom: -0.5,
              left: 0,
              height: 2,
              width: tabWidth,
              borderRadius: 2,
              backgroundColor: goldColor,
              transform: [{ translateX: underlineX }],
            }}
          />
        )}
      </View>
    </View>
  );
}
