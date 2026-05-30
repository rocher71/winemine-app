/**
 * Community Comments — mock data (v0.1.0).
 *
 * 사양: community-post.md §10 I/J + community-post-comments.md §10 A.
 *   - postId 별 댓글 풀 (LocalizedString shape `{ ko, en }`).
 *   - keyscreen `../winemine-keyscreen/src/app/community/[postId]/{page.tsx, comments/page.tsx}` 의
 *     인라인 ko/en hardcoded 본문을 verbatim 포팅.
 *   - 6 posts × 평균 3 comments ≈ 18 entries.
 *   - v0.2.0: supabase `community_comments` 테이블 + RLS + LocalizedString shape view.
 *
 * 정책:
 *   - LocalizedString text → caller (CommentRow / 화면) 에서 i18n.language 따라 분기.
 *   - expert flag = mock sommelier (`함소믈리에`) user 만 true (community-post-comments §10 K verbatim).
 *   - reactions count = mock 정적 정수.
 */
import type { LocalizedString } from '@/components/shared/locale-text';

export interface CommComment {
  id: string;
  postId: string;
  /** community-posts.ts COMM_USERS 의 id 참조. */
  userId: string;
  /** mock 표시 ago string (relative time stub — v0.2.0 supabase created_at 기반 자동 계산). */
  ago: string;
  /** 댓글 본문 — LocalizedString (ko/en 양쪽). */
  body: LocalizedString;
  /** 좋아요/잔 들기 count (mock 정적). */
  reactions: number;
  /** 답글 여부 — true 시 paddingLeft 36 들여쓰기 (CommentRow §1-3). */
  isReply?: boolean;
  /**
   * 답글이 속한 top-level 댓글의 id (1 depth thread 그룹핑용).
   * - undefined: top-level 댓글.
   * - 값 존재: 해당 top-level 댓글 아래에 묶여 렌더되는 답글.
   * 답글에 대한 답글도 동일 parentId 를 가져 depth 가 1 로 유지된다 (요구3).
   */
  parentId?: string;
  /**
   * 멘션 대상 user id — 답글이 누구에게 향하는지 (본문 앞 `@닉네임` 파란 태그로 표시).
   * v0.2.0: supabase comment mentions 테이블.
   */
  replyToUserId?: string;
  /**
   * 첨부 와인의 LWIN — 있을 시 CommentRow 가 CommentWineCard 를 렌더 (요구4).
   * MOCK_WINES.lwin 참조 (getMockWineByLwin). v0.2.0: comment_wine 첨부 테이블.
   */
  wineLwin?: string;
  /** 전문가 배지 — sommelier user 만 true (mock). v0.2.0 user.is_expert column. */
  isExpert?: boolean;
}

// ────────────────────────────────────────────────────────────────────────────
// Comments
// ────────────────────────────────────────────────────────────────────────────

