import { useEffect, useState, type ReactNode } from 'react';
import { fetchFxMetalHistory, isFxMetalSymbol } from '../api';
import '../styles/sparkline.css';

interface Props {
  symbol: string;
}

const CHART_W = 80;
const CHART_H = 32;

function buildSVG(prices: number[]): ReactNode {
  if (prices.length < 2) return null;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const points = prices
    .map((v, i) => {
      const x = (i / (prices.length - 1)) * CHART_W;
      const y = CHART_H - ((v - min) / range) * CHART_H;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  const isUp = prices[prices.length - 1] >= prices[0];
  const color = isUp ? '#10b981' : '#ef4444';
  return (
    <svg
      width={CHART_W}
      height={CHART_H}
      className="sparkline"
      viewBox={`0 0 ${CHART_W} ${CHART_H}`}
      preserveAspectRatio="none"
    >
      <polyline fill="none" stroke={color} strokeWidth="1.5" points={points} />
    </svg>
  );
}

/**
 * Always renders a fixed-size grid container.
 * For FX/metals symbols it fetches 7-day history and draws an SVG line.
 * For all other symbols the container renders empty (grid placeholder).
 * Toggling is handled by the parent (don't render this component at all to hide).
 */
export default function SparklineChart({ symbol }: Props) {
  const [prices, setPrices] = useState<number[] | null | 'loading'>(
    isFxMetalSymbol(symbol) ? 'loading' : null,
  );

  useEffect(() => {
    if (!isFxMetalSymbol(symbol)) return;
    let cancelled = false;
    fetchFxMetalHistory(symbol)
      .then(data => {
        if (!cancelled) setPrices(data ? data.map(d => d.price) : null);
      })
      .catch(() => {
        if (!cancelled) setPrices(null);
      });
    return () => { cancelled = true; };
  }, [symbol]);

  return (
    <div className="sparkline-container" aria-label="Price chart">
      {prices !== 'loading' && prices !== null && buildSVG(prices)}
    </div>
  );
}
