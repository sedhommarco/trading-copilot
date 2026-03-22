import { Trade, AppSettings } from '../types';
// api imports used elsewhere (SparklineChart, LivePriceRow)
import {
  getConfidenceLabel,
  getConfidenceBadgeClass,
  getTradeAge,
  calcEntryPrice,
  calcRiskReward,
  fmt,
  getPriceFreshness,
  getCatalystCountdown,
} from '../utils/trade';
import LivePriceRow from './LivePriceRow';
import SparklineChart from './SparklineChart';

interface Props {
  trade: Trade;
  lastUpdated?: string;
  settings: AppSettings;
}

export default function TradeCard({ trade, lastUpdated, settings }: Props) {
  const ticker = trade.ticker ?? trade.symbol ?? trade.instrument ?? 'N/A';
  const company = trade.company_name ?? trade.company ?? trade.name ?? '';
  const direction = (trade.direction ?? 'LONG').toUpperCase();
  const confidenceLabel = getConfidenceLabel(trade);
  const confidenceClass = getConfidenceBadgeClass(trade);
  const { isStale, daysOld } = getTradeAge(trade, lastUpdated);

  const entry = calcEntryPrice(trade);
  const stop = trade.stop_loss ?? 0;
  const target = trade.take_profit ?? 0;
  const rrRatio = calcRiskReward(entry, stop, target);
  const timeframe = trade.expected_holding_days ? `${trade.expected_holding_days}d` : 'N/A';
  // risk_percent is a whole integer, e.g. 3 means "3% of capital"
  const riskPct = trade.risk_percent ?? null;

    const hasLivePrice = ticker !== 'N/A';
  const freshness = getPriceFreshness(trade, lastUpdated);
  const catalystCountdown = getCatalystCountdown(trade);
  const sourceCount = trade.data_sources?.length ?? null;

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
        <span className={confidenceClass}>{confidenceLabel.toUpperCase()} Confidence</span>
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
            <span className="catalyst-countdown" title={trade.next_catalyst_date ?? trade.earnings_date ?? ''}>
              {catalystCountdown}
            </span>
          )}
        </div>
      )}

      <div className="card-header">
        <div>
          <div className="card-title">{ticker}</div>
          {company && <div className="card-name">{company}</div>}
        </div>
        {settings.showPriceCharts && <SparklineChart symbol={ticker} />}
      </div>

      {settings.showLivePrices && hasLivePrice && (
        <LivePriceRow ticker={ticker} entryPrice={entry} direction={direction} />
      )}

      <div className="card-meta-row">
        <span className={`card-meta-item ${direction === 'LONG' ? 'long' : 'short'}`}>
          {direction}
        </span>
        <span className="card-meta-item">{timeframe}</span>
        {riskPct != null && (
          <span className="card-meta-item">{riskPct}% risk</span>
        )}
        <span className="card-meta-item">R:R {rrRatio}</span>
      </div>

      <div className="card-metrics">
        <div>
          <div className="metric-label">Entry</div>
          <div className="metric-value">{fmt(entry)}</div>
        </div>
        <div>
          <div className="metric-label">Target</div>
          <div className="metric-value" style={{ color: 'var(--color-success)' }}>{fmt(target)}</div>
        </div>
        <div>
          <div className="metric-label">Stop Loss</div>
          <div className="metric-value" style={{ color: 'var(--color-danger)' }}>{fmt(stop)}</div>
        </div>
        {trade.earnings_date && (
          <div>
            <div className="metric-label">Earnings</div>
            <div className="metric-value">{trade.earnings_date}</div>
          </div>
        )}
      </div>

      {(trade.rationale || trade.trade_setup || trade.entry_trigger || trade.crash_date) && (
        <div className="card-details">
          {trade.rationale && (
            <div className="detail-section">
              <h4>Rationale</h4>
              <p>{trade.rationale}</p>
            </div>
          )}
          {trade.trade_setup && (
            <div className="detail-section">
              <h4>Setup</h4>
              <p>{trade.trade_setup}</p>
            </div>
          )}
          {trade.entry_trigger && (
            <div className="detail-section">
              <h4>Entry Trigger</h4>
              <p>{trade.entry_trigger}</p>
            </div>
          )}
          {trade.crash_date && (
            <div className="detail-section">
              <h4>Crash Details</h4>
              <p>Date: {trade.crash_date} · Drop: {trade.drop_percent}%</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
