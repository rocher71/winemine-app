// wm-lists-shared.jsx
// Shared primitives for the "와인 리스트" feature design.
// Inherits tokens from wm-tasted-shared (WT) — cream parchment,
// burgundy ink, gold accent. No emoji; lucide-react icon names.

// ──────────────────────────────────────────────────────────────
// Lucide-style icon
// ──────────────────────────────────────────────────────────────
function Icon({ name, size = 16, color = '#1F1A14', sw = 1.7, fill = 'none' }) {
  const c = {
    width: size, height: size, viewBox: '0 0 24 24', fill,
    stroke: color, strokeWidth: sw, strokeLinecap: 'round', strokeLinejoin: 'round',
    style: { display: 'block', flex: 'none' },
  };
  const P = {
    'bookmark':       <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>,
    'bookmark-plus': <><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/><path d="M12 7v6M9 10h6"/></>,
    'bookmark-check':<><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/><path d="m9 10 2 2 4-4"/></>,
    'copy':          <><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></>,
    'copy-plus':     <><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/><path d="M14.5 14.5v2M13.5 15.5h2"/></>,
    'lock':          <><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></>,
    'globe':         <><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18"/></>,
    'heart':         <path d="M12 21s-7-4.5-9.5-9C1 9 2.5 5 6.5 5c2 0 3.5 1 5.5 3 2-2 3.5-3 5.5-3 4 0 5.5 4 4 7-2.5 4.5-9.5 9-9.5 9z"/>,
    'message':       <path d="M21 12c0 4.4-4 8-9 8-1.5 0-2.9-.3-4.1-.9L3 21l1.4-4C3.5 15.6 3 13.9 3 12c0-4.4 4-8 9-8s9 3.6 9 8z"/>,
    'share':         <><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="m8.2 10.8 7.6-3.6M8.2 13.2l7.6 3.6"/></>,
    'plus':          <><path d="M12 5v14M5 12h14"/></>,
    'search':        <><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>,
    'grip':          <><circle cx="9" cy="6" r="1" fill={color} stroke="none"/><circle cx="9" cy="12" r="1" fill={color} stroke="none"/><circle cx="9" cy="18" r="1" fill={color} stroke="none"/><circle cx="15" cy="6" r="1" fill={color} stroke="none"/><circle cx="15" cy="12" r="1" fill={color} stroke="none"/><circle cx="15" cy="18" r="1" fill={color} stroke="none"/></>,
    'chev-l':        <path d="m15 18-6-6 6-6"/>,
    'chev-r':        <path d="m9 6 6 6-6 6"/>,
    'sparkles':      <><path d="M12 3l1.8 4.5L18 9l-4.2 1.5L12 15l-1.8-4.5L6 9l4.2-1.5z"/><path d="M19 14l.8 2L22 17l-2.2 1L19 20l-.8-2L16 17l2.2-1z"/></>,
    'list':          <><path d="M8 6h13M8 12h13M8 18h13"/><circle cx="4" cy="6" r="1" fill={color} stroke="none"/><circle cx="4" cy="12" r="1" fill={color} stroke="none"/><circle cx="4" cy="18" r="1" fill={color} stroke="none"/></>,
    'x':             <path d="M6 6 18 18M18 6 6 18"/>,
    'check':         <path d="m5 12 4 4 10-11"/>,
    'alert':         <><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></>,
    'users':         <><circle cx="9" cy="9" r="3.2"/><path d="M3 19c0.6-3 3-5 6-5s5.4 2 6 5"/><circle cx="17" cy="10" r="2.4"/><path d="M15.5 19c.4-2.2 2-3.8 4-3.8"/></>,
    'more':          <><circle cx="5" cy="12" r="1.2" fill={color} stroke="none"/><circle cx="12" cy="12" r="1.2" fill={color} stroke="none"/><circle cx="19" cy="12" r="1.2" fill={color} stroke="none"/></>,
    'send':          <><path d="m22 2-11 11"/><path d="M22 2 15 22l-4-9-9-4z"/></>,
    'edit':          <><path d="M11 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/><path d="m18.5 2.5 3 3L12 15l-4 1 1-4z"/></>,
    'info':          <><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></>,
    'arr-r':         <><path d="M5 12h14M13 6l6 6-6 6"/></>,
    'pin':           <><path d="M12 17v5"/><path d="M5 10V5h14v5l-3 4H8z"/></>,
    'layers':        <><path d="M12 2 2 8l10 6 10-6z"/><path d="m2 16 10 6 10-6"/><path d="m2 12 10 6 10-6"/></>,
    'bottle':        <><path d="M10 2h4v4l1 2v12a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V8z"/></>,
    'eye-off':       <><path d="M3 3l18 18"/><path d="M10.6 5.1A11 11 0 0 1 22 12c-.7 1.3-1.6 2.5-2.6 3.5M14 14a3 3 0 0 1-4-4"/><path d="M6.7 6.7C4.8 8 3.2 9.9 2 12c2 3.5 5.6 7 10 7 1.9 0 3.7-.7 5.3-1.7"/></>,
    'eye':           <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></>,
    'bell':          <><path d="M6 16V10a6 6 0 0 1 12 0v6l1.5 2H4.5z"/><path d="M10 19a2 2 0 0 0 4 0"/></>,
    'thumb':         <><path d="M7 11v9H4a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1z"/><path d="M7 11l4-7c1.5 0 2.5 1 2.5 2.5V10h5a2 2 0 0 1 2 2.2l-.8 6.5a2 2 0 0 1-2 1.8H7"/></>,
  };
  return <svg {...c}>{P[name]}</svg>;
}

