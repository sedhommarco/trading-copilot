import { AnyTrade, Trade, PairTrade, MacroEvent } from '../types';
import { formatNumber } from '../config';

// ─── Confidence ───────────────────────────────────────────────────────────────

export function getConfidenceScore(trade: AnyTrade): number {
  if (typeof trade.confidence === 'number') return trade.confidence;
  const raw = (
    (trade as Trade).conviction ||
    (trade as Trade).confidence_label ||
    (trade as Trade).confidence_string ||
    ''
  ).toLowerCase();
  if (raw.includes('very high')) return 90;
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

// ─── Impact ───────────────────────────────────────────────────────────────────

const IMPACT_ORDER: Record<string, number> = {
  'very high': 4,
  high: 3,
  medium: 2,
  moderate: 2,
  low: 1,
};

export function getImpactScore(trade: AnyTrade): number {
  const raw = ((trade as MacroEvent).impact ?? '').toLowerCase().trim();
  return IMPACT_ORDER[raw] ?? 0;
}

export function getImpactLabel(trade: AnyTrade): string {
  const raw = ((trade as MacroEvent).impact ?? '').trim();
  return raw ? raw.toUpperCase() : '';
}

export function getImpactBadgeClass(trade: AnyTrade): string {
  const score = getImpactScore(trade);
  if (score >= 4) return 'confidence-badge confidence-high';
  if (score >= 3) return 'confidence-badge confidence-high';
  if (score >= 2) return 'confidence-badge confidence-medium';
  return 'confidence-badge confidence-low';
}

// ─── Trade age / stale ────────────────────────────────────────────────────────

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

// ─── Trade maths ──────────────────────────────────────────────────────────────

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

// ─── Data Quality Indicators ─────────────────────────────────────────────────

export type FreshnessLevel = 'fresh' | 'aging' | 'stale';

/**
 * Returns price freshness based on how old `price_checked_at` is.
 * Falls back to lastUpdated if price_checked_at is absent.
 * Returns null if neither timestamp exists (backward compat).
 */
export function getPriceFreshness(
  trade: AnyTrade,
  lastUpdated?: string,
): FreshnessLevel | null {
  const raw = (trade as Trade).price_checked_at ?? lastUpdated;
  if (!raw) return null;
  const checked = new Date(raw);
  if (isNaN(checked.getTime())) return null;
  const hoursAgo = (Date.now() - checked.getTime()) / 3_600_000;
  if (hoursAgo < 24) return 'fresh';
  if (hoursAgo < 72) return 'aging';
  return 'stale';
}

/**
 * Returns countdown string to next_catalyst_date, or null if absent/past.
 */
export function getCatalystCountdown(trade: AnyTrade): string | null {
  const dateStr = (trade as Trade).next_catalyst_date ?? (trade as Trade).earnings_date ?? (trade as MacroEvent).date;
  if (!dateStr) return null;
  const target = new Date(dateStr + (dateStr.includes('T') ? '' : 'T00:00:00'));
  if (isNaN(target.getTime())) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((target.getTime() - now.getTime()) / 86_400_000);
  if (diffDays < -7) return null; // too far in the past
  if (diffDays < 0) return `${Math.abs(diffDays)}d ago`;
  if (diffDays === 0) return 'Today';
  return `${diffDays}d`;
}

export type EvidenceLevel = 'strong' | 'moderate' | 'weak';

/**
 * Maps evidence_count to a qualitative level.
 * Returns null if evidence_count is absent (backward compat).
 */
export function getEvidenceLevel(trade: AnyTrade): EvidenceLevel | null {
  const count = (trade as Trade).evidence_count;
  if (count == null) return null;
  if (count >= 5) return 'strong';
  if (count >= 3) return 'moderate';
  return 'weak';
}
