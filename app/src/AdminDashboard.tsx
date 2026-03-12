import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './auth';

const REPO = 'sedhommarco/trading-copilot';
const GITHUB_URL = `https://github.com/${REPO}`;

const CI_BADGES = [
  {
    badgeUrl: `${GITHUB_URL}/actions/workflows/deploy.yml/badge.svg`,
    actionUrl: `${GITHUB_URL}/actions/workflows/deploy.yml`,
  },
  {
    badgeUrl: `${GITHUB_URL}/actions/workflows/validate-json.yml/badge.svg`,
    actionUrl: `${GITHUB_URL}/actions/workflows/validate-json.yml`,
  },
  {
    badgeUrl: `${GITHUB_URL}/actions/workflows/fetch-equity-prices.yml/badge.svg`,
    actionUrl: `${GITHUB_URL}/actions/workflows/fetch-equity-prices.yml`,
  },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Protect /admin — redirect unauthenticated visitors to welcome page.
  if (!user) {
    return <Navigate to="/" replace />;
  }

  const appVersion = import.meta.env.VITE_APP_VERSION ?? 'dev';

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <button className="btn-ghost" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>Admin Dashboard</h1>
      </div>

      <section className="admin-section">
        <h2>Version</h2>
        <div className="admin-version">{appVersion}</div>
      </section>

      <section className="admin-section">
        <h2>Continuous Delivery</h2>
        <div className="admin-badges">
          {CI_BADGES.map((b) => (
            <div key={b.badgeUrl} className="admin-badge-row">
              <a href={b.actionUrl} target="_blank" rel="noopener noreferrer">
                <img src={b.badgeUrl} alt="workflow status" className="admin-badge" />
              </a>
            </div>
          ))}
        </div>
      </section>

      <section className="admin-section">
        <h2>Links</h2>
        <ul className="admin-links">
          <li><a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">GitHub repository</a></li>
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

