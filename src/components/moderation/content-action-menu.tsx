/**
 * ContentActionMenu — 콘텐츠 우상단 ... 메뉴 (M3 moderation 공용 컴포넌트).
 *
 * 사양: _workspace/design-specs/moderation-content-action-menu.md.
 *   - RN 에 web dropdown popover 없음 → @gorhom/bottom-sheet action sheet 채택 (기존 sheet 스택 일관).
 *   - 데이터 주도: 호출처가 actions 배열 주입 (owner/profile 분기를 메뉴 내부에 가두지 않음).
 *   - 흐름: ... 탭 → ActionMenuSheet open → 항목 탭 → onClose 후 action.onPress → 해당 시트/다이얼로그.
 *   - 파괴적 항목(report/block/delete)은 wineRed 색으로 구분 (RN destructive role 미지원 — §RN 제약 표).
 *   - light-only mode (§0-2): 모든 색 light.* / brand.* inline (BottomSheet 자식 §4-11 inline 우선).
 *
 * §4-11 Pressable 3-layer: ActionRow = hit target(Pressable) + visual(inner View) 분리.
 * 트리거(ActionMenuTrigger)는 별도 export — 호출처가 인라인 배치.
 */
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { View, Text, Pressable } from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import {
  Flag,
  Ban,
  UserCheck,
  Pencil,
  Trash2,
  MoreVertical,
  MoreHorizontal,
  type LucideIcon,
} from 'lucide-react-native';
import { brand, light } from '@/lib/design-tokens';

export type ActionKind = 'report' | 'block' | 'unblock' | 'edit' | 'delete';

export interface MenuAction {
  kind: ActionKind;
  /** report → ReportSheet open, block → BlockConfirmSheet open, edit → router.push, delete → ConfirmDialog. */
  onPress: () => void;
}

interface ContentActionMenuProps {
  open: boolean;
  actions: MenuAction[];
  onClose: () => void;
}

interface ActionMenuTriggerProps {
  onPress: () => void;
  /** 카드 우상단=vertical, 프로필 헤더=horizontal. */
  variant?: 'vertical' | 'horizontal';
  /** 트리거 아이콘 크기 (댓글 행은 작게 14). 기본 18. */
  size?: number;
  accessibilityLabel?: string;
}

// ---- 항목 메타: 아이콘 + tone (파괴적 여부) ----
const ICON_MAP: Record<ActionKind, LucideIcon> = {
  report: Flag,
  block: Ban,
  unblock: UserCheck,
  edit: Pencil,
  delete: Trash2,
};

const DESTRUCTIVE: Record<ActionKind, boolean> = {
  report: true,
  block: true,
  unblock: false,
  edit: false,
  delete: true,
};

const LABEL_KEY: Record<ActionKind, string> = {
  report: 'moderation.menu.report',
  block: 'moderation.menu.block',
  unblock: 'moderation.menu.unblock',
  edit: 'moderation.menu.edit',
  delete: 'moderation.menu.delete',
};

// ────────────────────────────────────────────────────────────────────────────
// Trigger (별도 export — 호출처가 인라인 배치)
// ────────────────────────────────────────────────────────────────────────────

export function ActionMenuTrigger({
  onPress,
  variant = 'vertical',
  size = 18,
  accessibilityLabel,
}: ActionMenuTriggerProps) {
  const { t } = useTranslation();
  const Icon = variant === 'horizontal' ? MoreHorizontal : MoreVertical;
  const handlePress = () => {
    Haptics.selectionAsync().catch(() => undefined);
    onPress();
  };
  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? t('moderation.menu.a11yTrigger')}
      hitSlop={8}
      style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
    >
      <View style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={size} strokeWidth={1.9} color={light.text.secondary} />
      </View>
    </Pressable>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Action menu sheet
// ────────────────────────────────────────────────────────────────────────────

export function ContentActionMenu({ open, actions, onClose }: ContentActionMenuProps) {
  const sheetRef = useRef<BottomSheet>(null);
  const insets = useSafeAreaInsets();

  // 동적 높이: 항목수 × 행높이(52) + handle/padding 여유. (사양 §RN 제약 — 동적 권장.)
  const snapPoints = useMemo(() => {
    const rows = Math.max(actions.length, 1);
    const h = rows * 52 + 64 + insets.bottom;
    return [h];
  }, [actions.length, insets.bottom]);

  useEffect(() => {
    if (open && actions.length > 0) {
      sheetRef.current?.expand();
    } else {
      sheetRef.current?.close();
    }
  }, [open, actions.length]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
        opacity={0.55}
      />
    ),
    [],
  );

  const handleItem = (action: MenuAction) => {
    Haptics.selectionAsync().catch(() => undefined);
    // 메뉴 close 후 다음 시트/다이얼로그 open — 부모가 onPress 안에서 state 토글.
    onClose();
    action.onPress();
  };

  // 빈 배열이면 시트 미노출 (안전망 — 사양 §empty).
  if (actions.length === 0) return null;

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      backgroundStyle={{ backgroundColor: light.bg.surface }}
      handleIndicatorStyle={{ backgroundColor: light.border.default, width: 44 }}
      backdropComponent={renderBackdrop}
    >
      <BottomSheetView
        style={{
          paddingHorizontal: 8,
          paddingTop: 4,
          paddingBottom: 16 + insets.bottom,
        }}
      >
        {actions.map((action) => (
          <ActionRow key={action.kind} action={action} onPress={() => handleItem(action)} />
        ))}
      </BottomSheetView>
    </BottomSheet>
  );
}

// ---- ActionRow (§4-11 2-layer: hit + visual) ----

function ActionRow({ action, onPress }: { action: MenuAction; onPress: () => void }) {
  const { t } = useTranslation();
  const Icon = ICON_MAP[action.kind];
  const destructive = DESTRUCTIVE[action.kind];
  const label = t(LABEL_KEY[action.kind]);
  const color = destructive ? brand.wineRed : light.text.primary;
  const iconColor = destructive ? brand.wineRed : light.text.secondary;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          paddingVertical: 14,
          paddingHorizontal: 14,
          borderRadius: 12,
        }}
      >
        <Icon size={18} strokeWidth={1.9} color={iconColor} />
        <Text
          allowFontScaling={false}
          style={{
            fontFamily: 'Freesentation_4Regular',
            fontSize: 15,
            color,
          }}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}
