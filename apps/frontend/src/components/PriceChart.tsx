'use client';
import { useEffect, useRef } from 'react';
import { createChart, ColorType, CrosshairMode } from 'lightweight-charts';
import useSWR from 'swr';
import { api } from '../lib/api';

const fetcher = (url: string) => api.get(url).then(r => r.data);

interface Props {
  symbol: string;
  coinId: string;
}

export function PriceChart({ symbol, coinId }: Props) {
  const containerRef = useRef(null);
  const { data: ohlcv } = useSWR(`/api/v1/prices/${coinId}/ohlcv?days=90`, fetcher);
  const { data: sentimentHistory } = useSWR(`/api/v1/analysis/${symbol}/history`, fetcher);

  useEffect(() => {
    if (!containerRef.current || !ohlcv) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0d0f14' },
        textColor: '#8892a4',
      },
      grid: {
        vertLines: { color: 'rgba(255,255,255,0.04)' },
        horzLines: { color: 'rgba(255,255,255,0.04)' },
      },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderColor: 'rgba(255,255,255,0.08)' },
      timeScale: { borderColor: 'rgba(255,255,255,0.08)', timeVisible: true },
      width: containerRef.current.clientWidth,
      height: 360,
    });

    // Candlestick series (main price pane)
    const candles = chart.addCandlestickSeries({
      upColor: '#4ade80', downColor: '#f87171',
      borderUpColor: '#4ade80', borderDownColor: '#f87171',
      wickUpColor: '#4ade80', wickDownColor: '#f87171',
    });
    candles.setData(ohlcv);

    // Sentiment histogram (sub-pane)
    if (sentimentHistory?.length) {
      const sentimentSeries = chart.addHistogramSeries({
        color: '#2dd4bf',
        priceFormat: { type: 'price', precision: 2 },
        priceScaleId: 'sentiment',
      });
      chart.priceScale('sentiment').applyOptions({
        scaleMargins: { top: 0.8, bottom: 0 },
      });
      sentimentSeries.setData(
        sentimentHistory.map((s: any) => ({
          time: Math.floor(new Date(s.createdAt).getTime() / 1000),
          value: s.score,
          color: s.score > 0 ? '#4ade8066' : '#f8717166',
        }))
      );
    }

    const observer = new ResizeObserver(() => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    });
    observer.observe(containerRef.current);

    return () => { chart.remove(); observer.disconnect(); };
  }, [ohlcv, sentimentHistory]);

  return (
    

      

        {symbol}
        
      

      

    

  );
}