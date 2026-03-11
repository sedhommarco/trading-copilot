import { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { SettingsContext } from '../state';
import { useAuth } from '../auth';

// Number of title clicks needed to unlock the admin easter egg
const ADMIN_CLICK_TARGET = 5;
// Window (ms) within which clicks must occur
const ADMIN_CLICK_WINDOW = 4000;

export default function Header() {
  const { settings, setSettings } = useContext(SettingsContext);
  const { user, signInWithGoogle, signOut } = useAuth();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // ─── 5-click admin easter egg ──────────────────────────────────────────
  const [titleClicks, setTitleClicks] = useState(0);
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleTitleClick() {
    const next = titleClicks + 1;

    if (next >= ADMIN_CLICK_TARGET) {
      // Easter egg triggered!
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
      setTitleClicks(0);
      navigate('/admin');
      return;
    }

    setTitleClicks(next);

    // Start / reset the decay timer
    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    clickTimeoutRef.current = setTimeout(() => {
      setTitleClicks(0);
      clickTimeoutRef.current = null;
    }, ADMIN_CLICK_WINDOW);
  }

  // ─── Close menu on outside click ─────────────────────────────────────────
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  // ─── Derived helpers ──────────────────────────────────────────────────────
  const initials = user
    ? user.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : null;

  return (
    <header className="header">
      <div className="header-left">
        <h1
          className="header-title"
          onClick={handleTitleClick}
          title={titleClicks > 0 ? `${ADMIN_CLICK_TARGET - titleClicks} more clicks…` : undefined}
          style={{ cursor: 'pointer', userSelect: 'none' }}
        >
          Trading A¡dvisor
        </h1>
      </div>

      <div className="header-actions" ref={menuRef}>
        <button
          className="avatar-btn"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={user ? `${user.name} menu` : 'Sign in'}
          title={user ? user.name : 'Sign in with Google'}
        >
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            initials ?? '👤'
          )}
        </button>

        {menuOpen && (
          <div className="settings-menu">
            {user ? (
              <>
                {/* Signed-in header */}
                <div className="settings-menu-title">{user.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.625rem' }}>
                  {user.email}
                </div>

                {/* Settings toggles — only visible when signed in */}
                <label className="settings-toggle">
                  <input
                    type="checkbox"
                    checked={settings.showLivePrices}
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, showLivePrices: e.target.checked }))
                    }
                  />
                  Live prices
                </label>
                <label className="settings-toggle">
                  <input
                    type="checkbox"
                    checked={settings.showPriceCharts}
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, showPriceCharts: e.target.checked }))
                    }
                  />
                  Price charts
                </label>

                <hr style={{ margin: '0.5rem 0', borderColor: 'var(--color-border)' }} />

                <button
                  className="settings-toggle"
                  style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-danger)', justifyContent: 'flex-start', padding: '0.375rem 0' }}
                  onClick={() => { signOut(); setMenuOpen(false); }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <div className="settings-menu-title">Account</div>
                <button
                  className="settings-toggle"
                  style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-accent)', justifyContent: 'flex-start', padding: '0.375rem 0' }}
                  onClick={() => { signInWithGoogle(); setMenuOpen(false); }}
                >
                  Sign in with Google
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
