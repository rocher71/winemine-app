// wm-lists-screens.jsx
// 7 screens for the winemine 와인 리스트 feature.
// Loads WT tokens + WTStatusBar/WTTopHeader/WTBottomNav from
// wm-tasted-shared, and Icon/LevelPill/ListShelf/TinyBottle
// from wm-lists-shared.

// ──────────────────────────────────────────────────────────────
// Phone shell
// ──────────────────────────────────────────────────────────────
function Phone({ children }) {
  return (
    <div style={{
      position: 'relative', width: 390, height: 844,
      borderRadius: 48, overflow: 'hidden',
      background: '#000',
      boxShadow: '0 20px 50px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.12)',
    }}>
      <div style={{
        position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)',
        width: 126, height: 37, borderRadius: 24, background: '#000', zIndex: 50,
      }}/>
      <div style={{
        position: 'absolute', inset: 0, background: WT.bg,
      }}>{children}</div>
      <div style={{
        position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
        width: 139, height: 5, borderRadius: 100,
        background: 'rgba(0,0,0,0.45)', zIndex: 60,
      }}/>
    </div>
  );
}
const PhoneSlot = ({ children }) => (
  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Phone>{children}</Phone>
  </div>
);

// Avatar (initial circle)
function Avatar({ user, size = 36 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 999,
      background: user.c, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: WT.body, fontSize: size * 0.42, fontWeight: 600,
      flex: 'none', letterSpacing: '-0.02em',
    }}>{user.init}</div>
  );
}

