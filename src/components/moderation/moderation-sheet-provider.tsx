/**
 * ModerationSheetProvider — 신고/차단 시트를 앱 루트(네비게이터 위)에 호스팅.
 *
 * 배경: 이 스택(RN 0.81 Fabric + Reanimated 4)에서 @gorhom BottomSheetModal(포털)이
 *   동작하지 않아, plain BottomSheet 를 루트 레이아웃에 올려 전체 오버레이를 구현한다.
 *   화면 안에서 시트를 렌더하면 헤더/FAB(zIndex) 와 탭바(Tabs 네비게이터 레이어)를 못 덮음.
 *   Provider 가 {children}(Stack) 다음 형제로 시트를 렌더 → 헤더·탭바·FAB 위 전체 오버레이.
 *
 * 사용:
 *   const { openPostActions } = useModerationSheet();
 *   openPostActions({ targetType: 'post', targetId }); // ... 메뉴 → 신고 시트
 *
 * 본인 콘텐츠(수정/삭제) 분기는 호출처가 판단(예: 카드에서 ... 미노출). 여기선 신고만 제공.
 */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { ContentActionMenu, type MenuAction } from './content-action-menu';
import { ReportSheet } from './report-sheet';
import { Toast } from '@/components/shared/toast';
import type { ReportTargetType } from '@/hooks/use-report';

interface OpenActionsArgs {
  targetType: ReportTargetType;
  /** uuid/식별자 — 신고 대상. §4-5: UI Text 로 출력 금지. */
  targetId: string;
}

interface ModerationSheetContextValue {
  /** 콘텐츠 우상단 ... → 신고 메뉴 오픈. */
  openPostActions: (args: OpenActionsArgs) => void;
}

const ModerationSheetContext = createContext<ModerationSheetContextValue | null>(
  null,
);

export function useModerationSheet(): ModerationSheetContextValue {
  const ctx = useContext(ModerationSheetContext);
  if (!ctx) {
    throw new Error(
      'useModerationSheet must be used within ModerationSheetProvider',
    );
  }
  return ctx;
}

export function ModerationSheetProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const [target, setTarget] = useState<OpenActionsArgs | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const openPostActions = useCallback((args: OpenActionsArgs) => {
    setTarget(args);
    setMenuOpen(true);
  }, []);

  // 항상 non-empty 상수 → 시트 사전 mount (탭 시 expand 레이아웃 레이스 방지).
  const menuActions: MenuAction[] = useMemo(
    () => [{ kind: 'report', onPress: () => setReportOpen(true) }],
    [],
  );

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast((prev) => (prev === msg ? null : prev)), 2500);
  }, []);

  const value = useMemo(() => ({ openPostActions }), [openPostActions]);

  return (
    <ModerationSheetContext.Provider value={value}>
      {children}
      {/* 루트 레벨 렌더 — Stack 다음 형제라 헤더/탭바/FAB 위 전체 오버레이. */}
      <ContentActionMenu
        open={menuOpen}
        actions={menuActions}
        onClose={() => setMenuOpen(false)}
      />
      <ReportSheet
        open={reportOpen}
        targetType={target?.targetType ?? 'post'}
        targetId={target?.targetId ?? ''}
        onClose={() => setReportOpen(false)}
        onSubmitted={() => showToast(t('moderation.report.success'))}
      />
      {!!toast && (
        <View
          style={{
            position: 'absolute',
            bottom: insets.bottom + 24,
            left: 16,
            right: 16,
          }}
          pointerEvents="none"
        >
          <Toast message={toast} tone="success" />
        </View>
      )}
    </ModerationSheetContext.Provider>
  );
}
