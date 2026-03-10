import { PairTrade } from '../types';
import {
  getConfidenceLabel,
  getConfidenceBadgeClass,
  getTradeAge,
  fmt,
} from '../utils/trade';

interface Props {
  trade: PairTrade;
  lastUpdated?: string;
}

export default function PairTradeCard({ trade, lastUpdated }: Props) {
  const longT = trade.long_ticker ?? 'N/A';
  const shortT = trade.short_ticker ?? 'N/A';
  const confidenceLabel = getConfidenceLabel(trade);
  const confidenceClass = getConfidenceBadgeClass(trade);
  const { isStale, daysOld } = getTradeAge(trade, lastUpdated);
  const timeframe = trade.expected_holding_days ? `${trade.expected_holding_days}d` : 'N/A';

  return (
    <div className={`trade-card${isStale ? ' stale' : ''}`}>
      {isStale && daysOld != null && (
        <div className="stale-badge">
          ⏰ {daysOld}d old (expected {trade.expected_holding_days ?? 7}d)
        </div>
      )}

      <div className="card-header">
        <div>
          <div className="card-title">{longT} / {shortT}</div>
          <div className="card-name">Pair Trade</div>
        </div>
        <span className={confidenceClass}>{confidenceLabel.toUpperCase()}</span>
      </div>

      <div className="card-meta-row">
        <span className="card-meta-item long">LONG {longT}</span>
        <span className="card-meta-item short">SHORT {shortT}</span>
        <span className="card-meta-item">{timeframe}</span>
      </div>

      <div className="card-metrics">
        <div>
          <div className="metric-label">Long Entry</div>
          <div className="metric-value">{fmt(trade.long_entry)}</div>
        </div>
        <div>
          <div className="metric-label">Short Entry</div>
          <div className="metric-value">{fmt(trade.short_entry)}</div>
        </div>
        <div>
          <div className="metric-label">Spread Target</div>
          <div className="metric-value">{trade.target_spread ?? 'N/A'}</div>
        </div>
        <div>
          <div className="metric-label">Long Stop</div>
          <div className="metric-value">{fmt(trade.long_stop)}</div>
        </div>
        <div>
          <div className="metric-label">Short Stop</div>
          <div className="metric-value">{fmt(trade.short_stop)}</div>
        </div>
      </div>

      {trade.rationale && (
        <div className="card-details">
          <div className="detail-section">
            <h4>Rationale</h4>
            <p>{trade.rationale}</p>
          </div>
        </div>
      )}
    </div>
  );
}