// ════════════════════════════════════════════════════════════════
// SCREEN 1 — 셀러 탭 · 리스트 탭
// ════════════════════════════════════════════════════════════════
function ListCard({ item }) {
  const accentColors = {
    pink:  '#7A1E2D',
    cream: '#9C8240',
    rose:  '#8B4458',
    sage:  '#4A6253',
  };
  const accent = accentColors[item.accent] || WT.burgundy;
  return (
    <div style={{
      background: WT.card, borderRadius: 16,
      border: `1px solid ${WT.border}`,
      overflow: 'hidden',
      boxShadow: '0 1px 2px rgba(31,18,12,0.04), 0 8px 16px -10px rgba(31,18,12,0.08)',
      position: 'relative',
    }}>
      {/* left accent stripe */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
        background: accent,
      }}/>

      <div style={{ padding: '12px 14px 12px 18px' }}>
        {/* header: title + privacy chip */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: WT.display, fontStyle: 'italic', fontSize: 20,
              color: WT.ink, fontWeight: 600, letterSpacing: '-0.015em', lineHeight: 1.2,
            }}>{item.title}</div>
            {item.desc && (
              <div style={{
                marginTop: 3, fontSize: 11.5, color: WT.muted, lineHeight: 1.45,
                display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden',
              }}>{item.desc}</div>
            )}
          </div>
          <div style={{
            flex: 'none',
            width: 24, height: 24, borderRadius: 999,
            background: WT.cardSoft, border: `1px solid ${WT.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name={item.visibility === 'public' ? 'globe' : 'lock'}
              size={11} color={item.visibility === 'public' ? WT.goldSoft : WT.ink2} sw={1.9}/>
          </div>
        </div>

        {/* footer */}
        <div style={{
          marginTop: 12,
          display: 'flex', alignItems: 'center', gap: 10,
          fontSize: 11, color: WT.muted, fontWeight: 500,
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <b style={{ color: WT.ink, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{item.count}</b>
            <span>병</span>
          </span>
          <span style={{ width: 2, height: 2, borderRadius: 999, background: WT.faint }}/>
          <span>{item.updated}</span>
          <span style={{ flex: 1 }}/>
          {item.savedBy && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: WT.burgundy, fontWeight: 700 }}>
              <Icon name="bookmark" size={11} color={WT.burgundy} sw={2}/>
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>{item.savedBy}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function ScreenLists() {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <WTStatusBar time="5:45"/>
      <WTTopHeader eyebrow="셀러" title="내 셀러" unread/>

      {/* 3-tab segment (now with 리스트 added) */}
      <div style={{ padding: '0 24px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          display: 'inline-flex', padding: 4, borderRadius: 999,
          background: '#FFFFFF', border: `1px solid ${WT.border}`,
          boxShadow: '0 1px 2px rgba(31,26,20,0.04)',
        }}>
          {[
            { id: 'cellar', label: '셀러',     count: 28, on: false },
            { id: 'tasted', label: '마신 와인', count: 9,  on: false },
            { id: 'list',   label: '리스트',   count: 4,  on: true  },
          ].map(s => (
            <div key={s.id} style={{
              padding: '7px 13px', borderRadius: 999,
              background: s.on ? WT.burgundy : 'transparent',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{
                fontSize: 13, fontWeight: 600, letterSpacing: '-0.005em',
                color: s.on ? '#FFFFFF' : WT.ink,
              }}>{s.label}</span>
              <span style={{
                fontSize: 12, fontWeight: 500,
                color: s.on ? '#E8C77A' : WT.muted,
                fontVariantNumeric: 'tabular-nums',
              }}>{s.count}</span>
            </div>
          ))}
        </div>
        <div style={{ flex: 1 }}/>
      </div>

      {/* Count + sort */}
      <div style={{
        padding: '0 24px 12px', display: 'flex', alignItems: 'center',
      }}>
        <span style={{ fontSize: 12, color: WT.muted, fontWeight: 500 }}>총 4개의 리스트</span>
        <div style={{ flex: 1 }}/>
        <span style={{ fontSize: 12, color: WT.ink2, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
          최근 수정순
          <Icon name="chev-r" size={11} color={WT.ink2} sw={2.2}/>
        </span>
      </div>

      {/* List cards */}
      <div style={{
        flex: 1, padding: '0 16px', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        {MY_LISTS.map(it => <ListCard key={it.id} item={it}/>)}
      </div>

      {/* FAB */}
      <button style={{
        position: 'absolute', right: 18, bottom: 102,
        height: 52, padding: '0 20px 0 16px', borderRadius: 999,
        background: `linear-gradient(135deg, ${WT.burgundy}, ${WT.burgundyD})`,
        border: 'none', color: '#fff',
        display: 'flex', alignItems: 'center', gap: 8,
        fontFamily: WT.body, fontSize: 14, fontWeight: 700, letterSpacing: '-0.005em',
        boxShadow: '0 10px 22px -6px rgba(122,30,45,0.55), 0 2px 6px rgba(122,30,45,0.30), inset 0 1px 0 rgba(255,255,255,0.18)',
        cursor: 'pointer',
      }}>
        <Icon name="plus" size={18} color="#fff" sw={2.6}/>
        새 리스트
      </button>

      <WTBottomNav active="cellar"/>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// SCREEN 2 — 공개 리스트 상세
// ════════════════════════════════════════════════════════════════
function PublicListWineRow({ wine, idx }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '14px 0',
      borderBottom: `0.5px solid ${WT.border}`,
      cursor: 'pointer',
    }}>
      <span style={{
        fontFamily: WT.display, fontSize: 14, fontStyle: 'italic',
        color: WT.goldSoft, minWidth: 22, textAlign: 'right', fontWeight: 500,
        fontVariantNumeric: 'lnum',
      }}>{String(idx + 1).padStart(2,'0')}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: WT.body, fontSize: 13.5, color: WT.ink,
          fontWeight: 700, letterSpacing: '-0.005em', lineHeight: 1.3,
        }}>{wine.name}</div>
        <div style={{ fontSize: 11, color: WT.muted, marginTop: 2, lineHeight: 1.4 }}>
          {wine.producer} · {wine.vintage} · <i>{wine.region}</i>
        </div>
      </div>
      <Icon name="chev-r" size={16} color={WT.faint} sw={1.8}/>
    </div>
  );
}

function ScreenListDetail() {
  const list = PUBLIC_LIST;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <WTStatusBar time="5:45"/>

      {/* Top bar */}
      <div style={{ padding: '6px 16px 8px', display: 'flex', alignItems: 'center', gap: 6 }}>
        <button style={iconBtnSty()}><Icon name="chev-l" size={20} color={WT.ink} sw={2.2}/></button>
        <div style={{ flex: 1 }}/>
        <button style={iconBtnSty()}><Icon name="share" size={17} color={WT.ink2}/></button>
        <button style={iconBtnSty()}><Icon name="more" size={17} color={WT.ink2}/></button>
      </div>

      {/* Body scroll area */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Hero */}
        <div style={{ padding: '4px 24px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="layers" size={12} color={WT.goldSoft} sw={2}/>
            <span style={{
              fontSize: 10, color: WT.goldSoft, letterSpacing: '0.22em',
              textTransform: 'uppercase', fontWeight: 700,
            }}>공개 리스트</span>
          </div>
          <div style={{
            marginTop: 8,
            fontFamily: WT.display, fontSize: 32, color: WT.ink,
            fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.1,
            fontStyle: 'italic',
          }}>{list.title}</div>

          {/* Creator */}
          <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar user={list.author} size={36}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 13, color: WT.ink, fontWeight: 700 }}>{list.author.name}</span>
                <LevelPill level={list.author.level}/>
              </div>
              <div style={{ fontSize: 11, color: WT.muted, marginTop: 1 }}>
                마지막 수정 2주 전 · 10병
              </div>
            </div>
            <button style={{
              padding: '7px 14px', borderRadius: 999,
              background: WT.cardSoft, border: `1px solid ${WT.border}`,
              color: WT.ink, fontSize: 12, fontWeight: 700, cursor: 'pointer',
            }}>팔로우</button>
          </div>

          {/* Description */}
          <div style={{
            marginTop: 14, fontSize: 13, color: WT.ink2, lineHeight: 1.6,
            fontStyle: 'italic',
            paddingLeft: 12,
            borderLeft: `2px solid ${WT.gold}`,
          }}>{list.desc}</div>

          {/* Stats row */}
          <div style={{
            marginTop: 16, padding: '12px 0',
            display: 'flex', alignItems: 'center', gap: 0,
            borderTop: `0.5px solid ${WT.border}`,
            borderBottom: `0.5px solid ${WT.border}`,
          }}>
            {[
              { ic: 'heart',   n: list.stats.likes,    l: '좋아요' },
              { ic: 'message', n: list.stats.comments, l: '댓글' },
              { ic: 'bookmark',n: list.stats.saves,    l: '저장됨' },
            ].map((s, i) => (
              <div key={s.l} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                borderLeft: i > 0 ? `0.5px solid ${WT.border}` : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Icon name={s.ic} size={12} color={WT.goldSoft} sw={2}/>
                  <span style={{ fontFamily: WT.body, fontSize: 15, color: WT.ink, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{s.n}</span>
                </div>
                <span style={{ fontSize: 10.5, color: WT.muted, fontWeight: 500 }}>{s.l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Wine list */}
        <div style={{
          flex: 1, padding: '8px 24px 120px', overflow: 'hidden',
        }}>
          {list.wines.slice(0, 5).map((w, i) => <PublicListWineRow key={i} wine={w} idx={i}/>)}
        </div>
      </div>

      {/* Bottom fixed action bar */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        padding: '14px 16px 30px',
        background: 'rgba(245,236,217,0.94)',
        backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
        borderTop: `0.5px solid ${WT.border}`,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <button style={{
          height: 52, padding: '0 18px', borderRadius: 14,
          background: '#FFFFFF', border: `1px solid ${WT.border}`,
          color: WT.ink, fontFamily: WT.body, fontSize: 13.5, fontWeight: 700,
          display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer',
          boxShadow: '0 1px 2px rgba(31,18,12,0.04)',
          letterSpacing: '-0.005em',
        }}>
          <Icon name="bookmark" size={16} color={WT.ink} sw={2}/>
          저장
        </button>
        <button style={{
          flex: 1, height: 52, padding: '0 18px', borderRadius: 14,
          background: WT.burgundy, color: '#FFFFFF',
          border: 'none', fontFamily: WT.body, fontSize: 14, fontWeight: 700,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          cursor: 'pointer', letterSpacing: '-0.005em',
          boxShadow: '0 8px 20px -8px rgba(122,30,45,0.55)',
        }}>
          <Icon name="copy-plus" size={16} color="#FFFFFF" sw={2}/>
          내 리스트로 가져오기
        </button>
      </div>
    </div>
  );
}

function iconBtnSty() {
  return {
    width: 38, height: 38, borderRadius: 999,
    background: 'transparent', border: 'none',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', padding: 0,
  };
}

// ════════════════════════════════════════════════════════════════
// SCREEN 3 — 리스트 생성 플로우
// ════════════════════════════════════════════════════════════════
function ScreenListCreate() {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <WTStatusBar time="5:45"/>

      {/* Top bar */}
      <div style={{
        padding: '6px 16px 10px',
        display: 'flex', alignItems: 'center',
        borderBottom: `0.5px solid ${WT.border}`,
      }}>
        <button style={iconBtnSty()}><Icon name="x" size={20} color={WT.ink} sw={2.2}/></button>
        <div style={{ flex: 1, textAlign: 'center', fontFamily: WT.body, fontSize: 15, color: WT.ink, fontWeight: 700 }}>새 리스트</div>
        <button style={{
          padding: '8px 14px', borderRadius: 999,
          background: WT.burgundy, color: '#fff', border: 'none',
          fontFamily: WT.body, fontSize: 13, fontWeight: 700, cursor: 'pointer',
          boxShadow: '0 4px 10px -4px rgba(122,30,45,0.5)',
        }}>만들기</button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflow: 'hidden', padding: '20px 24px 110px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {/* Title input */}
        <div style={{
          fontFamily: WT.display, fontSize: 28, color: WT.ink,
          fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.2,
          fontStyle: 'italic',
          paddingBottom: 6,
          borderBottom: `1px solid ${WT.gold}`,
        }}>
          론 북부, 시라 학습용
          <span style={{
            display: 'inline-block', width: 1, height: 26,
            background: WT.burgundy, marginLeft: 2, verticalAlign: 'middle',
            animation: 'blink 1s steps(2) infinite',
          }}/>
        </div>
        <div style={{ fontSize: 10.5, color: WT.muted, marginTop: 4, letterSpacing: '0.02em' }}>리스트 제목 · 50자 이내</div>

        {/* Desc */}
        <textarea style={{
          marginTop: 14, padding: '12px 0', resize: 'none',
          background: 'transparent', border: 'none', outline: 'none',
          fontFamily: WT.body, fontSize: 13.5, color: WT.ink, lineHeight: 1.6,
          minHeight: 56,
        }} defaultValue="에르미타주 · 코트 로티 · 코르나스. 4월 가져갈 6병만." readOnly/>
        <div style={{ fontSize: 10.5, color: WT.muted, letterSpacing: '0.02em', marginTop: -4 }}>설명 (선택) · 200자 이내</div>

        {/* Visibility toggle */}
        <div style={{
          marginTop: 18,
          padding: '12px 14px', borderRadius: 14,
          background: WT.card, border: `1px solid ${WT.border}`,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 999,
            background: `${WT.ink2}10`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="lock" size={15} color={WT.ink2} sw={1.9}/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, color: WT.ink, fontWeight: 700, letterSpacing: '-0.005em' }}>비공개</div>
            <div style={{ fontSize: 11, color: WT.muted, marginTop: 1 }}>나만 볼 수 있어요</div>
          </div>
          {/* iOS-ish switch (off, muted) */}
          <div style={{
            width: 44, height: 26, borderRadius: 999,
            background: WT.borderSoft, position: 'relative',
            border: `1px solid ${WT.border}`,
          }}>
            <div style={{
              position: 'absolute', top: 2, left: 2,
              width: 20, height: 20, borderRadius: 999, background: '#fff',
              boxShadow: '0 1px 2px rgba(31,18,12,0.18)',
            }}/>
          </div>
        </div>

        {/* Wine adding area */}
        <div style={{ marginTop: 22, display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 11, color: WT.goldSoft, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700 }}>Wines</span>
          <span style={{ fontFamily: WT.body, fontSize: 14, color: WT.ink, fontWeight: 700 }}>와인 추가</span>
          <span style={{ fontFamily: WT.body, fontSize: 12, color: WT.muted, fontVariantNumeric: 'tabular-nums' }}>· 3</span>
        </div>

        {/* Two add buttons */}
        <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { ic: 'search', l: '검색으로 추가', s: '와인·생산자명' },
            { ic: 'bottle', l: '마셔본 목록', s: '7병 중 선택' },
          ].map(b => (
            <button key={b.l} style={{
              padding: '14px 14px', borderRadius: 14,
              background: WT.card, border: `1px dashed ${WT.gold}66`,
              textAlign: 'left', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', gap: 6,
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: 999,
                background: `${WT.gold}1A`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name={b.ic} size={14} color={WT.goldSoft} sw={2}/>
              </div>
              <div style={{ fontSize: 13, color: WT.ink, fontWeight: 700, letterSpacing: '-0.005em' }}>{b.l}</div>
              <div style={{ fontSize: 10.5, color: WT.muted, fontWeight: 500 }}>{b.s}</div>
            </button>
          ))}
        </div>

        {/* Added wines (draggable) */}
        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column' }}>
          {[
            { name: '폴 자블레 에르미타주 라 샤펠', producer: 'Paul Jaboulet', vintage: 2018, color: '#3A1018' },
            { name: '기갈 코트 로티 라 모르도레', producer: 'Guigal', vintage: 2019, color: '#2A0B14' },
            { name: '도멘 클라프 코르나스', producer: 'Clape', vintage: 2020, color: '#3A1620' },
          ].map((w, i, arr) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 4px',
              borderBottom: i < arr.length - 1 ? `0.5px solid ${WT.border}` : 'none',
              background: i === 1 ? `${WT.gold}10` : 'transparent',
              borderRadius: i === 1 ? 10 : 0,
              boxShadow: i === 1 ? '0 6px 16px -6px rgba(31,18,12,0.18)' : 'none',
              transform: i === 1 ? 'translateY(-2px)' : 'none',
              transition: 'all 0.2s',
            }}>
              <Icon name="grip" size={16} color={WT.faint} sw={1.5}/>
              <span style={{
                fontFamily: WT.display, fontStyle: 'italic', fontSize: 12,
                color: WT.goldSoft, fontWeight: 500, minWidth: 18, textAlign: 'right',
              }}>0{i+1}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, color: WT.ink, fontWeight: 700, letterSpacing: '-0.005em', lineHeight: 1.3 }}>{w.name}</div>
                <div style={{ fontSize: 10.5, color: WT.muted, marginTop: 1 }}>{w.producer} · {w.vintage}</div>
              </div>
              <button style={{
                width: 28, height: 28, borderRadius: 999, border: 'none',
                background: 'transparent', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}><Icon name="x" size={13} color={WT.muted} sw={2}/></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// SCREEN 4 — 커뮤니티 피드 · 인라인 리스트 카드
// ════════════════════════════════════════════════════════════════
function InlineListCard({ list, compact = false }) {
  return (
    <div style={{
      marginTop: 12,
      borderRadius: 16,
      background: `linear-gradient(180deg, ${WT.cardSoft}, ${WT.card})`,
      border: `1px solid ${WT.gold}55`,
      boxShadow: '0 1px 2px rgba(31,18,12,0.04), 0 8px 18px -10px rgba(31,18,12,0.14), inset 0 1px 0 rgba(255,255,255,0.6)',
      overflow: 'hidden',
    }}>
      {/* Header strip */}
      <div style={{
        padding: '10px 14px',
        borderBottom: `0.5px solid ${WT.border}`,
        display: 'flex', alignItems: 'center', gap: 8,
        background: `${WT.gold}0F`,
      }}>
        <div style={{
          width: 24, height: 24, borderRadius: 7,
          background: `linear-gradient(135deg, ${WT.goldChip}, ${WT.goldSoft})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4)',
        }}>
          <Icon name="layers" size={12} color="#fff" sw={2.4}/>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              fontSize: 9.5, color: WT.goldSoft, letterSpacing: '0.18em',
              textTransform: 'uppercase', fontWeight: 700,
            }}>리스트</span>
            <span style={{ width: 2, height: 2, borderRadius: 999, background: WT.faint }}/>
            <span style={{ fontSize: 10.5, color: WT.muted, fontWeight: 600 }}>{list.author.name}</span>
            <LevelPill level={list.author.level}/>
          </div>
        </div>
        <Icon name="chev-r" size={13} color={WT.goldSoft} sw={2.2}/>
      </div>
      {/* Body */}
      <div style={{ padding: '14px 16px 14px' }}>
        <div style={{
          fontFamily: WT.body, fontSize: 16, color: WT.ink,
          fontWeight: 700, letterSpacing: '-0.015em', lineHeight: 1.3,
        }}>{list.title}</div>
        <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 10, fontSize: 11.5, color: WT.muted, fontWeight: 500 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Icon name="bottle" size={11} color={WT.goldSoft} sw={1.8}/>
            <b style={{ color: WT.ink, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{list.wines.length}</b>
            <span>병</span>
          </span>
          <span style={{ width: 2, height: 2, borderRadius: 999, background: WT.faint }}/>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Icon name="bookmark" size={11} color={WT.goldSoft} sw={1.8}/>
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>{list.stats.saves}</span>
          </span>
        </div>

        {/* Wine preview rows */}
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: `0.5px solid ${WT.border}`, display: 'flex', flexDirection: 'column' }}>
          {list.wines.slice(0, 3).map((w, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'baseline', gap: 10,
              padding: '7px 0',
            }}>
              <span style={{
                fontFamily: WT.display, fontSize: 12, fontStyle: 'italic',
                color: WT.goldSoft, fontWeight: 500, minWidth: 18, textAlign: 'right',
              }}>0{i+1}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 12, color: WT.ink, fontWeight: 600, letterSpacing: '-0.005em',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{w.name}</div>
                <div style={{ fontSize: 10, color: WT.muted, marginTop: 0 }}>
                  {w.producer} · {w.vintage}
                </div>
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 0 0', marginLeft: 26 }}>
            <span style={{ fontSize: 11, color: WT.goldSoft, fontWeight: 700 }}>외 {list.wines.length - 3}병 더</span>
            <Icon name="arr-r" size={11} color={WT.goldSoft} sw={2.2}/>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScreenCommunityListCard() {
  const post = {
    user: { name: '박지원', level: '마스터', init: '박', c: '#7A1E2D' },
    ago: '12분 전',
    title: '입문자에게 한 해 동안 추천할 만한 부르고뉴',
    body: '함소믈리에의 리스트가 정말 잘 짜여 있어서 공유합니다. 가격대도 균형 잡혀 있고, 마을 단위 → 1er 순서로 학습 곡선이 자연스러워요.',
  };
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <WTStatusBar time="5:45"/>
      <WTTopHeader eyebrow="커뮤니티" title="모든 잔의 이야기"/>

      {/* Sub tabs */}
      <div style={{ padding: '0 24px', display: 'flex', gap: 22, borderBottom: `0.5px solid ${WT.border}` }}>
        {[
          { l: '전체', on: true }, { l: '팔로잉', on: false }, { l: '트렌딩', on: false },
        ].map(t => (
          <span key={t.l} style={{
            fontSize: 14, fontWeight: t.on ? 700 : 500,
            color: t.on ? WT.ink : WT.muted,
            paddingBottom: 10, borderBottom: t.on ? `2px solid ${WT.goldSoft}` : '2px solid transparent',
          }}>{t.l}</span>
        ))}
      </div>

      {/* Feed scroll */}
      <div style={{ flex: 1, padding: '12px 16px 100px', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <article style={{
          padding: '14px 16px 14px', borderRadius: 18,
          background: WT.card, border: `1px solid ${WT.border}`,
          boxShadow: '0 1px 2px rgba(31,18,12,0.04)',
        }}>
          {/* type tag */}
          <div style={{ marginBottom: 10 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '3px 9px', borderRadius: 999,
              background: WT.cardSoft, border: `1px solid ${WT.border}`,
              fontSize: 10.5, color: WT.goldSoft, fontWeight: 700, letterSpacing: '-0.005em',
            }}>
              <Icon name="edit" size={10} color={WT.goldSoft} sw={2}/>
              시음 노트
            </span>
          </div>
          {/* user row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar user={post.user} size={36}/>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 13, color: WT.ink, fontWeight: 700 }}>{post.user.name}</span>
                <LevelPill level={post.user.level}/>
              </div>
              <div style={{ fontSize: 10.5, color: WT.muted, marginTop: 2 }}>{post.ago}</div>
            </div>
            <Icon name="more" size={16} color={WT.muted}/>
          </div>
          {/* title */}
          <div style={{
            marginTop: 12, fontFamily: WT.body, fontSize: 17, color: WT.ink,
            fontWeight: 700, letterSpacing: '-0.015em', lineHeight: 1.3,
          }}>{post.title}</div>
          {/* body */}
          <div style={{
            marginTop: 6, fontSize: 13, color: WT.ink2, lineHeight: 1.6,
          }}>{post.body}</div>

          {/* THE INLINE LIST CARD */}
          <InlineListCard list={PUBLIC_LIST}/>

          {/* Reaction bar */}
          <div style={{
            marginTop: 12, paddingTop: 10,
            borderTop: `0.5px solid ${WT.border}`,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            {[
              { ic: 'heart', n: 42, on: true,  fg: WT.burgundy },
              { ic: 'bookmark', n: 18, on: false, fg: WT.ink2 },
              { ic: 'share', n: 0,  on: false, fg: WT.ink2 },
            ].map((r, i) => (
              <button key={i} style={{
                padding: '6px 10px 6px 8px', borderRadius: 999,
                background: r.on ? `${WT.burgundy}10` : 'transparent',
                border: `1px solid ${r.on ? WT.burgundy : WT.border}`,
                color: r.fg, fontSize: 11.5, fontWeight: 700,
                display: 'inline-flex', alignItems: 'center', gap: 5,
                fontFamily: WT.body, cursor: 'pointer',
              }}>
                <Icon name={r.ic} size={12} color={r.fg} sw={r.on ? 2.2 : 1.8} fill={r.on && r.ic==='heart' ? r.fg : 'none'}/>
                {r.n > 0 && <span style={{ fontVariantNumeric: 'tabular-nums' }}>{r.n}</span>}
              </button>
            ))}
            <span style={{ flex: 1 }}/>
            <span style={{ fontSize: 11, color: WT.muted, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Icon name="message" size={11} color={WT.muted}/> 댓글 8
            </span>
          </div>
        </article>
      </div>
      <WTBottomNav active="comm"/>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// SCREEN 5 — Q&A 글 하단 "리스트로 저장"
// ════════════════════════════════════════════════════════════════
function ScreenQAtoList() {
  const p = QA_POST;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <WTStatusBar time="5:45"/>
      {/* Top bar */}
      <div style={{ padding: '6px 16px 8px', display: 'flex', alignItems: 'center' }}>
        <button style={iconBtnSty()}><Icon name="chev-l" size={20} color={WT.ink} sw={2.2}/></button>
        <div style={{ flex: 1 }}/>
        <button style={iconBtnSty()}><Icon name="more" size={17} color={WT.ink2}/></button>
      </div>

      <div style={{ flex: 1, overflow: 'hidden', padding: '4px 24px 110px' }}>
        {/* Type chip */}
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '3px 9px', borderRadius: 999,
          background: '#E7E3F2', color: '#5848A0',
          fontSize: 10.5, fontWeight: 700, letterSpacing: '-0.005em',
        }}>
          <Icon name="info" size={10} color="#5848A0" sw={2.2}/>
          질문
        </span>

        {/* user row */}
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar user={p.user} size={32}/>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12.5, color: WT.ink, fontWeight: 700 }}>{p.user.name}</span>
              <LevelPill level={p.user.level}/>
            </div>
            <div style={{ fontSize: 10.5, color: WT.muted, marginTop: 1 }}>{p.ago}</div>
          </div>
        </div>

        {/* Title */}
        <div style={{
          marginTop: 14, fontFamily: WT.body, fontSize: 19, color: WT.ink,
          fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.3,
        }}>{p.title}</div>
        {/* Body */}
        <div style={{ marginTop: 6, fontSize: 12.5, color: WT.ink2, lineHeight: 1.6 }}>{p.body}</div>

        {/* Recommended section */}
        <div style={{
          marginTop: 22,
          padding: '14px 14px 8px',
          borderRadius: 16,
          background: WT.card,
          border: `1px solid ${WT.border}`,
          boxShadow: '0 1px 2px rgba(31,18,12,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <Icon name="sparkles" size={13} color={WT.goldSoft} sw={2.2}/>
            <span style={{ fontSize: 10.5, color: WT.goldSoft, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700 }}>가장 많이 추천된 와인</span>
            <span style={{ flex: 1 }}/>
            <span style={{ fontSize: 10.5, color: WT.muted, fontVariantNumeric: 'tabular-nums' }}>23명 참여</span>
          </div>
          {/* sub hint */}
          <div style={{
            marginTop: 4, fontSize: 10.5, color: WT.muted, fontStyle: 'italic',
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <Icon name="info" size={10} color={WT.muted} sw={1.7}/>
            · 추천 버튼을 탭해 고아세요. 중복 추천은 1병까지입니다.
          </div>
          <div style={{ marginTop: 8 }}>
            {p.recommended.map((w, i) => {
              const isVoted = i === 1; // user has voted on #2 to demo state
              return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 0',
                borderTop: i > 0 ? `0.5px solid ${WT.border}` : 'none',
              }}>
                <span style={{
                  fontFamily: WT.display, fontSize: 12, fontStyle: 'italic',
                  color: WT.goldSoft, fontWeight: 600, minWidth: 16, textAlign: 'right', alignSelf: 'flex-start', paddingTop: 2,
                }}>0{i+1}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: WT.ink, fontWeight: 700, letterSpacing: '-0.005em', lineHeight: 1.3 }}>{w.name}</div>
                  <div style={{ fontSize: 10.5, color: WT.muted, marginTop: 1 }}>{w.producer} · {w.vintage}</div>
                </div>
                {/* Vote button */}
                <button style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '7px 11px 7px 9px', borderRadius: 999,
                  background: isVoted ? WT.burgundy : '#FFFFFF',
                  color: isVoted ? '#FFFFFF' : WT.burgundy,
                  border: `1px solid ${isVoted ? WT.burgundy : WT.burgundy + '40'}`,
                  fontFamily: WT.body, fontSize: 11.5, fontWeight: 700,
                  fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.005em',
                  cursor: 'pointer',
                  boxShadow: isVoted
                    ? '0 4px 12px -4px rgba(122,30,45,0.45), inset 0 1px 0 rgba(255,255,255,0.18)'
                    : '0 1px 2px rgba(31,18,12,0.04)',
                  transition: 'all 0.15s',
                }}>
                  <Icon name="thumb" size={11}
                    color={isVoted ? '#FFFFFF' : WT.burgundy}
                    sw={isVoted ? 2.2 : 1.9}
                    fill={isVoted ? '#FFFFFF' : 'none'}/>
                  <span>{isVoted ? '추천함 ' : ''}{w.votes + (isVoted ? 1 : 0)}</span>
                </button>
              </div>
            );})}
          </div>

          {/* CTA — convert to list */}
          <button style={{
            marginTop: 12, width: '100%',
            padding: '14px 14px', borderRadius: 14,
            background: `linear-gradient(135deg, ${WT.burgundy}, ${WT.burgundyD})`,
            border: 'none', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            cursor: 'pointer', textAlign: 'left',
            boxShadow: '0 10px 24px -10px rgba(122,30,45,0.6), inset 0 1px 0 rgba(255,255,255,0.2)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 999,
                background: 'rgba(255,255,255,0.16)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name="layers" size={15} color="#fff" sw={2.2}/>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.005em' }}>이 결과를 리스트로 저장</div>
                <div style={{ fontSize: 11, color: '#E8C77A', marginTop: 2, fontWeight: 500 }}>상위 5병 · 초안으로 생성됩니다</div>
              </div>
            </div>
            <Icon name="chev-r" size={16} color="#fff" sw={2.2}/>
          </button>
        </div>

        {/* Comments hint */}
        <div style={{ marginTop: 16, fontSize: 12, color: WT.muted, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon name="message" size={12} color={WT.muted}/>
          댓글 31 · 채택된 답변 1
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// SCREEN 6 — 공개 설정 모달 (private → public)
// ════════════════════════════════════════════════════════════════
function ListDetailFaded() {
  // soft backdrop = the create-list screen state (a private list)
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <ScreenListCreate/>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(20,12,8,0.42)',
      }}/>
    </div>
  );
}

function ScreenMakePublic() {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <ListDetailFaded/>
      {/* Bottom sheet */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        background: WT.bg,
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        paddingTop: 12, paddingBottom: 32,
        boxShadow: '0 -20px 60px -16px rgba(20,12,8,0.45)',
      }}>
        <div style={{ width: 44, height: 5, borderRadius: 999, background: WT.border, margin: '0 auto 22px' }}/>

        {/* Hero icon */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 999,
            background: `linear-gradient(135deg, ${WT.goldChip}, ${WT.goldSoft})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 22px -6px rgba(184,148,56,0.45), inset 0 1px 0 rgba(255,255,255,0.4)',
          }}>
            <Icon name="globe" size={28} color="#fff" sw={1.7}/>
          </div>
        </div>

        <div style={{
          marginTop: 14, padding: '0 28px', textAlign: 'center',
          fontFamily: WT.body, fontSize: 20, color: WT.ink,
          fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.25,
        }}>리스트를 공개로 전환할까요?</div>

        <div style={{
          marginTop: 8, padding: '0 30px', textAlign: 'center',
          fontSize: 13, color: WT.ink2, lineHeight: 1.65,
        }}>
          공개하면 다른 사용자가 <b style={{ color: WT.ink, fontWeight: 700 }}>리스트 탐색</b>에서 발견할 수 있습니다. 피드에 자동 게시되지는 않습니다.
        </div>

        {/* Bullet info card */}
        <div style={{
          margin: '18px 24px 0',
          padding: '12px 14px', borderRadius: 14,
          background: WT.card, border: `1px solid ${WT.border}`,
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          {[
            { ic: 'eye',     l: '리스트 탐색·검색에 노출됩니다' },
            { ic: 'bookmark',l: '다른 사용자가 저장·복제할 수 있어요' },
            { ic: 'lock',    l: '언제든 다시 비공개로 바꿀 수 있어요' },
          ].map(b => (
            <div key={b.l} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 26, height: 26, borderRadius: 999,
                background: WT.cardSoft, border: `1px solid ${WT.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name={b.ic} size={12} color={WT.goldSoft} sw={2}/>
              </div>
              <span style={{ fontSize: 12.5, color: WT.ink2, fontWeight: 500, letterSpacing: '-0.005em' }}>{b.l}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ padding: '20px 16px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button style={{
            height: 52, borderRadius: 14, border: 'none',
            background: WT.burgundy, color: '#fff',
            fontFamily: WT.body, fontSize: 14.5, fontWeight: 700, cursor: 'pointer',
            letterSpacing: '-0.005em',
            boxShadow: '0 8px 20px -8px rgba(122,30,45,0.55)',
          }}>공개하기</button>
          <button style={{
            height: 48, borderRadius: 14, border: 'none',
            background: 'transparent', color: WT.ink2,
            fontFamily: WT.body, fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
          }}>취소</button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// SCREEN 7 — 비공개 전환 경고
// ════════════════════════════════════════════════════════════════
function ScreenMakePrivate() {
  const savers = [
    { init: '함', c: '#7A1E2D' },
    { init: '미', c: '#9C8240' },
    { init: '덕', c: '#3D5A4E' },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {/* Backdrop: public list detail behind */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <ScreenListDetail/>
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(20,12,8,0.5)' }}/>

      {/* Bottom sheet */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        background: WT.bg,
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        paddingTop: 12, paddingBottom: 32,
        boxShadow: '0 -20px 60px -16px rgba(20,12,8,0.45)',
      }}>
        <div style={{ width: 44, height: 5, borderRadius: 999, background: WT.border, margin: '0 auto 22px' }}/>

        {/* Warning hero */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 999,
            background: `${WT.burgundy}14`,
            border: `1px solid ${WT.burgundy}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="alert" size={28} color={WT.burgundy} sw={1.8}/>
          </div>
        </div>

        <div style={{
          marginTop: 14, padding: '0 28px', textAlign: 'center',
          fontFamily: WT.body, fontSize: 20, color: WT.ink,
          fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.25,
        }}>비공개로 전환할까요?</div>

        <div style={{
          marginTop: 8, padding: '0 30px', textAlign: 'center',
          fontSize: 13, color: WT.ink2, lineHeight: 1.65,
        }}>
          <b style={{ color: WT.burgundy, fontWeight: 700 }}>3명</b>이 이 리스트를 저장했습니다. 비공개로 전환하면 그들의 저장 목록에서 보이지 않게 됩니다.
        </div>

        {/* Savers preview card */}
        <div style={{
          margin: '18px 24px 0',
          padding: '12px 14px', borderRadius: 14,
          background: WT.card, border: `1px solid ${WT.border}`,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {savers.map((s, i) => (
              <div key={i} style={{
                marginLeft: i === 0 ? 0 : -10,
                width: 32, height: 32, borderRadius: 999,
                background: s.c, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, fontFamily: WT.body,
                border: `2px solid ${WT.bg}`,
                position: 'relative', zIndex: 10 - i,
              }}>{s.init}</div>
            ))}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12.5, color: WT.ink, fontWeight: 700 }}>함소믈리에 · 미네랄러버 · 와인덕후</div>
            <div style={{ fontSize: 11, color: WT.muted, marginTop: 1 }}>지난 30일 안에 저장</div>
          </div>
        </div>

        {/* Effect bullets */}
        <div style={{
          margin: '10px 24px 0', padding: '12px 14px', borderRadius: 14,
          background: WT.cardSoft, border: `1px dashed ${WT.border}`,
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          {[
            { ic: 'eye-off',  l: '리스트 탐색·검색에서 사라집니다' },
            { ic: 'bookmark', l: '저장한 사람의 목록에서 숨겨집니다' },
            { ic: 'message',  l: '받은 좋아요·댓글은 보존됩니다' },
          ].map(b => (
            <div key={b.l} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Icon name={b.ic} size={13} color={WT.ink2} sw={1.9}/>
              <span style={{ fontSize: 12, color: WT.ink2, fontWeight: 500 }}>{b.l}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ padding: '18px 16px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button style={{
            height: 52, borderRadius: 14, border: 'none',
            background: WT.burgundy, color: '#fff',
            fontFamily: WT.body, fontSize: 14.5, fontWeight: 700, cursor: 'pointer',
            letterSpacing: '-0.005em',
            boxShadow: '0 8px 20px -8px rgba(122,30,45,0.55)',
          }}>비공개로 전환</button>
          <button style={{
            height: 48, borderRadius: 14, border: 'none',
            background: 'transparent', color: WT.ink2,
            fontFamily: WT.body, fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
          }}>취소</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  Phone, PhoneSlot, Avatar,
  ScreenLists, ScreenListDetail, ScreenListCreate,
  ScreenCommunityListCard, ScreenQAtoList,
  ScreenMakePublic, ScreenMakePrivate,
});
