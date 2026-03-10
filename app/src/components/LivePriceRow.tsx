import { useEffect, useState, type ReactNode } from 'react';
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

  let vsEntryEl: ReactNode = null;
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

  return (
    <div className="live-price-row">
      <span className="live-price-label">Live</span>
      {data === 'loading' ? (
        <span className="live-price-loading">…</span>
      ) : (
        <span className="live-price-value">
          {formatNumber(data.price)}
          {data.change24h != null && (
            <span
              className="live-price-change"
              style={{ color: data.change24h >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}
            >
              {data.change24h >= 0 ? ' +' : ' '}{data.change24h.toFixed(2)}%
            </span>
          )}
          {vsEntryEl && <> {vsEntryEl}</>}
        </span>
      )}
    </div>
  );
}
