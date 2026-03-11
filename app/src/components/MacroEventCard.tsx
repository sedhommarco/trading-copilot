import { MacroEvent, AppSettings } from '../types';
import {
  getConfidenceLabel,
  getConfidenceBadgeClass,
  getImpactLabel,
  getImpactBadgeClass,
} from '../utils/trade';

interface Props {
  trade: MacroEvent;
  /** ISO 8601 last_updated string from the watchlist file (passed for API consistency). */
  lastUpdated?: string;
  /** App-level display settings (passed for API consistency with TradeCard/PairTradeCard). */
  settings: AppSettings;
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
        <span className={confidenceClass}>
          {confidenceLabel.toUpperCase()} Confidence
        </span>
        {impactLabel && (
          <>
            <span className="badge-sep">·</span>
            <span className={impactClass}>{impactLabel} Impact</span>
          </>
        )}
      </div>

      <div className="card-ticker">{eventName}</div>
      <div className="card-meta">
        {eventDate}{trade.time ? ` · ${trade.time}` : ''}
      </div>

      {trade.recommended_action && (
        <div className="direction-badge">
          {trade.recommended_action.replace(/_/g, ' ')}
        </div>
      )}

      {instruments.length > 0 && (
        <div className="card-detail">
          <span className="detail-label">Instruments</span>
          <span>{instruments.join(', ')}</span>
        </div>
      )}

      {trade.trade_setup && (
        <div className="card-notes">
          <h4>Setup</h4>
          <p>{trade.trade_setup}</p>
        </div>
      )}

      {trade.rationale && (
        <div className="card-notes">
          <h4>Analysis</h4>
          <p>{trade.rationale}</p>
        </div>
      )}
    </div>
  );
}