export const COMM_COMMENTS: CommComment[] = [
  // p1 (note pommard) — 3 comments: sommelier (expert) / duckhu / mineral
  {
    id: 'c-p1-1',
    postId: 'p1',
    userId: 'sommelier',
    ago: '8분 전',
    body: {
      ko: '레 루지엥은 광구 디캔터 + 2시간이 표준. 30분의 환원취 사라짐은 영(young) 부르고뉴의 전형적 행동이에요.',
      en: 'Balloon decanter + 2 hours is standard for Les Rugiens. Reduction dissipating at 30 min is typical young Burgundy behavior.',
    },
    reactions: 14,
    isExpert: true,
  },
  {
    id: 'c-p1-2',
    postId: 'p1',
    userId: 'duckhu',
    ago: '10분 전',
    body: {
      ko: '와… 사진이 더 보고 싶어요. 잔에 따랐을 때 색이 어땠나요?',
      en: 'I want to see more photos. How was the color in the glass?',
    },
    reactions: 5,
  },
  {
    id: 'c-p1-3',
    postId: 'p1',
    userId: 'mineral',
    ago: '11분 전',
    body: {
      ko: '루지엥 2019 빈티지 비슷한 노트였어요. 가죽이 나오는 타이밍이 비슷.',
      en: 'I got similar notes from the 2019 Rugiens. The leather phase came up around the same time.',
    },
    reactions: 8,
  },

  // p2 (question wedding) — 7 comments: sommelier(expert) + jiwon(reply) + haerin(reply) + duckhu + mineral + minho + suyeon
  {
    id: 'c-p2-1',
    postId: 'p2',
    userId: 'sommelier',
    ago: '20분 전',
    body: {
      ko: '식사 페어링이라면 알자스 피노 그리 + 보졸레 크뤼 조합 추천드려요. 둘 다 8-9만 원대에서 좋은 선택지가 많고, 손님이 와인을 잘 모르더라도 부담 없이 마실 수 있어요.',
      en: 'For food pairing I would suggest Alsace Pinot Gris + Beaujolais Cru. Both have good options in the 8-9 man-won range and are approachable for non-wine drinkers.',
    },
    reactions: 32,
    isExpert: true,
  },
  {
    id: 'c-p2-2',
    postId: 'p2',
    userId: 'jiwon',
    ago: '18분 전',
    body: {
      ko: '함소믈리에님 추천에 한 표. 보졸레 크뤼 중에서는 모르공이나 플뢰리가 안정적이에요.',
      en: 'I second the sommelier. Among Beaujolais Crus, Morgon or Fleurie are safe bets.',
    },
    reactions: 11,
    isReply: true,
    parentId: 'c-p2-1',
    replyToUserId: 'sommelier',
  },
  {
    id: 'c-p2-3',
    postId: 'p2',
    userId: 'haerin',
    ago: '15분 전',
    body: {
      ko: '둘 다 좋은 정보 감사합니다. 모르공으로 검토해볼게요.',
      en: 'Thanks for both. I will look into Morgon.',
    },
    reactions: 2,
    isReply: true,
    parentId: 'c-p2-1',
    replyToUserId: 'jiwon',
  },
  {
    id: 'c-p2-4',
    postId: 'p2',
    userId: 'duckhu',
    ago: '25분 전',
    body: {
      ko: '저는 작년에 게뷔르츠트라미너 + 키안티 클라시코 조합으로 30명 결혼식 했는데 반응 좋았어요. 화이트가 익숙한 단맛이라 부담이 적었어요.',
      en: 'Last year I served Gewürztraminer + Chianti Classico at a 30-person wedding and it was well received. The white had familiar sweetness, easy for guests.',
    },
    reactions: 18,
  },
  {
    id: 'c-p2-5',
    postId: 'p2',
    userId: 'mineral',
    ago: '28분 전',
    body: {
      ko: '예산 약간만 늘릴 수 있다면 샤블리 1er + 코트 드 본 빌라쥬도 좋은 결혼식 페어링이에요.',
      en: 'If you can stretch the budget slightly, Chablis 1er + Côte de Beaune Villages also makes a lovely wedding pair.',
    },
    reactions: 9,
  },
  {
    id: 'c-p2-6',
    postId: 'p2',
    userId: 'minho',
    ago: '30분 전',
    body: {
      ko: '서비스 방식도 중요해요. 미리 디캔팅 30분 정도면 향이 훨씬 살아납니다.',
      en: 'Service matters too. Decanting 30 min in advance brings out the aromas.',
    },
    reactions: 4,
  },
  {
    id: 'c-p2-7',
    postId: 'p2',
    userId: 'suyeon',
    ago: '33분 전',
    body: {
      ko: '결혼 축하드려요. 좋은 와인 선택되시길.',
      en: 'Congratulations on the wedding. Hope you find the right wines.',
    },
    reactions: 6,
  },

  // p3 (column leflaive) — 0 comments (column variant, post 자체에 댓글 미리보기 없음 — 댓글 화면 진입 시 EmptyState)

  // p4 (news 신세계) — 2 comments: jiwon / suyeon
  {
    id: 'c-p4-1',
    postId: 'p4',
    userId: 'jiwon',
    ago: '4시간 전',
    body: {
      ko: '르플레브 배정량 받기 어렵겠네요. 그래도 라몽네는 노려볼만.',
      en: 'Leflaive allocations will be tough. Ramonet might still be reachable.',
    },
    reactions: 7,
  },
  {
    id: 'c-p4-2',
    postId: 'p4',
    userId: 'suyeon',
    ago: '4시간 전',
    body: {
      ko: '2022는 부르고뉴 입장에서 매우 좋은 빈티지로 평가받았죠. 콩트 라퐁이 1순위 후보입니다.',
      en: '2022 was rated an excellent vintage for Burgundy. Comte Lafon is at the top of my list.',
    },
    reactions: 11,
  },

  // p5 (album cellar) — 2 comments: suyeon / jiwon
  {
    id: 'c-p5-1',
    postId: 'p5',
    userId: 'suyeon',
    ago: '23시간 전',
    body: {
      ko: '셀러 정리 사진은 언제 봐도 마음이 차분해져요. B-3 배치 깔끔하네요.',
      en: 'Cellar organization photos always calm me down. B-3 layout looks tidy.',
    },
    reactions: 8,
  },
  {
    id: 'c-p5-2',
    postId: 'p5',
    userId: 'jiwon',
    ago: '23시간 전',
    body: {
      ko: '라벨이 다 보이게 두면 자연스럽게 더 자주 손이 가더라구요.',
      en: 'When labels are visible you reach for them more often, naturally.',
    },
    reactions: 5,
  },

  // p6 (note les pucelles) — 0 comments (mock 단계 — EmptyState 표시 대상)
];

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

