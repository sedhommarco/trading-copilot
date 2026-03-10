import { useEffect, useState, type ReactNode } from 'react';
import { fetchFxMetalHistory } from '../api';
import '../styles/sparkline.css';

interface Props {
  symbol: string;
}

function buildSVG(prices: number[], width = 80, height = 28): ReactNode {
  if (prices.length < 2) return null;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const points = prices
    .map((v, i) => {
      const x = (i / (prices.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  const isUp = prices[prices.length - 1] >= prices[0];
  const color = isUp ? '#10b981' : '#ef4444';
  return (
    <svg width={width} height={height} className="sparkline" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <polyline fill="none" stroke={color} strokeWidth="1.5" points={points} />
    </svg>
  );
}

export default function SparklineChart({ symbol }: Props) {
  const [prices, setPrices] = useState<number[] | null | 'loading'>('loading');

  useEffect(() => {
    let cancelled = false;
    fetchFxMetalHistory(symbol).then(data => {
      if (!cancelled) setPrices(data ? data.map(d => d.price) : null);
    }).catch(() => {
      if (!cancelled) setPrices(null);
    });
    return () => { cancelled = true; };
  }, [symbol]);

  if (prices === 'loading' || prices === null) return null;

  return (
    <div className="sparkline-container">
      {buildSVG(prices)}
    </div>
  );
}
