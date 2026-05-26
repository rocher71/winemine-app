// wm-screens-community.jsx — Community feed, post details, composer, tonight map

// ──────────────────────────────────────────────────────────────
// Mock community data
// ──────────────────────────────────────────────────────────────
const COMM_USERS = [
  { id: 'jiwon',   name: '박지원',   level: 5, ko: '마스터',   c: '#8B1A2A', init: '박' },
  { id: 'suyeon',  name: '이서윤',   level: 4, ko: '골드',     c: '#C9A84C', init: '이' },
  { id: 'minho',   name: '김민호',   level: 3, ko: '실버',     c: '#b8b8c0', init: '김' },
  { id: 'duckhu',  name: '와인덕후', level: 4, ko: '골드',     c: '#C9A84C', init: '덕' },
  { id: 'mineral', name: '미네랄러버', level: 5, ko: '마스터', c: '#8B1A2A', init: '미' },
  { id: 'sommelier', name: '함소믈리에', level: 5, ko: '마스터', c: '#8B1A2A', init: '함' },
  { id: 'haerin', name: '정해린',   level: 3, ko: '실버',     c: '#b8b8c0', init: '정' },
];

const COMM_POSTS = [
  {
    id: 'p1', type: 'note', user: 'jiwon', ago: '12분 전',
    wineId: 'rugiens', rating: 4.5,
    title: '두 시간 디캔팅한 레 루지엥, 정점이 이렇게 아름답습니다',
    body: '코르크를 따고 5분, 환원취 가득. 30분, 검은 체리. 1시간, 가죽이 살짝. 2시간 — 모든 향이 한 자리에 모인다. 권장 시간과 정확히 일치.',
    reactions: { glass: 38, sparkle: 12, bookmark: 7, drank: 4 },
    comments: 6,
  },
  {
    id: 'p2', type: 'question', user: 'haerin', ago: '37분 전',
    title: '결혼식에 손님 30분께 낼 와인, 추천 부탁드려요',
    body: '예산 병당 7-9만 원. 가벼운 화이트 + 미디엄 레드 한 종씩 생각 중인데, 의외로 어렵네요. 너무 드라이하지 않으면서 식사와 잘 어울리는 것이 좋겠어요. 다들 어떤 와인 내셨나요?',
    reactions: { glass: 8, sparkle: 2, bookmark: 14, drank: 0 },
    comments: 23,
  },
  {
    id: 'p3', type: 'column', user: 'sommelier', ago: '3시간 전',
    title: '부르고뉴 도멘 르플레브 방문기 — 9월의 첫 수확',
    body: '비행기를 타고 디종, 다시 두 시간을 달려 도착한 퓔리니-몽라셰. 안 클로드의 손녀가 직접 안내해준 빈야드는 생각보다 작았고, 생각보다 조용했고, 생각보다 정밀했다.',
    cover: 'vineyard', reactions: { glass: 142, sparkle: 67, bookmark: 89, drank: 0 }, comments: 31,
  },
  {
    id: 'p4', type: 'news', user: 'duckhu', ago: '5시간 전',
    title: '신세계 강남, 부르고뉴 2022 빈티지 사전 예약 오늘 오픈',
    body: '예약 가능 도멘 12곳, 한정 수량. 르플레브 / 라몽네 / 콩트 라퐁 포함.',
    reactions: { glass: 22, sparkle: 4, bookmark: 51, drank: 0 }, comments: 8,
  },
  {
    id: 'p5', type: 'album', user: 'minho', ago: '어제',
    title: '소소한 셀러 정리의 하루',
    body: 'B-3 공간을 비우고 새로 들어온 6병 자리 잡기. 라벨이 다 보이게 두면 시간이 좋아진다.',
    reactions: { glass: 56, sparkle: 8, bookmark: 12, drank: 0 }, comments: 11, photoCount: 7,
  },
  {
    id: 'p6', type: 'note', user: 'mineral', ago: '어제',
    wineId: 'pucelles', rating: 5,
    title: '레 퓌셀 2018 — 이제 막 깨어나는 중',
    body: '레몬·헤이즐넛 사이로 부싯돌이 슬쩍. 산도가 펜처럼 또렷한데 미네랄이 길게 따라옴. 아직 6년은 더 좋아질 거예요.',
    reactions: { glass: 89, sparkle: 34, bookmark: 23, drank: 5 }, comments: 14,
  },
];

// ──────────────────────────────────────────────────────────────
// Avatar / user row
// ──────────────────────────────────────────────────────────────
function CommUserAvatar({ user, size = 36 }) {
  const u = COMM_USERS.find(x => x.id === user) || COMM_USERS[0];
  return (
    <div style={{
      width: size, height: size, borderRadius: 999, flexShrink: 0,
      background: `linear-gradient(135deg, ${u.c}, ${WM.bgSurface})`,
      border: `1px solid ${u.c}88`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: WM.cream, fontFamily: WM.display, fontSize: size * 0.42, fontWeight: 700,
    }}>{u.init}</div>
  );
}

function CommUserRow({ user, ago, trailing }) {
  const u = COMM_USERS.find(x => x.id === user) || COMM_USERS[0];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <CommUserAvatar user={user}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontFamily: WM.display, fontSize: 13, color: WM.cream }}>{u.name}</span>
          <LevelPill level={u.level} compact/>
        </div>
        <div style={{ fontSize: 10, color: WM.textMuted, marginTop: 2 }}>{ago}</div>
      </div>
      {trailing || <button style={iconBtn({ width: 28, height: 28 })}><Icon name="moreH" size={14} color={WM.textMuted}/></button>}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Post type badge (top-left chip)
// ──────────────────────────────────────────────────────────────
function PostTypeBadge({ type }) {
  const map = {
    note:     { ko: '시음 노트',  ic: 'pencil',   c: WM.gold },
    question: { ko: '질문',       ic: 'info',     c: '#a08ee0' },
    column:   { ko: '칼럼',       ic: 'book',     c: WM.cream },
    news:     { ko: '소식',       ic: 'sparkle',  c: '#5b9ce6' },
    album:    { ko: '사진 앨범',   ic: 'photo',    c: '#e8b4d2' },
  };
  const s = map[type] || map.note;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 9px', borderRadius: 999,
      background: `${s.c}1a`, border: `1px solid ${s.c}55`, color: s.c,
      fontSize: 10, fontWeight: 600, letterSpacing: '0.04em',
    }}>
      <Icon name={s.ic} size={10} color={s.c}/>
      {s.ko}
    </span>
  );
}

