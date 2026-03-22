import { MacroEvent } from '../types';
import {
  getConfidenceLabel,
  getConfidenceBadgeClass,
  getImpactLabel,
  getImpactBadgeClass,
  getCatalystCountdown,
} from '../utils/trade';

interface Props {
  trade: MacroEvent;
  lastUpdated?: string;
}

export default function MacroEventCard({ trade, lastUpdated }: Props) {
  // event_name is the canonical title field for MacroEvent
  const eventName = trade.event_name ?? 'Macro Event';
  const eventDate = trade.date ?? 'N/A';
  const eventTime = trade.time ?? '';
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

  const catalystCountdown = getCatalystCountdown(trade);
  const sourceCount = trade.data_sources?.length ?? null;

  const instruments = trade.tradeable_instruments ?? [];
  const action = trade.recommended_action
    ? trade.recommended_action.replace(/_/g, ' ')
    : null;

  return (
    <div className={`trade-card${isPast ? ' stale' : ''}`}>
      {/* Row 1 — stale badge (past events only) */}
      {isPast && (
        <div className="stale-badge">
          ✓ Occurred {daysAgo}d ago
        </div>
      )}

      {/* Row 2 — Confidence + Impact badges */}
      <div className="badge-row">
        <span className={confidenceClass}>
          {confidenceLabel.toUpperCase()} Confidence
        </span>
        {impactLabel && (
          <>
            <span className="badge-separator">·</span>
            <span className={impactClass}>{impactLabel} Impact</span>
          </>
        )}
      </div>

      {/* Data quality indicators */}
      {(sourceCount || catalystCountdown) && (
        <div className="data-quality-row">
          {sourceCount != null && (
            <span className="evidence-badge" title={trade.data_sources!.join(', ')}>
              {sourceCount} {sourceCount === 1 ? 'source' : 'sources'}
            </span>
          )}
          {catalystCountdown && !isPast && (
            <span className="catalyst-countdown">
              {catalystCountdown}
            </span>
          )}
        </div>
      )}

      {/* Row 3 — Event title as card-title; card-name spacer keeps layout consistent */}
      <div className="card-header">
        <div>
          <div className="card-title">{eventName}</div>
          <div className="card-name card-name-event">&nbsp;</div>
        </div>
      </div>

      {/* Row 4 — Date + time + action meta chips */}
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

      {/* Row 6 — Setup + Analysis */}
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
