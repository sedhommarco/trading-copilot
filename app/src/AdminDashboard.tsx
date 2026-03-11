import { useNavigate } from 'react-router-dom';

const REPO = 'sedhommarco/trading-copilot';
const GITHUB_URL = `https://github.com/${REPO}`;

const CI_BADGES = [
  {
    label: 'Deploy',
    badgeUrl: `${GITHUB_URL}/actions/workflows/deploy.yml/badge.svg`,
    actionUrl: `${GITHUB_URL}/actions/workflows/deploy.yml`,
  },
  {
    label: 'Validate JSON',
    badgeUrl: `${GITHUB_URL}/actions/workflows/validate-json.yml/badge.svg`,
    actionUrl: `${GITHUB_URL}/actions/workflows/validate-json.yml`,
  },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const appVersion = import.meta.env.VITE_APP_VERSION ?? 'dev';

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <button className="btn-ghost" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>Admin Dashboard</h1>
      </header>

      <section className="admin-section">
        <h2>Version</h2>
        <p className="admin-version">v{appVersion}</p>
      </section>

      <section className="admin-section">
        <h2>CI &amp; Deployment</h2>
        <div className="admin-badges">
          {CI_BADGES.map((b) => (
            <div key={b.label} className="admin-badge-row">
              <span className="admin-badge-label">{b.label}</span>
              <a
                href={b.actionUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={b.badgeUrl} alt={`${b.label} status`} />
              </a>
            </div>
          ))}
        </div>
      </section>

      <section className="admin-section">
        <h2>Links</h2>
        <ul className="admin-links">
          <li>
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
              GitHub repository
            </a>
          </li>
          <li>
            <a
              href={`${GITHUB_URL}/releases.atom`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Subscribe to releases (RSS/Atom)
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
}
