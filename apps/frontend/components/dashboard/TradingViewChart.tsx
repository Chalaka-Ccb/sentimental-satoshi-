'use client';

import React, { useEffect, useRef } from 'react';
import * as LC from 'lightweight-charts';
import type { IChartApi, ISeriesApi } from 'lightweight-charts';

interface ChartProps {
  data: any[];
}

export default function TradingViewChart({ data }: ChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // 1. Initialize the Chart
    const chart: any = LC.createChart(chartContainerRef.current, {
      layout: {
        background: { type: LC.ColorType.Solid, color: 'transparent' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: { color: '#1e293b' },
        horzLines: { color: '#1e293b' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      timeScale: {
        borderColor: '#334155',
        timeVisible: true,
      },
    });

    // 2. Use the v5 series API
    const candlestickSeries = chart.addSeries(LC.CandlestickSeries, {
      upColor: '#10b981',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });
    seriesRef.current = candlestickSeries;

    chartRef.current = chart;

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  // Update data when it arrives from the backend
  useEffect(() => {
    if (seriesRef.current && data && data.length > 0) {
      try {
        seriesRef.current.setData(data);
        chartRef.current?.timeScale().fitContent();
      } catch (err) {
        console.error("Chart Data Error:", err);
      }
    }
  }, [data]);

  return <div ref={chartContainerRef} className="w-full h-full min-h-[400px]" />;
}