import { AnyTrade, Trade, PairTrade } from '../types';
import { formatNumber } from '../config';

export function getConfidenceScore(trade: AnyTrade): number {
  if (typeof trade.confidence === 'number') return trade.confidence;
  const raw = (
    (trade as Trade).conviction ||
    (trade as Trade).confidence_label ||
    (trade as Trade).confidence_string ||
    ''
  ).toLowerCase();
  if (raw.includes('high')) return 80;
  if (raw.includes('moderate') || raw.includes('medium')) return 60;
  if (raw.includes('low')) return 40;
  return 0;
}

export function getConfidenceLabel(trade: AnyTrade): string {
  if (typeof trade.confidence === 'number') return String(trade.confidence);
  const t = trade as Trade;
  return t.confidence_label || t.confidence_string || t.conviction || 'N/A';
}

export function getConfidenceBadgeClass(trade: AnyTrade): string {
  const v = getConfidenceScore(trade);
  if (v >= 75) return 'confidence-badge confidence-high';
  if (v >= 50) return 'confidence-badge confidence-medium';
  return 'confidence-badge confidence-low';
}

export interface TradeAge {
  daysOld: number | null;
  isStale: boolean;
}

export function getTradeAge(
  trade: AnyTrade,
  lastUpdated?: string,
): TradeAge {
  const t = trade as Trade;
  const ref =
    t.recommended_date ??
    t.created_date ??
    lastUpdated;
  if (!ref) return { daysOld: null, isStale: false };
  const refDate = new Date(ref);
  if (isNaN(refDate.getTime())) return { daysOld: null, isStale: false };
  const daysOld = Math.floor((Date.now() - refDate.getTime()) / 86_400_000);
  const expectedHoldingDays = (trade as Trade).expected_holding_days ?? 7;
  return { daysOld, isStale: daysOld > expectedHoldingDays };
}

export function calcEntryPrice(trade: Trade): number {
  if (trade.entry_zone) {
    const parts = String(trade.entry_zone).split('-');
    if (parts.length === 2) {
      const avg = (parseFloat(parts[0]) + parseFloat(parts[1])) / 2;
      if (!isNaN(avg)) return avg;
    }
    const v = parseFloat(String(trade.entry_zone));
    if (!isNaN(v)) return v;
  }
  return trade.current_price ?? 0;
}

export function calcRiskReward(entry: number, stop: number, target: number): string {
  if (entry <= 0 || stop <= 0 || target <= 0) return 'N/A';
  const risk = Math.abs(entry - stop);
  const reward = Math.abs(target - entry);
  if (risk === 0) return 'N/A';
  return `1:${(reward / risk).toFixed(1)}`;
}

export function isPairTrade(trade: AnyTrade): trade is PairTrade {
  return !!(trade as PairTrade).long_ticker && !!(trade as PairTrade).short_ticker;
}

export function isMacroEvent(trade: AnyTrade): boolean {
  return !!(trade as { event_name?: string }).event_name;
}

export function fmt(value: number | undefined | null, decimals = 2): string {
  return value != null && value > 0 ? `$${formatNumber(value, decimals)}` : 'N/A';
}
