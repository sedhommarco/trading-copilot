import { useEffect, useState } from 'react';
import { fetchLivePrice } from '../api';
import { LivePriceData } from '../types';
import { formatNumber } from '../config';

interface Props {
  ticker: string;
  entryPrice: number;
  direction: string;
}

export default function LivePriceRow({ ticker, entryPrice, direction }: Props) {
  const [data, setData] = useState<LivePriceData | null | 'loading'>('loading');

  useEffect(() => {
    let cancelled = false;
    fetchLivePrice(ticker).then(result => {
      if (!cancelled) setData(result);
    }).catch(() => {
      if (!cancelled) setData(null);
    });
    return () => { cancelled = true; };
  }, [ticker]);

  if (data === null) return null; // equities — no row at all

  let vsEntryEl: React.ReactNode = null;
  if (data !== 'loading' && entryPrice > 0) {
    const vsEntry = ((data.price - entryPrice) / entryPrice) * 100;
    const positive = direction === 'LONG' ? vsEntry >= 0 : vsEntry <= 0;
    vsEntryEl = (
      <span
        className="live-price-vs-entry"
        style={{ color: positive ? 'var(--color-success)' : 'var(--color-danger)' }}
      >
        ({vsEntry >= 0 ? '+' : ''}{vsEntry.toFixed(2)}% vs entry)
      </span>
    );
  }

  let changeEl: React.ReactNode = null;
  if (data !== 'loading' && data?.change24h != null) {
    const up = data.change24h >= 0;
    changeEl = (
      <span
        className="live-price-change"
        style={{ color: up ? 'var(--color-success)' : 'var(--color-danger)' }}
      >
        {up ? '▲' : '▼'} {Math.abs(data.change24h).toFixed(2)}% 24h
      </span>
    );
  }

  return (
    <div className="live-price-row">
      <span className="live-price-label">Live Price</span>
      <span className="live-price-value">
        {data === 'loading' ? (
          <span className="live-price-loading">Loading…</span>
        ) : (
          <>
            <span style={{ fontWeight: 600 }}>${formatNumber(data.price, 2)}</span>
            {changeEl}
            {vsEntryEl}
          </>
        )}
      </span>
    </div>
  );
}