// ──────────────────────────────────────────────────────────────
// Wine glass reaction bar (custom reactions, not just "like")
// ──────────────────────────────────────────────────────────────
function ReactionBar({ reactions = {}, comments = 0, mine = null }) {
  const items = [
    { id: 'glass',    ic: 'wineGlass', l: '잔 들기',  c: WM.gold,    n: reactions.glass || 0 },
    { id: 'sparkle',  ic: 'sparkle',   l: '통찰',     c: WM.cream,   n: reactions.sparkle || 0 },
    { id: 'bookmark', ic: 'bookmark',  l: '저장',     c: '#a08ee0',  n: reactions.bookmark || 0 },
    { id: 'drank',    ic: 'bottle',    l: '나도',     c: WM.wine,    n: reactions.drank || 0 },
  ];
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 4, paddingTop: 4,
    }}>
      {items.map(it => {
        const on = mine === it.id;
        return (
          <button key={it.id} style={{
            padding: '6px 10px 6px 8px', borderRadius: 999,
            background: on ? `${it.c}22` : 'transparent',
            border: `1px solid ${on ? it.c : WM.border}`,
            color: on ? it.c : WM.textSecond,
            fontSize: 11, fontWeight: 600, fontFamily: WM.body,
            display: 'inline-flex', alignItems: 'center', gap: 5,
            cursor: 'pointer',
          }}>
            <Icon name={on ? (it.id==='bookmark' ? 'bookmarkFill' : it.id==='drank' ? 'bottleSmall' : it.ic) : it.ic}
              size={13} color={on ? it.c : WM.textSecond}/>
            {it.n > 0 && <span style={{ fontSize: 11 }}>{it.n}</span>}
          </button>
        );
      })}
      <span style={{ flex: 1 }}/>
      <button style={{
        padding: '6px 10px', background: 'transparent', border: 'none',
        color: WM.textMuted, fontSize: 11, fontWeight: 500,
        display: 'inline-flex', alignItems: 'center', gap: 5,
      }}>
        <Icon name="list" size={12} color={WM.textMuted}/>
        댓글 {comments}
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Embedded wine card (in posts that reference a wine)
// ──────────────────────────────────────────────────────────────
function WineEmbedCard({ wineId, mini = false }) {
  const w = WINES.find(x => x.id === wineId) || WINES[0];
  return (
    <div style={{
      marginTop: 10, padding: mini ? 10 : 12, borderRadius: 12,
      background: WM.bgDeep, border: `1px solid ${WM.gold}33`,
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <WMBottle wine={w} width={mini ? 22 : 28} height={mini ? 74 : 94}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <Icon name="pin" size={10} color={WM.gold}/>
          <span style={{
            fontSize: 9, color: WM.gold, letterSpacing: '0.14em',
            textTransform: 'uppercase', fontWeight: 600,
          }}>이 와인</span>
        </div>
        <div style={{ fontFamily: WM.display, fontSize: 12.5, color: WM.cream, lineHeight: 1.3 }}>{w.nameKo}</div>
        <div style={{ fontSize: 10, color: WM.textMuted, marginTop: 2 }}>{w.producer} · {w.vintage}</div>
      </div>
      <Icon name="chevR" size={14} color={WM.gold}/>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Comment row (flat, Instagram-ish)
// ──────────────────────────────────────────────────────────────
function CommentRow({ user, ago, text, reactions = 0, isReply = false, expert = false }) {
  const u = COMM_USERS.find(x => x.id === user) || COMM_USERS[0];
  return (
    <div style={{
      display: 'flex', gap: 10, padding: '10px 0',
      paddingLeft: isReply ? 36 : 0,
      borderBottom: `0.5px solid ${WM.border}`,
    }}>
      <CommUserAvatar user={user} size={isReply ? 24 : 30}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span style={{ fontSize: 11, color: WM.cream, fontWeight: 600 }}>{u.name}</span>
          <LevelPill level={u.level} compact/>
          {expert && (
            <span style={{
              padding: '1px 6px', borderRadius: 999,
              background: `${WM.gold}33`, color: WM.gold,
              fontSize: 9, fontWeight: 600, letterSpacing: '0.06em',
            }}>전문가</span>
          )}
        </div>
        <div style={{ fontSize: 12, color: WM.textSecond, lineHeight: 1.55 }}>{text}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6, fontSize: 10, color: WM.textMuted }}>
          <span>{ago}</span>
          <button style={{ background: 'transparent', border: 'none', color: WM.textMuted, fontSize: 10, padding: 0 }}>답글</button>
          <span style={{ flex: 1 }}/>
          <button style={{
            background: 'transparent', border: 'none', color: WM.textMuted,
            fontSize: 10, padding: 0, display: 'inline-flex', alignItems: 'center', gap: 3,
          }}>
            <Icon name="wineGlass" size={11} color={WM.textMuted}/>{reactions}
          </button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Feed Card (default — note or question, with optional wine embed)
// ──────────────────────────────────────────────────────────────
function CommFeedCard({ post, mine }) {
  return (
    <article style={{
      padding: '14px 16px 12px', borderRadius: 14,
      background: WM.bgSurface, border: `1px solid ${WM.border}`,
    }}>
      {/* Type badge */}
      <div style={{ marginBottom: 10 }}>
        <PostTypeBadge type={post.type}/>
      </div>
      {/* User row */}
      <CommUserRow user={post.user} ago={post.ago}/>
      {/* Title */}
      <div style={{
        fontFamily: WM.display, fontSize: 16, color: WM.cream,
        lineHeight: 1.3, marginTop: 10,
      }}>{post.title}</div>
      {/* Body */}
      <div style={{
        fontSize: 12.5, color: WM.textSecond, lineHeight: 1.65, marginTop: 6,
        display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>{post.body}</div>
      {/* Wine embed for note posts */}
      {post.type === 'note' && post.wineId && <WineEmbedCard wineId={post.wineId}/>}
      {/* Reaction bar */}
      <ReactionBar reactions={post.reactions} comments={post.comments} mine={mine}/>
    </article>
  );
}

// Compact feed card (for 전체 tab, denser)
function CommFeedRow({ post }) {
  return (
    <div style={{
      padding: '12px 16px', borderBottom: `0.5px solid ${WM.border}`,
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <CommUserAvatar user={post.user} size={26}/>
        <span style={{ fontSize: 11, color: WM.cream, fontWeight: 600 }}>
          {COMM_USERS.find(u => u.id === post.user)?.name}
        </span>
        <PostTypeBadge type={post.type}/>
        <span style={{ flex: 1 }}/>
        <span style={{ fontSize: 10, color: WM.textMuted }}>{post.ago}</span>
      </div>
      <div style={{ fontFamily: WM.display, fontSize: 14, color: WM.cream, lineHeight: 1.3 }}>{post.title}</div>
      <div style={{
        fontSize: 11.5, color: WM.textSecond, lineHeight: 1.55,
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>{post.body}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 10, color: WM.textMuted }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <Icon name="wineGlass" size={11} color={WM.gold}/>
          {post.reactions.glass}
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <Icon name="list" size={11} color={WM.textMuted}/>
          {post.comments}
        </span>
        {post.reactions.drank > 0 && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: WM.wine }}>
            <Icon name="bottle" size={11} color={WM.wine}/>
            나도 {post.reactions.drank}
          </span>
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// /community — Feed tab 팔로잉 (main entry, editorial cards)
// ──────────────────────────────────────────────────────────────
function CommunityFeedFollowing() {
  return (
    <WMScreen pad={100}>
      <AppHeader unread={3}/>

      {/* Title + compose */}
      <div style={{ padding: '14px 20px 8px', display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <div>
          <div style={{ fontSize: 10, color: WM.gold, letterSpacing: '0.18em', textTransform: 'uppercase' }}>커뮤니티</div>
          <div style={{ fontFamily: WM.display, fontSize: 22, color: WM.cream, marginTop: 2 }}>오늘 밤의 와인 이야기</div>
        </div>
        <span style={{ flex: 1 }}/>
        <button style={iconBtn()}><Icon name="search" size={18} color={WM.textSecond}/></button>
      </div>

      {/* Tab bar */}
      <div style={{
        display: 'flex', gap: 22, padding: '6px 20px 0',
        borderBottom: `0.5px solid ${WM.border}`,
      }}>
        {[
          { l: '팔로잉', on: true },
          { l: '전체',   on: false },
          { l: '트렌딩', on: false },
        ].map((t, i) => (
          <span key={t.l} style={{
            fontSize: 13, fontWeight: t.on ? 600 : 400,
            color: t.on ? WM.cream : WM.textMuted,
            paddingBottom: 10, borderBottom: t.on ? `2px solid ${WM.gold}` : '2px solid transparent',
            marginBottom: -1,
          }}>{t.l}</span>
        ))}
      </div>

      {/* Feed */}
      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <CommFeedCard post={COMM_POSTS[0]} mine="glass"/>
        <CommFeedCard post={COMM_POSTS[2]}/>
        <CommFeedCard post={COMM_POSTS[1]}/>
      </div>

      {/* FAB compose */}
      <button style={{
        position: 'absolute', right: 18, bottom: 110,
        width: 56, height: 56, borderRadius: 999,
        background: `linear-gradient(135deg, ${WM.wine}, ${WM.wineSoft})`,
        border: `1px solid ${WM.gold}`, color: WM.cream,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 10px 24px rgba(139,26,42,0.45)',
      }}>
        <Icon name="pencil" size={22} color={WM.cream}/>
      </button>

      <BottomNav active="home"/>
    </WMScreen>
  );
}

// ──────────────────────────────────────────────────────────────
// /community — Feed tab 전체 (denser, list-style)
// ──────────────────────────────────────────────────────────────
function CommunityFeedAll() {
  return (
    <WMScreen pad={100}>
      <AppHeader unread={3}/>

      <div style={{ padding: '14px 20px 8px', display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <div>
          <div style={{ fontSize: 10, color: WM.gold, letterSpacing: '0.18em', textTransform: 'uppercase' }}>커뮤니티</div>
          <div style={{ fontFamily: WM.display, fontSize: 22, color: WM.cream, marginTop: 2 }}>모든 잔의 이야기</div>
        </div>
        <span style={{ flex: 1 }}/>
        <button style={iconBtn()}><Icon name="filter" size={18} color={WM.textSecond}/></button>
      </div>

      <div style={{ display: 'flex', gap: 22, padding: '6px 20px 0', borderBottom: `0.5px solid ${WM.border}` }}>
        {['팔로잉', '전체', '트렌딩'].map((l, i) => (
          <span key={l} style={{
            fontSize: 13, fontWeight: i===1 ? 600 : 400,
            color: i===1 ? WM.cream : WM.textMuted,
            paddingBottom: 10, borderBottom: i===1 ? `2px solid ${WM.gold}` : '2px solid transparent',
            marginBottom: -1,
          }}>{l}</span>
        ))}
      </div>

      {/* Type filter chips */}
      <div style={{ display: 'flex', gap: 6, padding: '10px 16px 6px', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {['전체', '시음 노트', '질문', '칼럼', '소식', '사진'].map((l, i) => (
          <button key={l} style={{
            padding: '5px 10px', borderRadius: 999,
            background: i===0 ? `${WM.gold}22` : 'transparent',
            border: `1px solid ${i===0 ? WM.gold : WM.border}`,
            color: i===0 ? WM.gold : WM.textSecond,
            fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
          }}>{l}</button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {COMM_POSTS.map(p => <CommFeedRow key={p.id} post={p}/>)}
      </div>

      <BottomNav active="home"/>
    </WMScreen>
  );
}

// ──────────────────────────────────────────────────────────────
// /community — Feed tab 트렌딩
// ──────────────────────────────────────────────────────────────
function CommunityFeedTrending() {
  return (
    <WMScreen pad={100}>
      <AppHeader unread={3}/>

      <div style={{ padding: '14px 20px 8px' }}>
        <div style={{ fontSize: 10, color: WM.gold, letterSpacing: '0.18em', textTransform: 'uppercase' }}>커뮤니티 · 이번 주</div>
        <div style={{ fontFamily: WM.display, fontSize: 22, color: WM.cream, marginTop: 2 }}>가장 많이 든 잔들</div>
      </div>

      <div style={{ display: 'flex', gap: 22, padding: '6px 20px 0', borderBottom: `0.5px solid ${WM.border}` }}>
        {['팔로잉', '전체', '트렌딩'].map((l, i) => (
          <span key={l} style={{
            fontSize: 13, fontWeight: i===2 ? 600 : 400,
            color: i===2 ? WM.cream : WM.textMuted,
            paddingBottom: 10, borderBottom: i===2 ? `2px solid ${WM.gold}` : '2px solid transparent',
            marginBottom: -1,
          }}>{l}</span>
        ))}
      </div>

      {/* Hot topics row */}
      <div style={{
        margin: '12px 16px 0', padding: '14px 16px', borderRadius: 14,
        background: WM.bgSurface, border: `1px solid ${WM.border}`,
      }}>
        <div style={{ fontSize: 10, color: WM.gold, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 10 }}>
          이번 주 키워드
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {[
            { l: '부르고뉴 22빈티지', n: 142, c: WM.gold },
            { l: '레 루지엥',         n: 89,  c: WM.wine },
            { l: '디캔팅 시간',       n: 67,  c: WM.cream },
            { l: '결혼식 와인',       n: 54 },
            { l: '봄 음용 적기',      n: 41 },
            { l: '내츄럴',            n: 33 },
          ].map((t, i) => (
            <span key={i} style={{
              padding: '6px 11px', borderRadius: 999,
              background: t.c ? `${t.c}1a` : WM.bgDeep,
              border: `1px solid ${t.c ? t.c+'66' : WM.border}`,
              color: t.c || WM.textSecond,
              fontSize: 11, fontWeight: 600,
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              <span>#{t.l}</span>
              <span style={{ fontSize: 10, opacity: 0.7 }}>{t.n}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Ranked posts */}
      <div style={{ padding: '14px 20px 4px' }}>
        <div style={{ fontSize: 10, color: WM.gold, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
          순위 (지난 7일)
        </div>
      </div>
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[COMM_POSTS[2], COMM_POSTS[5], COMM_POSTS[0], COMM_POSTS[4]].map((p, i) => (
          <div key={p.id} style={{
            padding: 14, borderRadius: 12,
            background: WM.bgSurface, border: `1px solid ${WM.border}`,
            display: 'flex', gap: 12, alignItems: 'flex-start',
          }}>
            <div style={{
              width: 28, fontFamily: WM.display, fontSize: 22,
              color: i < 3 ? WM.gold : WM.textMuted, lineHeight: 1, textAlign: 'center',
            }}>
              {i+1}
              <div style={{ marginTop: 4 }}>
                <Icon name={i===0 ? 'trendUp' : i===1 ? 'flame' : 'chevU'} size={11} color={i<3 ? WM.gold : WM.textMuted}/>
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <PostTypeBadge type={p.type}/>
              <div style={{ fontFamily: WM.display, fontSize: 13, color: WM.cream, marginTop: 6, lineHeight: 1.3 }}>{p.title}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6, fontSize: 10, color: WM.textMuted }}>
                <span>{COMM_USERS.find(u=>u.id===p.user)?.name}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  <Icon name="wineGlass" size={10} color={WM.gold}/>{p.reactions.glass}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  <Icon name="list" size={10} color={WM.textMuted}/>{p.comments}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <BottomNav active="home"/>
    </WMScreen>
  );
}

// ──────────────────────────────────────────────────────────────
// /community/[postId] — Note post detail (with wine embed + comments)
// ──────────────────────────────────────────────────────────────
function PostDetailNote() {
  const p = COMM_POSTS[0];
  return (
    <WMScreen pad={20}>
      <BackHeader title="" trailing={
        <button style={iconBtn()}><Icon name="share" size={18} color={WM.textSecond}/></button>
      }/>

      <article style={{ padding: '14px 20px 0' }}>
        <PostTypeBadge type={p.type}/>
        <div style={{ marginTop: 12 }}>
          <CommUserRow user={p.user} ago={p.ago}/>
        </div>
        <div style={{ fontFamily: WM.display, fontSize: 22, color: WM.cream, lineHeight: 1.25, marginTop: 14 }}>
          {p.title}
        </div>
        {/* Rating row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
          <WMGlassRating value={Math.round(p.rating)} size={12}/>
          <span style={{ fontFamily: WM.display, fontSize: 17, color: WM.gold }}>{p.rating}</span>
        </div>
        <div style={{ fontSize: 13.5, color: WM.textSecond, lineHeight: 1.75, marginTop: 14, fontFamily: WM.garamond, fontStyle: 'italic' }}>
          {p.body}
        </div>
        <WineEmbedCard wineId={p.wineId}/>

        {/* Expert annotation */}
        <div style={{
          marginTop: 14, padding: '12px 14px', borderRadius: 10,
          background: `${WM.gold}0d`, border: `1px solid ${WM.gold}55`,
          borderLeft: `3px solid ${WM.gold}`,
          display: 'flex', gap: 10,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <Icon name="info" size={11} color={WM.gold}/>
              <span style={{ fontSize: 9, color: WM.gold, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600 }}>
                전문가 각주 · 함소믈리에
              </span>
            </div>
            <div style={{ fontSize: 11.5, color: WM.textSecond, lineHeight: 1.6 }}>
              레 루지엥은 광구 디캔터 + 2시간이 표준. 30분의 환원취 사라짐은 영(young) 부르고뉴의 전형적 행동이에요.
            </div>
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          <ReactionBar reactions={p.reactions} comments={p.comments} mine="glass"/>
        </div>
      </article>

      {/* "나도 마셔봤어요" suggestion */}
      <div style={{
        margin: '20px 16px 0', padding: '14px 16px', borderRadius: 14,
        background: `linear-gradient(135deg, ${WM.wineSoft}55, ${WM.bgSurface})`,
        border: `1px solid ${WM.gold}66`,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <Icon name="bottle" size={22} color={WM.gold}/>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: WM.cream, fontWeight: 600 }}>나도 마셔봤어요</div>
          <div style={{ fontSize: 10, color: WM.textMuted, marginTop: 2 }}>셀러에 자동 추가 · 노트 시작</div>
        </div>
        <button style={{
          padding: '8px 14px', borderRadius: 999,
          background: WM.wine, border: 'none', color: WM.cream,
          fontSize: 11, fontWeight: 600, fontFamily: WM.body,
        }}>+ 추가</button>
      </div>

      {/* Comments header */}
      <div style={{
        padding: '20px 20px 0',
        display: 'flex', alignItems: 'baseline', gap: 8,
      }}>
        <span style={{ fontFamily: WM.display, fontSize: 16, color: WM.cream }}>댓글</span>
        <span style={{ fontSize: 11, color: WM.textMuted }}>{p.comments}개</span>
      </div>

      <div style={{ padding: '8px 20px 30px' }}>
        <CommentRow user="sommelier" ago="8분 전" text="레 루지엥의 진흙 토양 — 환원취 빠른 진행이 정상이에요. 굳이 광구가 아니어도 잔에서 충분." reactions={12} expert/>
        <CommentRow user="duckhu" ago="15분 전" text="이거 보고 저도 한 병 꺼내야겠네요. 마지막으로 본 게 작년인데..." reactions={4}/>
        <CommentRow user="mineral" ago="22분 전" text="2017은 정말 단단한 빈티지였죠. 부럽습니다." reactions={8}/>
        <CommentRow user="haerin" ago="32분 전" text="환원취 사라지는 순간이 진짜 핵심" reactions={2}/>
        <CommentRow user="minho" ago="1시간 전" text="이번 주말에 시도해볼게요" reactions={1}/>
      </div>

      {/* Compose footer */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        padding: '10px 16px 30px',
        background: `linear-gradient(to top, ${WM.bgDeep} 70%, rgba(10,5,15,0))`,
        borderTop: `0.5px solid ${WM.border}`,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <CommUserAvatar user="suyeon" size={32}/>
        <div style={{
          flex: 1, height: 38, borderRadius: 999,
          background: WM.bgSurface, border: `1px solid ${WM.border}`,
          display: 'flex', alignItems: 'center', padding: '0 14px',
          fontSize: 12, color: WM.textMuted,
        }}>댓글을 남겨주세요...</div>
        <button style={{
          width: 38, height: 38, borderRadius: 999,
          background: WM.wine, border: 'none', color: WM.cream,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="arrowR" size={16} color={WM.cream}/>
        </button>
      </div>
    </WMScreen>
  );
}

// ──────────────────────────────────────────────────────────────
// /community/[postId] — Column post (magazine style)
// ──────────────────────────────────────────────────────────────
function PostDetailColumn() {
  const p = COMM_POSTS[2];
  return (
    <WMScreen pad={20}>
      <div style={{
        position: 'absolute', top: 54, left: 0, right: 0, padding: '8px 16px',
        display: 'flex', justifyContent: 'space-between', zIndex: 10,
      }}>
        <button style={iconBtn({ background: 'rgba(5,2,10,0.6)' })}>
          <Icon name="arrowL" size={20} color={WM.cream}/>
        </button>
        <div style={{ display: 'flex', gap: 6 }}>
          <button style={iconBtn({ background: 'rgba(5,2,10,0.6)' })}>
            <Icon name="bookmark" size={18} color={WM.cream}/>
          </button>
          <button style={iconBtn({ background: 'rgba(5,2,10,0.6)' })}>
            <Icon name="share" size={18} color={WM.cream}/>
          </button>
        </div>
      </div>

      {/* Cover hero */}
      <div style={{
        height: 280, position: 'relative',
        background: `linear-gradient(180deg, ${WM.wineSoft}, ${WM.bgDeep})`,
      }}>
        <svg width="100%" height="280" viewBox="0 0 390 280" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="vine" patternUnits="userSpaceOnUse" width="18" height="18" patternTransform="rotate(-8)">
              <rect width="18" height="18" fill="#2a141c"/>
              <rect x="0" width="9" height="18" fill="#3a1a26"/>
            </pattern>
            <linearGradient id="vgrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(5,2,10,0)"/>
              <stop offset="100%" stopColor="rgba(5,2,10,0.92)"/>
            </linearGradient>
          </defs>
          <rect width="390" height="280" fill="url(#vine)" opacity="0.5"/>
          <rect width="390" height="280" fill="url(#vgrad)"/>
          <text x="20" y="220" fontFamily={WM.body} fontSize="9" fill={WM.textMuted} letterSpacing="0.1em">
            [ Cover · Domaine Leflaive, September harvest ]
          </text>
        </svg>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 22px 20px' }}>
          <PostTypeBadge type="column"/>
          <div style={{ fontFamily: WM.display, fontSize: 26, color: WM.cream, lineHeight: 1.15, marginTop: 12, fontStyle: 'italic' }}>
            {p.title}
          </div>
        </div>
      </div>

      {/* Author */}
      <div style={{ padding: '16px 20px 0' }}>
        <CommUserRow user={p.user} ago={p.ago + ' · 약 8분 읽기'}/>
      </div>

      {/* Body */}
      <div style={{ padding: '20px 22px 0' }}>
        <p style={{
          fontFamily: WM.garamond, fontSize: 18, color: WM.cream,
          lineHeight: 1.65, marginTop: 0, marginBottom: 16, fontStyle: 'italic',
        }}>
          {p.body}
        </p>
        <p style={{ fontSize: 14, color: WM.textSecond, lineHeight: 1.85 }}>
          이름값보다 토양값을 더 무겁게 본다는 안의 말이 인상적이었다. 같은 빈야드도 위쪽 다섯 줄과 아래쪽 다섯 줄은 다른 와인이 된다.
          그래서 도멘의 라벨엔 항상 클리마가 적혀있고, 클리마가 적혀있지 않은 와인엔 도멘의 이름도 적혀있지 않다.
        </p>
        <p style={{ fontSize: 14, color: WM.textSecond, lineHeight: 1.85, marginTop: 14 }}>
          시음실은 지하 두 층. 햇빛 한 줄기 들지 않는 곳에서 우리는 다섯 종류의 화이트와 두 종류의 레드를 마셨다. 가장 인상 깊었던 건 의외로 막 병입된 2023 빈티지였다.
        </p>

        {/* Pull quote */}
        <div style={{
          margin: '22px 0', padding: '0 0 0 18px',
          borderLeft: `2px solid ${WM.gold}`,
        }}>
          <div style={{
            fontFamily: WM.garamond, fontSize: 20, color: WM.gold,
            lineHeight: 1.4, fontStyle: 'italic',
          }}>
            "와인은 농부의 시간이지, 양조가의 시간이 아닙니다."
          </div>
          <div style={{ fontSize: 10, color: WM.textMuted, marginTop: 8, letterSpacing: '0.06em' }}>
            — 안 클로드 르플레브
          </div>
        </div>

        <p style={{ fontSize: 14, color: WM.textSecond, lineHeight: 1.85 }}>
          돌아오는 비행기에서 그 말을 계속 곱씹었다. 우리가 매기는 점수와, 농부가 본 그 해의 의미는 얼마나 다를까. 어쩌면 점수는 평가가 아니라 기억의 좌표일지도.
        </p>

        {/* Inline wine reference */}
        <div style={{ marginTop: 18 }}>
          <WineEmbedCard wineId="pucelles"/>
        </div>

        <ReactionBar reactions={p.reactions} comments={p.comments} mine="bookmark"/>
      </div>

      {/* Related */}
      <div style={{ padding: '20px 20px 30px' }}>
        <div style={{ fontSize: 10, color: WM.gold, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 10 }}>
          관련 글
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[COMM_POSTS[5], COMM_POSTS[3]].map(rp => <CommFeedRow key={rp.id} post={rp}/>)}
        </div>
      </div>
    </WMScreen>
  );
}

// ──────────────────────────────────────────────────────────────
// /community/[postId] — Question post
// ──────────────────────────────────────────────────────────────
function PostDetailQuestion() {
  const p = COMM_POSTS[1];
  return (
    <WMScreen pad={20}>
      <BackHeader title="" trailing={
        <button style={iconBtn()}><Icon name="share" size={18} color={WM.textSecond}/></button>
      }/>

      <article style={{ padding: '14px 20px 0' }}>
        <PostTypeBadge type="question"/>
        <div style={{ marginTop: 12 }}>
          <CommUserRow user={p.user} ago={p.ago}/>
        </div>
        <div style={{ fontFamily: WM.display, fontSize: 21, color: WM.cream, lineHeight: 1.3, marginTop: 14 }}>
          {p.title}
        </div>
        <div style={{ fontSize: 14, color: WM.textSecond, lineHeight: 1.75, marginTop: 12 }}>
          {p.body}
        </div>

        {/* Tag chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>
          {['#결혼식', '#예산_7-9만', '#화이트', '#미디엄레드', '#30명'].map(t => (
            <span key={t} style={{
              padding: '4px 10px', borderRadius: 999,
              background: WM.bgSurface, border: `1px solid ${WM.border}`,
              color: WM.textMuted, fontSize: 11,
            }}>{t}</span>
          ))}
        </div>

        <ReactionBar reactions={p.reactions} comments={p.comments}/>
      </article>

      {/* Top recommendations summary */}
      <div style={{
        margin: '18px 16px 0', padding: 16, borderRadius: 14,
        background: WM.bgSurface, border: `1px solid ${WM.gold}55`,
      }}>
        <div style={{ fontSize: 10, color: WM.gold, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 12 }}>
          가장 많이 추천된 와인
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {WINES.slice(2, 5).map((w, i) => (
            <div key={w.id} style={{
              padding: '8px 10px', borderRadius: 10,
              background: WM.bgDeep, border: `1px solid ${WM.border}`,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: 999,
                background: i===0 ? WM.gold : WM.bgSurface,
                border: `1px solid ${i===0 ? WM.gold : WM.border}`,
                color: i===0 ? WM.bgDeepest : WM.textSecond,
                fontFamily: WM.display, fontSize: 11, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{i+1}</div>
              <WMBottle wine={w} width={18} height={60}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, color: WM.cream, fontFamily: WM.display, lineHeight: 1.3 }}>{w.nameKo}</div>
                <div style={{ fontSize: 9, color: WM.textMuted, marginTop: 2 }}>{[8, 6, 4][i]}명 추천 · ₩ {(w.price/1000).toFixed(0)}K</div>
              </div>
              <Icon name="chevR" size={12} color={WM.textMuted}/>
            </div>
          ))}
        </div>
      </div>

      {/* Comments / answers */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontFamily: WM.display, fontSize: 16, color: WM.cream }}>답변</span>
          <span style={{ fontSize: 11, color: WM.textMuted }}>{p.comments}개</span>
          <span style={{ flex: 1 }}/>
          <span style={{ fontSize: 11, color: WM.gold, fontWeight: 600 }}>도움 순 ↓</span>
        </div>
      </div>
      <div style={{ padding: '6px 20px 30px' }}>
        <CommentRow user="sommelier" ago="20분 전"
          text="식사 메뉴를 먼저 알려주시면 더 좋겠지만, 일반적인 결혼식 코스라면 화이트는 상세르나 푸이-퓌메, 레드는 영 부르고뉴(예: 자크 까샤르 부르고뉴 루즈)나 토스카나 산조베제(키안티 클라시코) 추천드려요. 둘 다 식사를 방해하지 않으면서 적당한 깊이가 있어요."
          reactions={28} expert/>
        <CommentRow user="duckhu" ago="35분 전"
          text="크레망 부르고뉴를 빼지 마세요. 한 잔으로 시작하기에 너무 좋아요."
          reactions={14}/>
        <CommentRow user="mineral" ago="42분 전"
          text="피카르의 부르고뉴 알리고떼 정말 좋습니다. 가격 대비 만족도 최고예요."
          reactions={9}/>
      </div>
    </WMScreen>
  );
}

// ──────────────────────────────────────────────────────────────
// /community/[postId] — Photo album post
// ──────────────────────────────────────────────────────────────
function PostDetailAlbum() {
  const p = COMM_POSTS[4];
  return (
    <WMScreen pad={20}>
      <BackHeader title="" trailing={
        <button style={iconBtn()}><Icon name="share" size={18} color={WM.textSecond}/></button>
      }/>

      <article style={{ padding: '14px 20px 0' }}>
        <div style={{ marginBottom: 12 }}><PostTypeBadge type="album"/></div>
        <CommUserRow user={p.user} ago={p.ago}/>
        <div style={{ fontFamily: WM.display, fontSize: 20, color: WM.cream, lineHeight: 1.25, marginTop: 14 }}>{p.title}</div>
        <div style={{ fontSize: 13, color: WM.textSecond, lineHeight: 1.7, marginTop: 8 }}>{p.body}</div>
      </article>

      {/* Photo carousel — 1st large, 6 thumbs grid */}
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{
          aspectRatio: '4/3', borderRadius: 14, overflow: 'hidden',
          background: `linear-gradient(135deg, ${WM.wineSoft}, ${WM.bgSurface})`,
          position: 'relative',
        }}>
          <svg width="100%" height="100%" viewBox="0 0 358 268" preserveAspectRatio="xMidYMid slice">
            <defs>
              <pattern id="bottlesPat" patternUnits="userSpaceOnUse" width="60" height="200">
                <rect width="60" height="200" fill="#1a0a1e"/>
                <rect x="22" y="20" width="16" height="160" fill="#5a1a28" opacity="0.6" rx="6"/>
                <rect x="22" y="20" width="16" height="40" fill="#0a0612" rx="2"/>
              </pattern>
            </defs>
            <rect width="358" height="268" fill="url(#bottlesPat)"/>
          </svg>
          <div style={{
            position: 'absolute', bottom: 12, right: 12,
            padding: '4px 10px', borderRadius: 999,
            background: 'rgba(5,2,10,0.7)', border: `1px solid ${WM.border}`,
            color: WM.cream, fontSize: 11, fontWeight: 600,
          }}>1 / {p.photoCount}</div>
        </div>
        <div style={{
          marginTop: 8, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6,
        }}>
          {[2,3,4,5].map(i => (
            <div key={i} style={{
              aspectRatio: '1/1', borderRadius: 8,
              background: ['#1a0a1e','#2a141c','#3a1a26','#1a0a1e'][i-2],
              border: `1px solid ${WM.border}`,
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute', inset: 12,
                background: WINES[i-2]?.labelColor, borderRadius: 4,
              }}/>
              {i === 5 && (
                <div style={{
                  position: 'absolute', inset: 0, background: 'rgba(5,2,10,0.6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: WM.cream, fontSize: 12, fontFamily: WM.display,
                  borderRadius: 8,
                }}>+3</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '14px 20px 0' }}>
        <ReactionBar reactions={p.reactions} comments={p.comments} mine="glass"/>
      </div>

      <div style={{ padding: '18px 20px 6px' }}>
        <span style={{ fontFamily: WM.display, fontSize: 15, color: WM.cream }}>댓글 {p.comments}</span>
      </div>
      <div style={{ padding: '0 20px 30px' }}>
        <CommentRow user="suyeon" ago="2시간 전" text="라벨 정렬이 너무 깔끔하네요. 부럽다..." reactions={6}/>
        <CommentRow user="jiwon" ago="3시간 전" text="저 빈자리에 뭐 들어갈 예정인지 궁금" reactions={3}/>
        <CommentRow user="haerin" ago="5시간 전" text="우리집 셀러도 정리해야 하는데" reactions={1}/>
      </div>
    </WMScreen>
  );
}

// ──────────────────────────────────────────────────────────────
// /community/new — Compose type picker
// ──────────────────────────────────────────────────────────────
function ComposerPicker() {
  return (
    <WMScreen pad={20}>
      <div style={{
        padding: '8px 16px 12px', display: 'flex', alignItems: 'center', gap: 8,
        borderBottom: `0.5px solid ${WM.border}`,
      }}>
        <button style={iconBtn()}><Icon name="x" size={18} color={WM.textSecond}/></button>
        <div style={{ flex: 1, fontFamily: WM.display, fontSize: 16, color: WM.cream, textAlign: 'center' }}>새 글</div>
        <div style={{ width: 36 }}/>
      </div>

      <div style={{ padding: '24px 20px 0' }}>
        <div style={{ fontSize: 10, color: WM.gold, letterSpacing: '0.18em', textTransform: 'uppercase' }}>오늘은</div>
        <div style={{ fontFamily: WM.display, fontSize: 24, color: WM.cream, lineHeight: 1.2, marginTop: 6 }}>
          어떤 이야기를<br/>나누고 싶으세요?
        </div>
      </div>

      <div style={{ padding: '24px 16px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { t: 'note',     ko: '시음 노트 공유',  sub: '내 노트를 골라 공개해요',         ic: 'pencil', c: WM.gold,    badge: '+15 XP' },
          { t: 'question', ko: '질문 · 추천 요청', sub: '"··· 궁금해요" 또는 "··· 추천해주세요"', ic: 'info',   c: '#a08ee0' },
          { t: 'column',   ko: '긴 글 · 칼럼',    sub: '와이너리 방문기, 빈티지 분석',     ic: 'book',   c: WM.cream,   badge: '+25 XP' },
          { t: 'news',     ko: '업계 소식',       sub: '출시·이벤트·시음회 알림',         ic: 'sparkle',c: '#5b9ce6' },
          { t: 'album',    ko: '사진 앨범',       sub: '여러 장 + 캡션',                  ic: 'photo',  c: '#e8b4d2' },
        ].map((opt, i) => (
          <div key={i} style={{
            padding: '16px 18px', borderRadius: 14,
            background: WM.bgSurface, border: `1px solid ${WM.border}`,
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: `${opt.c}1a`, border: `1px solid ${opt.c}55`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name={opt.ic} size={20} color={opt.c}/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontFamily: WM.display, fontSize: 15, color: WM.cream }}>{opt.ko}</span>
                {opt.badge && (
                  <span style={{
                    padding: '2px 7px', borderRadius: 999,
                    background: `${WM.gold}22`, color: WM.gold, fontSize: 9, fontWeight: 600,
                  }}>{opt.badge}</span>
                )}
              </div>
              <div style={{ fontSize: 11, color: WM.textMuted, marginTop: 3 }}>{opt.sub}</div>
            </div>
            <Icon name="chevR" size={16} color={WM.textMuted}/>
          </div>
        ))}
      </div>

    </WMScreen>
  );
}

// ──────────────────────────────────────────────────────────────
// /community/new — Long column writing mode
// ──────────────────────────────────────────────────────────────
function ComposerColumn() {
  return (
    <WMScreen pad={20}>
      <div style={{
        padding: '8px 16px 12px', display: 'flex', alignItems: 'center', gap: 8,
        borderBottom: `0.5px solid ${WM.border}`,
      }}>
        <button style={iconBtn()}><Icon name="arrowL" size={18} color={WM.textSecond}/></button>
        <div style={{ flex: 1, fontFamily: WM.display, fontSize: 15, color: WM.cream, textAlign: 'center' }}>긴 글 작성</div>
        <button style={{
          padding: '7px 14px', borderRadius: 999,
          background: WM.wine, border: 'none', color: WM.cream,
          fontSize: 12, fontWeight: 600, fontFamily: WM.body,
        }}>게시</button>
      </div>

      {/* Cover image slot */}
      <div style={{
        margin: '14px 16px 0', height: 140, borderRadius: 14,
        background: WM.bgSurface, border: `1.5px dashed ${WM.border}`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
      }}>
        <Icon name="photo" size={20} color={WM.textMuted}/>
        <div style={{ fontSize: 11, color: WM.textMuted }}>커버 이미지 추가 (선택)</div>
      </div>

      {/* Title field */}
      <div style={{ padding: '20px 22px 0' }}>
        <div style={{
          fontFamily: WM.display, fontSize: 24, color: WM.cream, lineHeight: 1.25,
        }}>
          부르고뉴 도멘 르플레브 방문기 — 9월의 첫 수확
          <span style={{ display: 'inline-block', width: 2, height: 24, background: WM.gold, marginLeft: 2, verticalAlign: 'text-bottom' }}/>
        </div>
        <div style={{ fontSize: 10, color: WM.textMuted, marginTop: 4 }}>제목 · 24 / 80</div>
      </div>

      {/* Body editor */}
      <div style={{ padding: '20px 22px 0' }}>
        <div style={{
          fontFamily: WM.garamond, fontSize: 16, color: WM.cream,
          lineHeight: 1.7, fontStyle: 'italic',
        }}>
          비행기를 타고 디종, 다시 두 시간을 달려 도착한 퓔리니-몽라셰. 안 클로드의 손녀가 직접 안내해준 빈야드는 생각보다 작았고,
        </div>
        <div style={{ fontSize: 13, color: WM.textMuted, marginTop: 14, fontStyle: 'italic' }}>
          여기에 이어 쓰세요...
        </div>
      </div>

      {/* Inline wine attach card */}
      <div style={{
        margin: '20px 16px 0', padding: 14, borderRadius: 12,
        background: WM.bgSurface, border: `1px solid ${WM.gold}55`,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <Icon name="bottle" size={20} color={WM.gold}/>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: WM.cream, fontWeight: 600 }}>와인 1개 첨부됨</div>
          <div style={{ fontSize: 10, color: WM.textMuted, marginTop: 2 }}>레 퓌셀 2018 · 탭하면 와인 상세로 이동</div>
        </div>
        <Icon name="x" size={14} color={WM.textMuted}/>
      </div>

      {/* Bottom format toolbar */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        padding: '10px 12px 30px',
        background: WM.bgDeep, borderTop: `0.5px solid ${WM.border}`,
        display: 'flex', alignItems: 'center', gap: 4,
      }}>
        {[
          { ic: 'photo',     l: '사진' },
          { ic: 'bottle',    l: '와인' },
          { ic: 'pin',       l: '장소' },
          { ic: 'list',      l: '인용' },
          { ic: 'book',      l: '소제목' },
        ].map((b, i) => (
          <button key={i} style={{
            flex: 1, padding: '8px 0', borderRadius: 8,
            background: 'transparent', border: 'none',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            color: WM.textSecond, fontSize: 10, fontFamily: WM.body,
          }}>
            <Icon name={b.ic} size={16} color={WM.textSecond}/>
            {b.l}
          </button>
        ))}
        <div style={{
          width: 1, height: 28, background: WM.border, margin: '0 4px',
        }}/>
        <button style={iconBtn({ width: 36, height: 36 })}>
          <Icon name="chevD" size={16} color={WM.textMuted}/>
        </button>
      </div>
    </WMScreen>
  );
}

// ──────────────────────────────────────────────────────────────
// /community/new — Photo album composer
// ──────────────────────────────────────────────────────────────
function ComposerAlbum() {
  return (
    <WMScreen pad={20}>
      <div style={{
        padding: '8px 16px 12px', display: 'flex', alignItems: 'center', gap: 8,
        borderBottom: `0.5px solid ${WM.border}`,
      }}>
        <button style={iconBtn()}><Icon name="arrowL" size={18} color={WM.textSecond}/></button>
        <div style={{ flex: 1, fontFamily: WM.display, fontSize: 15, color: WM.cream, textAlign: 'center' }}>사진 앨범</div>
        <button style={{
          padding: '7px 14px', borderRadius: 999,
          background: WM.wine, border: 'none', color: WM.cream,
          fontSize: 12, fontWeight: 600,
        }}>게시</button>
      </div>

      {/* Photo grid */}
      <div style={{
        padding: '16px 16px 0',
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6,
      }}>
        {[1,2,3,4,5,6].map((i) => (
          <div key={i} style={{
            aspectRatio: '1/1', borderRadius: 8, position: 'relative',
            background: ['#1a0a1e','#2a141c','#3a1a26','#1a0a1e','#2a141c','#3a1a26'][i-1],
            border: `1px solid ${WM.border}`,
          }}>
            <div style={{
              position: 'absolute', inset: 10, borderRadius: 4,
              background: WINES[i-1]?.labelColor || '#f5ecd6',
            }}/>
            <div style={{
              position: 'absolute', top: 4, left: 4, width: 18, height: 18, borderRadius: 999,
              background: 'rgba(5,2,10,0.85)', color: WM.cream,
              fontSize: 10, fontFamily: WM.display, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{i}</div>
          </div>
        ))}
        {/* Add slot */}
        <div style={{
          aspectRatio: '1/1', borderRadius: 8,
          background: WM.bgSurface, border: `1.5px dashed ${WM.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="plus" size={20} color={WM.textMuted}/>
        </div>
      </div>

      {/* Caption */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ fontSize: 10, color: WM.gold, letterSpacing: '0.18em', textTransform: 'uppercase' }}>캡션</div>
        <div style={{
          marginTop: 8, padding: '14px 16px', borderRadius: 12,
          background: WM.bgSurface, border: `1px solid ${WM.border}`,
          fontFamily: WM.garamond, fontSize: 15, color: WM.cream,
          lineHeight: 1.6, fontStyle: 'italic',
        }}>
          소소한 셀러 정리의 하루. B-3 공간을 비우고 새로 들어온 6병 자리 잡기.
          <span style={{ display: 'inline-block', width: 2, height: 18, background: WM.gold, marginLeft: 2, verticalAlign: 'text-bottom' }}/>
        </div>
      </div>

      {/* Tagged wines */}
      <div style={{ padding: '18px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 10, color: WM.gold, letterSpacing: '0.18em', textTransform: 'uppercase' }}>태그된 와인</span>
          <span style={{ fontSize: 10, color: WM.textMuted }}>3개</span>
        </div>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {WINES.slice(0, 3).map(w => (
            <div key={w.id} style={{
              padding: '8px 12px 8px 8px', borderRadius: 10,
              background: WM.bgSurface, border: `1px solid ${WM.border}`,
              display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap',
            }}>
              <WMBottle wine={w} width={18} height={60}/>
              <span style={{ fontSize: 11, color: WM.cream }}>{w.nameKo.split(' ')[0]}</span>
              <Icon name="x" size={10} color={WM.textMuted}/>
            </div>
          ))}
          <button style={{
            padding: '8px 14px', borderRadius: 10,
            background: 'transparent', border: `1px dashed ${WM.border}`,
            color: WM.textMuted, fontSize: 11, whiteSpace: 'nowrap',
            display: 'inline-flex', alignItems: 'center', gap: 5,
          }}>
            <Icon name="plus" size={12} color={WM.textMuted}/> 추가
          </button>
        </div>
      </div>

      {/* Location pin */}
      <div style={{ padding: '18px 16px 0' }}>
        <div style={{
          padding: '12px 14px', borderRadius: 12,
          background: WM.bgSurface, border: `1px solid ${WM.border}`,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <Icon name="pin" size={16} color={WM.gold}/>
          <span style={{ fontSize: 12, color: WM.cream }}>장소 추가</span>
          <span style={{ flex: 1 }}/>
          <Icon name="chevR" size={14} color={WM.textMuted}/>
        </div>
      </div>
    </WMScreen>
  );
}

// ──────────────────────────────────────────────────────────────
// /community/tonight — Who's drinking tonight (signature)
// ──────────────────────────────────────────────────────────────
function TonightMapScreen() {
  const tonightEntries = [
    { user: 'jiwon',    wineId: 'rugiens',   place: '청담', placeDetail: '집',         hour: '21:42', vibe: '두 시간 디캔팅 중' },
    { user: 'mineral',  wineId: 'pucelles',  place: '한남', placeDetail: '와인바 ZIN',  hour: '21:30', vibe: '단독 시음' },
    { user: 'duckhu',   wineId: 'krug',      place: '판교', placeDetail: '집',         hour: '21:15', vibe: '기념일' },
    { user: 'haerin',   wineId: 'sancerre',  place: '강남', placeDetail: '리바이스 식당', hour: '20:55', vibe: '식사와 함께' },
    { user: 'minho',    wineId: 'pichon',    place: '성수', placeDetail: '집',         hour: '20:40', vibe: '셀러 정리 후' },
  ];
  return (
    <WMScreen pad={20}>
      <BackHeader title=""/>

      {/* Hero */}
      <div style={{ padding: '12px 22px 0' }}>
        <div style={{ fontSize: 10, color: WM.gold, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
          오늘 밤 · 21:47 기준
        </div>
        <div style={{ fontFamily: WM.display, fontSize: 26, color: WM.cream, marginTop: 6, lineHeight: 1.15, fontStyle: 'italic' }}>
          <span style={{ color: WM.gold }}>14명</span>이<br/>한 잔을 들고 있어요
        </div>
        <div style={{ fontSize: 12, color: WM.textMuted, marginTop: 8 }}>
          청담 · 한남 · 판교 · 성수 · 강남
        </div>
      </div>

      {/* Stylized Seoul map / dots */}
      <div style={{
        margin: '16px 16px 0', height: 220, borderRadius: 16, overflow: 'hidden',
        background: WM.bgMap, border: `1px solid ${WM.border}`, position: 'relative',
      }}>
        <svg width="100%" height="220" viewBox="0 0 358 220" preserveAspectRatio="xMidYMid slice">
          <defs>
            <radialGradient id="seoulBg">
              <stop offset="0%" stopColor="#2a141c"/>
              <stop offset="100%" stopColor="#0a050f"/>
            </radialGradient>
            <pattern id="grid2" patternUnits="userSpaceOnUse" width="30" height="30">
              <path d="M 30 0 L 0 0 0 30" stroke="rgba(245,240,232,0.05)" strokeWidth="0.4" fill="none"/>
            </pattern>
            <filter id="dotglow">
              <feGaussianBlur stdDeviation="2.5"/>
            </filter>
          </defs>
          <rect width="358" height="220" fill="url(#seoulBg)"/>
          <rect width="358" height="220" fill="url(#grid2)"/>
          {/* Han River sweep */}
          <path d="M 0 130 Q 80 110 160 130 Q 240 145 358 120"
            stroke={WM.border} strokeWidth="14" fill="none" opacity="0.6"/>
          <path d="M 0 130 Q 80 110 160 130 Q 240 145 358 120"
            stroke="rgba(91,156,230,0.15)" strokeWidth="10" fill="none"/>
          <text x="280" y="118" fontFamily={WM.body} fontSize="7" fill={WM.textMuted} fontStyle="italic">한강</text>
          {/* Drinking dots */}
          {[
            { x: 240, y: 90,  u: '청담',   n: 4 },
            { x: 178, y: 95,  u: '한남',   n: 3 },
            { x: 200, y: 175, u: '판교',   n: 3 },
            { x: 280, y: 75,  u: '성수',   n: 2 },
            { x: 175, y: 140, u: '강남',   n: 2 },
          ].map((d, i) => (
            <g key={i}>
              <circle cx={d.x} cy={d.y} r={d.n * 2 + 4} fill={WM.gold} opacity="0.18" filter="url(#dotglow)"/>
              <circle cx={d.x} cy={d.y} r={Math.min(8, 3 + d.n)} fill={WM.gold}/>
              <text x={d.x} y={d.y + 1} textAnchor="middle"
                fontFamily={WM.display} fontSize="9" fill={WM.bgDeepest} fontWeight="700">{d.n}</text>
              <text x={d.x} y={d.y + d.n * 2 + 16} textAnchor="middle"
                fontFamily={WM.body} fontSize="8" fill={WM.cream}>{d.u}</text>
            </g>
          ))}
        </svg>
      </div>

      {/* Participate CTA */}
      <div style={{
        margin: '14px 16px 0', padding: '12px 14px', borderRadius: 12,
        background: `linear-gradient(135deg, ${WM.wineSoft}66, ${WM.bgSurface})`,
        border: `1px solid ${WM.gold}66`,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <Icon name="moon" size={18} color={WM.gold}/>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: WM.cream, fontWeight: 600 }}>나도 한 점 찍기</div>
          <div style={{ fontSize: 10, color: WM.textMuted, marginTop: 2 }}>지금 마시는 와인 · 위치만 살짝</div>
        </div>
        <button style={{
          padding: '8px 14px', borderRadius: 999,
          background: WM.wine, border: 'none', color: WM.cream,
          fontSize: 11, fontWeight: 600, fontFamily: WM.body,
        }}>참여</button>
      </div>

      {/* Tonight entries */}
      <div style={{ padding: '18px 20px 6px' }}>
        <div style={{ fontSize: 10, color: WM.gold, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
          이 순간의 잔들
        </div>
      </div>
      <div style={{ padding: '0 16px 30px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {tonightEntries.map((e, i) => {
          const u = COMM_USERS.find(x => x.id === e.user);
          const w = WINES.find(x => x.id === e.wineId);
          return (
            <div key={i} style={{
              padding: '10px 12px', borderRadius: 12,
              background: WM.bgSurface, border: `1px solid ${WM.border}`,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <CommUserAvatar user={e.user} size={28}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 11, color: WM.cream, fontWeight: 600 }}>{u?.name}</span>
                  <span style={{ fontSize: 10, color: WM.textMuted }}>· {e.place} · {e.hour}</span>
                </div>
                <div style={{ fontSize: 10.5, color: WM.textSecond, marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Icon name="bottle" size={10} color={WM.gold}/>
                  {w?.nameKo.split(' ').slice(0,3).join(' ')}
                </div>
                <div style={{ fontSize: 10, color: WM.textMuted, marginTop: 2, fontStyle: 'italic' }}>{e.vibe}</div>
              </div>
              <button style={{
                padding: '5px 10px', borderRadius: 999,
                background: 'transparent', border: `1px solid ${WM.gold}55`,
                color: WM.gold, fontSize: 10, fontWeight: 600,
              }}>잔 들기</button>
            </div>
          );
        })}
      </div>
    </WMScreen>
  );
}

// ──────────────────────────────────────────────────────────────
// /community/[postId]/comments — Full comments view
// ──────────────────────────────────────────────────────────────
function CommentsFullScreen() {
  return (
    <WMScreen pad={20}>
      <BackHeader title="댓글 23"/>

      {/* Compact post header */}
      <div style={{
        padding: '12px 16px', borderBottom: `0.5px solid ${WM.border}`,
        background: WM.bgSurface,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CommUserAvatar user="haerin" size={24}/>
          <span style={{ fontSize: 11, color: WM.textMuted }}>정해린 · 37분 전</span>
        </div>
        <div style={{ fontFamily: WM.display, fontSize: 13, color: WM.cream, marginTop: 6, lineHeight: 1.3 }}>
          결혼식에 손님 30분께 낼 와인, 추천 부탁드려요
        </div>
      </div>

      {/* Sort */}
      <div style={{
        padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 14,
        borderBottom: `0.5px solid ${WM.border}`,
      }}>
        <span style={{ fontSize: 11, color: WM.gold, fontWeight: 600 }}>도움 순</span>
        <span style={{ fontSize: 11, color: WM.textMuted }}>최신 순</span>
        <span style={{ flex: 1 }}/>
        <span style={{ fontSize: 11, color: WM.textMuted }}>전문가만</span>
      </div>

      {/* All comments */}
      <div style={{ padding: '0 20px 100px' }}>
        <CommentRow user="sommelier" ago="20분 전"
          text="식사 메뉴를 먼저 알려주시면 더 좋겠지만, 일반적인 결혼식 코스라면 화이트는 상세르나 푸이-퓌메, 레드는 영 부르고뉴(예: 자크 까샤르 부르고뉴 루즈)나 토스카나 산조베제(키안티 클라시코) 추천드려요."
          reactions={28} expert/>
        <CommentRow user="jiwon" ago="22분 전" text="저도 동의합니다. 키안티 클라시코는 거의 만능이에요." reactions={11} isReply/>
        <CommentRow user="haerin" ago="25분 전" text="감사합니다! 식사는 한식 코스예요." reactions={2} isReply/>
        <CommentRow user="duckhu" ago="35분 전" text="크레망 부르고뉴를 빼지 마세요. 한 잔으로 시작하기에 너무 좋아요." reactions={14}/>
        <CommentRow user="mineral" ago="42분 전" text="피카르의 부르고뉴 알리고떼 정말 좋습니다. 가격 대비 만족도 최고예요." reactions={9}/>
        <CommentRow user="minho" ago="48분 전" text="알자스 리슬링도 한식과 좋아요. 단맛이 살짝 도는 게 잘 어울려요." reactions={6}/>
        <CommentRow user="suyeon" ago="1시간 전" text="결혼식 정말 축하드려요" reactions={3}/>
      </div>

      {/* Compose footer */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        padding: '10px 16px 30px',
        background: WM.bgDeep, borderTop: `0.5px solid ${WM.border}`,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <CommUserAvatar user="suyeon" size={32}/>
        <div style={{
          flex: 1, height: 38, borderRadius: 999,
          background: WM.bgSurface, border: `1px solid ${WM.border}`,
          display: 'flex', alignItems: 'center', padding: '0 14px',
          fontSize: 12, color: WM.textMuted,
        }}>답글 남기기...</div>
        <button style={{
          width: 38, height: 38, borderRadius: 999,
          background: WM.wine, border: 'none', color: WM.cream,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="arrowR" size={16} color={WM.cream}/>
        </button>
      </div>
    </WMScreen>
  );
}

// ──────────────────────────────────────────────────────────────
// /community/discover — Suggested users to follow
// ──────────────────────────────────────────────────────────────
function DiscoverUsersScreen() {
  return (
    <WMScreen pad={20}>
      <BackHeader title="팔로우 추천"/>

      <div style={{ padding: '14px 22px 0' }}>
        <div style={{ fontFamily: WM.display, fontSize: 22, color: WM.cream, lineHeight: 1.2 }}>
          당신의 취향과<br/><span style={{ color: WM.gold, fontStyle: 'italic' }}>가까운 사람들</span>
        </div>
        <div style={{ fontSize: 12, color: WM.textMuted, marginTop: 8 }}>
          마신 와인 · 지역 · 평점 패턴이 비슷한 사용자
        </div>
      </div>

      <div style={{ padding: '20px 16px 30px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { user: 'jiwon',    pct: 84, shared: '레 루지엥 · 사시카이아 · 피숑 바롱',  sub: '부르고뉴 · 보르도 중심' },
          { user: 'mineral',  pct: 76, shared: '레 퓌셀 · 상세르 · 샤블리',           sub: '미네랄 화이트 전문' },
          { user: 'sommelier',pct: 72, shared: '14종 공통',                           sub: '함소믈리에 · 마스터' },
          { user: 'duckhu',   pct: 68, shared: '크룩 · 빈티지 샴페인',                sub: '샹파뉴 컬렉터' },
          { user: 'minho',    pct: 58, shared: '키안티 · 산조베제',                    sub: '이탈리아 레드' },
        ].map((row, i) => {
          const u = COMM_USERS.find(x => x.id === row.user);
          return (
            <div key={i} style={{
              padding: '14px 16px', borderRadius: 14,
              background: WM.bgSurface, border: `1px solid ${WM.border}`,
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <CommUserAvatar user={row.user} size={48}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontFamily: WM.display, fontSize: 14, color: WM.cream }}>{u?.name}</span>
                  <LevelPill level={u?.level} compact/>
                </div>
                <div style={{ fontSize: 10, color: WM.textMuted, marginTop: 3 }}>{row.sub}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6 }}>
                  <div style={{
                    height: 4, width: 56, borderRadius: 999,
                    background: WM.bgDeep, overflow: 'hidden',
                  }}>
                    <div style={{ width: `${row.pct}%`, height: '100%', background: WM.gold }}/>
                  </div>
                  <span style={{ fontSize: 10, color: WM.gold, fontWeight: 600 }}>{row.pct}% 일치</span>
                </div>
              </div>
              <button style={{
                padding: '8px 14px', borderRadius: 999,
                background: i === 0 ? WM.wine : 'transparent',
                border: `1px solid ${i === 0 ? WM.wine : WM.gold}`,
                color: i === 0 ? WM.cream : WM.gold,
                fontSize: 11, fontWeight: 600, fontFamily: WM.body,
              }}>{i === 0 ? '팔로잉' : '팔로우'}</button>
            </div>
          );
        })}
      </div>
    </WMScreen>
  );
}

Object.assign(window, {
  CommUserAvatar, CommUserRow, PostTypeBadge, ReactionBar, WineEmbedCard, CommentRow,
  CommFeedCard, CommFeedRow,
  CommunityFeedFollowing, CommunityFeedAll, CommunityFeedTrending,
  PostDetailNote, PostDetailColumn, PostDetailQuestion, PostDetailAlbum,
  ComposerPicker, ComposerColumn, ComposerAlbum,
  TonightMapScreen, CommentsFullScreen, DiscoverUsersScreen,
  COMM_USERS, COMM_POSTS,
});