/** 특정 postId 의 댓글 모두 반환 (등록 순서 — 정렬은 caller 가 적용). */
export function getCommentsByPost(postId: string): CommComment[] {
  return COMM_COMMENTS.filter((c) => c.postId === postId);
}

/** 본문을 현재 locale 로 분기 — caller 가 useTranslation().i18n.language 전달. */
export function localizedBody(comment: CommComment, locale: string): string {
  if (locale === 'en') return comment.body.en;
  return comment.body.ko;
}

/** top-level 댓글 + 그에 속한 답글 묶음 (1 depth thread). */
export interface CommThread {
  /** top-level 댓글. */
  root: CommComment;
  /** root 에 속한 답글들 (등록 순서). */
  replies: CommComment[];
}

/**
 * 평탄한 댓글 배열을 1 depth thread 묶음으로 그룹핑.
 * - parentId 가 없는 댓글 = top-level(root).
 * - parentId 가 있는 댓글 = 해당 root 의 replies.
 * - 고아 답글(부모 미발견)은 top-level 로 승격(데이터 방어).
 * root/replies 모두 입력 배열의 등록 순서를 보존한다.
 */
export function groupCommentThreads(comments: CommComment[]): CommThread[] {
  const rootOrder: string[] = [];
  const threadMap = new Map<string, CommThread>();

  // 1패스: root 등록 (parentId 없는 것).
  for (const c of comments) {
    if (!c.parentId) {
      rootOrder.push(c.id);
      threadMap.set(c.id, { root: c, replies: [] });
    }
  }
  // 2패스: 답글 배치 (부모 미발견 시 root 승격).
  for (const c of comments) {
    if (!c.parentId) continue;
    const thread = threadMap.get(c.parentId);
    if (thread) {
      thread.replies.push(c);
    } else {
      rootOrder.push(c.id);
      threadMap.set(c.id, { root: c, replies: [] });
    }
  }
  return rootOrder.map((id) => threadMap.get(id)!).filter(Boolean);
}