// ──────────────────────────────────────────────────────────────
// Level pill — matches existing "마스터/감식가" chip style.
// Levels: 입문자 · 애호가 · 감식가 · 소믈리에 · 마스터
// ──────────────────────────────────────────────────────────────
const LEVEL_STYLE = {
  '입문자':   { fg: '#6E5F4B', bg: '#EFE6D1' }, // muted clay
  '애호가':   { fg: '#3D5A4E', bg: '#DDE7DD' }, // sage
  '감식가':   { fg: '#5A5752', bg: '#E3DED5' }, // neutral stone
  '소믈리에': { fg: '#7A5C12', bg: '#F3E6BE' }, // gold-tinted
  '마스터':   { fg: '#7A1E2D', bg: '#F1D9DC' }, // burgundy wash
};
function LevelPill({ level = '감식가', size = 'sm' }) {
  const s = LEVEL_STYLE[level] || LEVEL_STYLE['감식가'];
  const isS = size === 'sm';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: isS ? '2px 8px' : '3px 10px',
      borderRadius: 999,
      background: s.bg, color: s.fg,
      fontFamily: WT.body,
      fontSize: isS ? 10.5 : 12,
      fontWeight: 600, letterSpacing: '-0.005em',
      lineHeight: 1.4,
    }}>{level}</span>
  );
}

