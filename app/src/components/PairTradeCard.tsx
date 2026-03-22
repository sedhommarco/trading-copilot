import { PairTrade, AppSettings } from '../types';
import { getConfidenceLabel, getConfidenceBadgeClass, getTradeAge, fmt, getPriceFreshness, getCatalystCountdown } from '../utils/trade';
import LivePriceRow from './LivePriceRow';
import SparklineChart from './SparklineChart';

interface Props {
  trade: PairTrade;
  lastUpdated?: string;
  settings: AppSettings;
}

export default function PairTradeCard({ trade, lastUpdated, settings }: Props) {
  const longT = trade.long_ticker ?? 'N/A';
  const shortT = trade.short_ticker ?? 'N/A';
  const confidenceLabel = getConfidenceLabel(trade);
  const confidenceClass = getConfidenceBadgeClass(trade);
  const { isStale, daysOld } = getTradeAge(trade, lastUpdated);
  const timeframe = trade.expected_holding_days ? `${trade.expected_holding_days}d` : 'N/A';

  const freshness = getPriceFreshness(trade, lastUpdated);
  const catalystCountdown = getCatalystCountdown(trade);
  const sourceCount = trade.data_sources?.length ?? null;

  // Show live prices for both legs (all asset classes — crypto, FX/metals, equities)
  const longHasLive = longT !== 'N/A';
  const shortHasLive = shortT !== 'N/A';

  return (
    <div className={`trade-card${isStale ? ' stale' : ''}`}>
      {/* Line 1: STALE badge */}
      {isStale && daysOld != null && (
        <div className="stale-badge">
          ⏰ {daysOld}d old (expected {trade.expected_holding_days ?? 7}d)
        </div>
      )}

      {/* Line 2: Confidence badge */}
      <div className="badge-row">
        <span className={confidenceClass}>
          {confidenceLabel.toUpperCase()} Confidence
        </span>
      </div>

      {/* Data quality indicators */}
      {(freshness || catalystCountdown || sourceCount) && (
        <div className="data-quality-row">
          {freshness && freshness !== 'fresh' && (
            <span className={`freshness-indicator freshness-${freshness}`} title={`Price data: ${freshness}`} />
          )}
          {sourceCount != null && (
            <span className="evidence-badge" title={trade.data_sources!.join(', ')}>
              {sourceCount} {sourceCount === 1 ? 'source' : 'sources'}
            </span>
          )}
          {catalystCountdown && (
            <span className="catalyst-countdown" title={trade.next_catalyst_date ?? ''}>
              {catalystCountdown}
            </span>
          )}
        </div>
      )}

      {/* Line 3: Pair title + dual sparklines */}
      <div className="card-header">
        <div>
          <div className="card-title">{longT} / {shortT}</div>
          <div className="card-name">Pair Trade</div>
        </div>
        {settings.showPriceCharts && (
          <div className="sparkline-pair">
            <SparklineChart symbol={longT} label={longT} />
            <SparklineChart symbol={shortT} label={shortT} />
          </div>
        )}
      </div>

      {/* Live prices for each leg */}
      {settings.showLivePrices && longHasLive && (
        <LivePriceRow ticker={longT} entryPrice={trade.long_entry ?? 0} direction="LONG" />
      )}
      {settings.showLivePrices && shortHasLive && (
        <LivePriceRow ticker={shortT} entryPrice={trade.short_entry ?? 0} direction="SHORT" />
      )}

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
          <div className="metric-label">Long Stop</div>
          <div className="metric-value">{fmt(trade.long_stop)}</div>
        </div>
        <div>
          <div className="metric-label">Short Stop</div>
          <div className="metric-value">{fmt(trade.short_stop)}</div>
        </div>
        <div>
          <div className="metric-label">Spread Target</div>
          <div className="metric-value">{trade.target_spread ?? 'N/A'}</div>
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
