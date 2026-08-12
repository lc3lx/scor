import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { cn } from '@utils/cn';
import styles from './CandlestickChart.module.css';

export type CandlestickPoint = {
  open: number;
  high: number;
  low: number;
  close: number;
  /** Candle open time in unix seconds (optional; used for live rollover). */
  time?: number;
};

export type CandlestickChartProps = {
  data: CandlestickPoint[];
  width?: number;
  height?: number;
  className?: string;
  /** Bars visible in the viewport (pan to see older candles). */
  visibleBars?: number;
};

/** Clear bull/bear colors (TradingView-like, high contrast on dark). */
const UP = '#12e655';
const DOWN = '#ef4444';
const GRID = 'rgba(42, 46, 57, 0.95)';
const AXIS = '#787b86';
const CROSS = 'rgba(120, 123, 134, 0.55)';
const BG = '#131722';

function formatPrice(value: number, range: number): string {
  if (range >= 100) return value.toFixed(2);
  if (range >= 1) return value.toFixed(4);
  if (range >= 0.01) return value.toFixed(5);
  return value.toFixed(6);
}

function sanitize(point: CandlestickPoint): CandlestickPoint {
  const open = point.open;
  const close = point.close;
  let high = point.high;
  let low = point.low;
  if (low > high) {
    const t = low;
    low = high;
    high = t;
  }
  high = Math.max(high, open, close);
  low = Math.min(low, open, close);
  return { ...point, open, high, low, close };
}

export function CandlestickChart({
  data,
  width = 362,
  height = 188,
  className,
  visibleBars = 48,
}: CandlestickChartProps) {
  const [panBars, setPanBars] = useState(0);
  const dragRef = useRef<{ x: number; pan: number } | null>(null);

  const sanitized = useMemo(() => data.map(sanitize), [data]);

  const maxPan = Math.max(0, sanitized.length - visibleBars);
  const clampedPan = Math.min(Math.max(0, panBars), maxPan);
  const end = sanitized.length - clampedPan;
  const start = Math.max(0, end - visibleBars);
  const bars = sanitized.slice(start, end);

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<SVGSVGElement>) => {
      event.currentTarget.setPointerCapture(event.pointerId);
      dragRef.current = { x: event.clientX, pan: clampedPan };
    },
    [clampedPan],
  );

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<SVGSVGElement>) => {
      const drag = dragRef.current;
      if (!drag || bars.length === 0) return;
      const plotW = width - 56;
      const slot = plotW / Math.max(bars.length, 1);
      const dx = event.clientX - drag.x;
      const deltaBars = Math.round(-dx / slot);
      setPanBars(Math.min(maxPan, Math.max(0, drag.pan + deltaBars)));
    },
    [bars.length, maxPan, width],
  );

  const endDrag = useCallback((event: ReactPointerEvent<SVGSVGElement>) => {
    dragRef.current = null;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      /* already released */
    }
  }, []);

  if (sanitized.length === 0 || bars.length === 0) return null;

  const padL = 4;
  const padR = 52;
  const padT = 8;
  const padB = 6;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  const lows = bars.map((p) => p.low);
  const highs = bars.map((p) => p.high);
  const minPrice = Math.min(...lows);
  const maxPrice = Math.max(...highs);
  const rawRange = maxPrice - minPrice || 0.0001;
  const padRange = rawRange * 0.08;
  const lo = minPrice - padRange;
  const hi = maxPrice + padRange;
  const priceRange = hi - lo;
  const last = bars[bars.length - 1]!;
  const lastUp = last.close >= last.open;
  const lastColor = lastUp ? UP : DOWN;

  const slot = plotW / bars.length;
  const bodyW = Math.max(2, Math.min(10, slot * 0.7));
  const wickW = bodyW >= 5 ? 1.5 : 1.15;
  const gap = Math.max(0.5, slot - bodyW);

  const scaleY = (price: number) => padT + plotH - ((price - lo) / priceRange) * plotH;

  const gridSteps = 4;
  const gridLines = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const t = i / gridSteps;
    const price = hi - t * priceRange;
    return { y: padT + plotH * t, price };
  });

  const lastY = scaleY(last.close);
  const priceLabel = formatPrice(last.close, priceRange);
  const labelH = 16;
  const labelW = Math.max(44, priceLabel.length * 6.4 + 10);
  const labelY = Math.min(Math.max(lastY - labelH / 2, padT), height - padB - labelH);
  const followLive = clampedPan === 0;

  return (
    <svg
      className={cn(styles.chart, className)}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Candlestick chart — drag to scroll history"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      style={{ touchAction: 'none', cursor: maxPan > 0 ? 'grab' : 'default' }}
    >
      <rect x={0} y={0} width={width} height={height} fill={BG} />

      {gridLines.map(({ y, price }) => (
        <g key={`g-${price}`}>
          <line
            x1={padL}
            y1={y}
            x2={width - padR}
            y2={y}
            stroke={GRID}
            strokeWidth={1}
            strokeDasharray={y === padT || y === padT + plotH ? undefined : '2 3'}
          />
          <text
            x={width - padR + 6}
            y={y + 3}
            className={styles.axisLabel}
            fill={AXIS}
            fontSize={9}
            fontFamily="Trebuchet MS, Segoe UI, sans-serif"
          >
            {formatPrice(price, priceRange)}
          </text>
        </g>
      ))}

      <line
        x1={width - padR}
        y1={padT}
        x2={width - padR}
        y2={padT + plotH}
        stroke={GRID}
        strokeWidth={1}
      />

      {bars.map((point, index) => {
        const isUp = point.close >= point.open;
        const color = isUp ? UP : DOWN;
        const x = padL + index * slot + gap / 2;
        const centerX = x + bodyW / 2;
        const bodyTop = scaleY(Math.max(point.open, point.close));
        const bodyBottom = scaleY(Math.min(point.open, point.close));
        const bodyHeight = Math.max(1.25, bodyBottom - bodyTop);
        const isLive = followLive && index === bars.length - 1;

        return (
          <g key={`${start + index}-${point.time ?? index}`}>
            <line
              x1={centerX}
              y1={scaleY(point.high)}
              x2={centerX}
              y2={scaleY(point.low)}
              stroke={color}
              strokeWidth={wickW}
              strokeLinecap="butt"
            />
            {/* Hollow-ish body edge for tiny bodies (doji) */}
            <rect
              className={isLive ? styles.liveBody : undefined}
              x={x}
              y={bodyTop}
              width={bodyW}
              height={bodyHeight}
              fill={color}
              stroke={color}
              strokeWidth={0.75}
            />
          </g>
        );
      })}

      {followLive && (
        <>
          <line
            x1={padL}
            y1={lastY}
            x2={width - padR}
            y2={lastY}
            stroke={CROSS}
            strokeWidth={1}
            strokeDasharray="4 3"
          />
          <rect
            x={width - padR + 1}
            y={labelY}
            width={labelW}
            height={labelH}
            rx={2}
            fill={lastColor}
          />
          <text
            x={width - padR + 1 + labelW / 2}
            y={labelY + 11.5}
            textAnchor="middle"
            fill="#fff"
            fontSize={9}
            fontWeight={700}
            fontFamily="Trebuchet MS, Segoe UI, sans-serif"
          >
            {priceLabel}
          </text>
        </>
      )}

      {maxPan > 0 && (
        <text
          x={padL + 4}
          y={height - 4}
          fill={AXIS}
          fontSize={8}
          fontFamily="Trebuchet MS, Segoe UI, sans-serif"
        >
          drag to scroll
        </text>
      )}
    </svg>
  );
}