// ──────────────────────────────────────────────────────────────
// Tiny bottle silhouette — used for list thumbnail stacks
// ──────────────────────────────────────────────────────────────
function TinyBottle({ w = 18, h = 60, color = '#3A1620', label = '#F5EBD8' }) {
  return (
    <svg width={w} height={h} viewBox="0 0 18 60" style={{ display: 'block' }}>
      <defs>
        <linearGradient id={`tb-${color.slice(1)}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.8"/>
          <stop offset="0.5" stopColor={color}/>
          <stop offset="1" stopColor="#180A0E"/>
        </linearGradient>
      </defs>
      <rect x="6" y="0" width="6" height="10" rx="0.5" fill="#160809"/>
      <path d="M6 8 H12 V14 Q14 18 14 22 V57 Q14 60 12 60 H6 Q4 60 4 57 V22 Q4 18 6 14 Z"
        fill={`url(#tb-${color.slice(1)})`}/>
      <rect x="5" y="34" width="8" height="14" rx="0.5" fill={label}/>
      <rect x="5" y="34" width="8" height="14" rx="0.5" fill="none" stroke="#000" strokeOpacity="0.08"/>
    </svg>
  );
}

// ──────────────────────────────────────────────────────────────
// Hero shelf — used inside list cards. Shows N overlapping
// bottles on the same warm pinkish gradient as the wine cards.
// ──────────────────────────────────────────────────────────────
function ListShelf({ colors = ['#3A1620','#4A1820','#2A0B14','#5A2030'], height = 132, tilt = false, accent = 'pink' }) {
  const id = 'ls-' + Math.random().toString(36).slice(2,7);
  const gradients = {
    pink:  ['#F7EFE8', '#F2E4E2', '#E6D2D3'],
    cream: ['#FBF6EA', '#F0E4C5', '#E5D29A'],
    rose:  ['#F7E8E8', '#E8C8C8', '#D89C9C'],
    sage:  ['#EDF1E6', '#D7E0CB', '#B9C5A6'],
  };
  const g = gradients[accent] || gradients.pink;
  return (
    <div style={{ position: 'relative', height, overflow: 'hidden' }}>
      <svg width="100%" height={height} viewBox={`0 0 320 ${height}`} preserveAspectRatio="xMidYMid slice" style={{ display: 'block' }}>
        <defs>
          <radialGradient id={`${id}-bg`} cx="38%" cy="22%" r="95%">
            <stop offset="0"   stopColor={g[0]}/>
            <stop offset="0.45" stopColor={g[1]}/>
            <stop offset="1"   stopColor={g[2]}/>
          </radialGradient>
        </defs>
        <rect width="320" height={height} fill={`url(#${id}-bg)`}/>
        <ellipse cx="100" cy="20" rx="120" ry="36" fill="#FFF" opacity="0.32"/>
        {colors.slice(0,4).map((col, i) => {
          const N = Math.min(colors.length, 4);
          const cx = 160 + (i - (N-1)/2) * 38;
          const tiltDeg = tilt ? (i - (N-1)/2) * 4 : 0;
          const bottleH = 110;
          const bottleW = 26;
          const y = (height - bottleH) / 2 + 8;
          return (
            <g key={i} transform={`translate(${cx - bottleW/2} ${y}) rotate(${tiltDeg} ${bottleW/2} ${bottleH/2})`}>
              <rect x={bottleW/2 - 3.5} y="0" width="7" height="14" rx="0.8" fill="#160809"/>
              <path d={`M${bottleW/2 - 3.5} 12 H${bottleW/2 + 3.5} V20 Q${bottleW/2 + 5.5} 24 ${bottleW/2 + 5.5} 30 V${bottleH-3} Q${bottleW/2 + 5.5} ${bottleH} ${bottleW/2 + 2.5} ${bottleH} H${bottleW/2 - 2.5} Q${bottleW/2 - 5.5} ${bottleH} ${bottleW/2 - 5.5} ${bottleH-3} V30 Q${bottleW/2 - 5.5} 24 ${bottleW/2 - 3.5} 20 Z`}
                fill={col} opacity={0.95}/>
              <rect x={bottleW/2 - 4.5} y="60" width="9" height="18" rx="0.5" fill="#F5EBD8" opacity="0.9"/>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Sample data
// ──────────────────────────────────────────────────────────────
const MY_LISTS = [
  {
    id: 'l1', title: '보르도 좌안 vs 우안',
    desc: '같은 빈티지로 마셔본 메독·생테밀리옹 비교 기록',
    count: 12, visibility: 'private', accent: 'pink',
    bottles: ['#3A1620','#4A1820','#2A0B14','#5A2030'],
    updated: '3일 전',
    sample: [
      { name: '샤토 마고', producer: 'Château Margaux', vintage: 2015 },
      { name: '샤토 파비', producer: 'Château Pavie', vintage: 2015 },
      { name: '레오빌 라스 카즈', producer: 'Léoville Las Cases', vintage: 2015 },
    ],
  },
  {
    id: 'l2', title: '여름 화이트 베이직',
    desc: '5만 원대 이하 · 가벼운 식사 어울림',
    count: 8, visibility: 'public', accent: 'cream',
    bottles: ['#7A6634','#9C8240','#5E4F26','#A98D45'],
    updated: '지난주',
    savedBy: 14,
    sample: [
      { name: '뮈스카데 세브르 에 멘', producer: 'Domaine de la Pépière', vintage: 2022 },
      { name: '피크풀 드 피네', producer: 'Hugues Beaulieu', vintage: 2022 },
      { name: '뤼팽지 그뤼너', producer: 'Lupingi', vintage: 2023 },
    ],
  },
  {
    id: 'l3', title: '결혼식 손님께 — 30분짜리',
    desc: '아페리티프부터 데세르까지 흐름 잡은 6병',
    count: 6, visibility: 'public', accent: 'rose',
    bottles: ['#3A1620','#5A2030','#7A2D40'],
    updated: '2주 전',
    savedBy: 3,
    sample: [
      { name: '뵈브 클리코 옐로 라벨', producer: 'Veuve Clicquot', vintage: null },
      { name: '도멘 르 모앙 마콩', producer: 'Le Moine', vintage: 2022 },
      { name: '바롤로 만조네', producer: 'Manzone', vintage: 2018 },
    ],
  },
  {
    id: 'l4', title: '디캔팅 2시간 이상',
    desc: '',
    count: 5, visibility: 'private', accent: 'sage',
    bottles: ['#2A0B14','#1A0A0F','#3A1018'],
    updated: '한 달 전',
    sample: [
      { name: '바롤로 몬프리바토', producer: 'Giuseppe Mascarello', vintage: 2016 },
      { name: '바르바레스코 산토 스테파노', producer: 'Castello di Neive', vintage: 2017 },
      { name: '에르미타주 라 샤펠', producer: 'Paul Jaboulet', vintage: 2017 },
    ],
  },
];

// Public list (Screen 2) — by another user
const PUBLIC_LIST = {
  id: 'pl1',
  title: '첫 부르고뉴 10병',
  desc: '입문자가 한 해 안에 마실 만한 마을 단위 부르고뉴. 가격은 12–28만 원 사이로 묶었어요. 마실 때 글래스 형태가 중요한 와인만 추렸습니다.',
  author: { name: '함소믈리에', level: '마스터', init: '함', c: '#7A1E2D' },
  stats: { likes: 248, comments: 34, saves: 612 },
  wines: [
    { name: '루이 자도 부르고뉴 루즈', producer: 'Louis Jadot', vintage: 2020, region: 'Bourgogne · France', note: '입문 1병', color: '#4A1820' },
    { name: '도멘 페블레 메르소', producer: 'Domaine Faiveley', vintage: 2021, region: 'Meursault · France', note: '오크 학습', color: '#9C8240' },
    { name: '도멘 르 모앙 부조', producer: 'Domaine Le Moine', vintage: 2019, region: 'Vougeot · France', note: '', color: '#3A1620' },
    { name: '도멘 뒤졸리에 샤사뉴', producer: 'Dujolier', vintage: 2020, region: 'Chassagne · France', note: '', color: '#A98D45' },
    { name: '루이 라투르 알록스 코르통', producer: 'Louis Latour', vintage: 2018, region: 'Aloxe-Corton · France', note: '디캔팅 90분', color: '#2A0B14' },
    { name: '도멘 미셸 그로 본 로마네', producer: 'Michel Gros', vintage: 2019, region: 'Vosne-Romanée · France', note: '추천 정점', color: '#3A1018' },
    { name: '메오 카뮈제 닥스 자크', producer: 'Méo-Camuzet', vintage: 2020, region: 'Nuits-Saint-Georges · France', note: '', color: '#4A1820' },
    { name: '도멘 트라페 마르사네', producer: 'Domaine Trapet', vintage: 2020, region: 'Marsannay · France', note: '데일리', color: '#5A2030' },
    { name: '도멘 라몬느 샤사뉴 1er', producer: 'Ramonet', vintage: 2019, region: 'Chassagne 1er · France', note: '특별한 날', color: '#7A6634' },
    { name: '도멘 룸론 본 1er 클로 데 레아', producer: 'Lamarche', vintage: 2018, region: 'Vosne 1er · France', note: '', color: '#3A1620' },
  ],
};

// My own list (Screen "내 리스트 상세")
const MY_LIST_DETAIL = {
  id: 'ml1',
  title: '보르도 좌안 vs 우안',
  desc: '같은 빈티지로 마셔본 메독·생테밀리옹 비교 기록. 카베르네 vs 메를로 비중이 향과 구조에 미치는 영향을 정리하는 중입니다.',
  visibility: 'private',
  updated: '3일 전',
  createdAt: '2024년 11월',
  count: 12,
  views: 0,
  savedBy: 0,
  wines: [
    { name: '샤토 마고', producer: 'Château Margaux', vintage: 2015, region: 'Margaux · Bordeaux', note: '좌안 기준점', tasted: true },
    { name: '샤토 파비', producer: 'Château Pavie', vintage: 2015, region: 'Saint-Émilion · Bordeaux', note: '우안 비교군', tasted: true },
    { name: '레오빌 라스 카즈', producer: 'Léoville Las Cases', vintage: 2015, region: 'Saint-Julien · Bordeaux', note: '디캔팅 90분', tasted: true },
    { name: '샤토 슈발 블랑', producer: 'Cheval Blanc', vintage: 2014, region: 'Saint-Émilion · Bordeaux', note: '', tasted: false },
    { name: '샤토 라피트 로칠드', producer: 'Lafite Rothschild', vintage: 2016, region: 'Pauillac · Bordeaux', note: '', tasted: false },
    { name: '샤토 페트뤼스', producer: 'Petrus', vintage: 2015, region: 'Pomerol · Bordeaux', note: '메를로 100%', tasted: false },
  ],
};

// Q&A post (Screen 5)
const QA_POST = {
  type: '질문',
  user: { name: '정해린', level: '감식가', init: '정', c: '#6B6055' },
  ago: '2일 전',
  title: '결혼식 손님 30분께 낼 와인 추천 부탁드려요',
  body: '예산 병당 7–9만 원. 가벼운 화이트 + 미디엄 레드 한 종씩 생각 중인데, 의외로 어렵네요. 너무 드라이하지 않으면서 식사와 잘 어울리는 와인 추천 받습니다.',
  recommended: [
    { name: '도멘 르 모앙 마콩 빌라쥬', producer: 'Le Moine', vintage: 2022, votes: 18, color: '#9C8240' },
    { name: '도멘 그라티앙 보졸레 빌라쥬', producer: 'Gratien', vintage: 2021, votes: 14, color: '#5A2030' },
    { name: '샤토 무통 카데 블랑', producer: 'Mouton Cadet', vintage: 2021, votes: 11, color: '#A98D45' },
    { name: '비냐 콘차 이 토로 카사 레알', producer: 'Concha y Toro', vintage: 2020, votes: 9, color: '#4A1820' },
    { name: '아르몽 드 브리뇰', producer: 'Armand', vintage: 2020, votes: 7, color: '#3A1018' },
  ],
};

Object.assign(window, {
  Icon, LevelPill, TinyBottle, ListShelf,
  MY_LISTS, PUBLIC_LIST, MY_LIST_DETAIL, QA_POST, LEVEL_STYLE,
});
