import { MacroEvent, AppSettings } from '../types';
import {
  getConfidenceLabel,
  getConfidenceBadgeClass,
  getImpactLabel,
  getImpactBadgeClass,
} from '../utils/trade';

interface Props {
  trade: MacroEvent;
  lastUpdated?: string;
  settings: AppSettings;
}

export default function MacroEventCard({ trade }: Props) {
  const eventName  = trade.event_name ?? trade.company_name ?? 'Macro Event';
  const eventDate  = trade.date ?? 'N/A';
  const eventTime  = trade.time ?? '';

  const confidenceLabel = getConfidenceLabel(trade);
  const confidenceClass = getConfidenceBadgeClass(trade);
  const impactLabel     = getImpactLabel(trade);
  const impactClass     = getImpactBadgeClass(trade);

  // Determine if the event is in the past
  let isPast  = false;
  let daysAgo = 0;
  if (eventDate !== 'N/A') {
    const evtDate = new Date(eventDate);
    isPast  = evtDate < new Date();
    daysAgo = Math.floor((Date.now() - evtDate.getTime()) / 86_400_000);
  }

  const instruments = trade.tradeable_instruments ?? [];

  // Normalise recommended_action to a human-readable string
  const action = trade.recommended_action
    ? trade.recommended_action.replace(/_/g, ' ')
    : null;

  return (
    <div className={`trade-card${isPast ? ' stale' : ''}`}>

      {/* Row 1 — stale badge (past events only) */}
      {isPast && (
        <div className="stale-badge">✓ Occurred {daysAgo}d ago</div>
      )}

      {/* Row 2 — Confidence + Impact badges */}
      <div className="badge-row">
        <span className={`confidence-badge ${confidenceClass}`}>
          {confidenceLabel.toUpperCase()} Confidence
        </span>
        {impactLabel && (
          <span className={`confidence-badge ${impactClass}`}>
            {impactLabel} Impact
          </span>
        )}
      </div>

      {/* Row 3 — Event title */}
      <div className="card-title">{eventName}</div>

      {/* Row 4 — Date + time meta chip */}
      {eventDate !== 'N/A' && (
        <div className="card-meta-row">
          <span className="card-meta-item">
            {eventDate}{eventTime ? ` · ${eventTime}` : ''}
          </span>
          {action && (
            <span className="card-meta-item">{action}</span>
          )}
        </div>
      )}

      {/* Row 5 — Tradeable instruments */}
      {instruments.length > 0 && (
        <div className="info-row">
          <span className="info-label">Instruments</span>
          <span className="info-value">{instruments.join(', ')}</span>
        </div>
      )}

      {/* Row 6 — Setup + Analysis detail sections */}
      {(trade.trade_setup || trade.rationale) && (
        <div className="card-details">
          {trade.trade_setup && (
            <div className="detail-section">
              <h4>Setup</h4>
              <p>{trade.trade_setup}</p>
            </div>
          )}
          {trade.rationale && (
            <div className="detail-section">
              <h4>Analysis</h4>
              <p>{trade.rationale}</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
