import { MacroEvent } from '../types';
import {
  getConfidenceLabel,
  getConfidenceBadgeClass,
  getImpactLabel,
  getImpactBadgeClass,
} from '../utils/trade';

interface Props {
  trade: MacroEvent;
}

export default function MacroEventCard({ trade }: Props) {
  const eventName = trade.event_name ?? 'Macro Event';
  const eventDate = trade.date ?? 'N/A';
  const confidenceLabel = getConfidenceLabel(trade);
  const confidenceClass = getConfidenceBadgeClass(trade);
  const impactLabel = getImpactLabel(trade);
  const impactClass = getImpactBadgeClass(trade);

  let isPast = false;
  let daysAgo = 0;
  if (eventDate !== 'N/A') {
    const evtDate = new Date(eventDate);
    isPast = evtDate < new Date();
    daysAgo = Math.floor((Date.now() - evtDate.getTime()) / 86_400_000);
  }

  const instruments = trade.tradeable_instruments ?? [];

  return (
    <div className={`trade-card${isPast ? ' stale' : ''}`}>
      {/* Line 1: STALE badge (only when past) */}
      {isPast && (
        <div className="stale-badge">✓ Occurred {daysAgo}d ago</div>
      )}

      {/* Line 2: Confidence · Impact on one line (Impact only if present) */}
      <div className="badge-row">
        <span className={confidenceClass}>{confidenceLabel.toUpperCase()} Confidence</span>
        {impactLabel && (
          <>
            <span className="badge-separator">·</span>
            <span className={impactClass}>{impactLabel} Impact</span>
          </>
        )}
      </div>

      <div className="card-header">
        <div>
          <div className="card-title">{eventName}</div>
          <div className="card-name">
            {eventDate}{trade.time ? ` · ${trade.time}` : ''}
          </div>
        </div>
      </div>

      {trade.recommended_action && (
        <div className="card-meta-row">
          <span className="card-meta-item">
            {trade.recommended_action.replace(/_/g, ' ')}
          </span>
        </div>
      )}

      <div className="card-metrics" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
        {instruments.length > 0 && (
          <div style={{ gridColumn: '1 / -1' }}>
            <div className="metric-label">Instruments</div>
            <div className="metric-value">{instruments.join(', ')}</div>
          </div>
        )}
        {trade.trade_setup && (
          <div style={{ gridColumn: '1 / -1' }}>
            <div className="metric-label">Setup</div>
            <div className="metric-value" style={{ fontWeight: 400, fontSize: '0.875rem' }}>{trade.trade_setup}</div>
          </div>
        )}
      </div>

      {trade.rationale && (
        <div className="card-details">
          <div className="detail-section">
            <h4>Analysis</h4>
            <p>{trade.rationale}</p>
          </div>
        </div>
      )}
    </div>
  );
}
