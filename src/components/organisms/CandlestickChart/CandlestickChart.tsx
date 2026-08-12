import {
  useCallback,
  useEffect,
  useId,
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

const UP = '#12e655';
const DOWN = '#ef4444';
const GRID = 'rgba(42, 46, 57, 0.95)';
const AXIS = '#787b86';
const CROSS = 'rgba(120, 123, 134, 0.55)';
const BG = '#131722';

type PriceDomain = { lo: number; hi: number };

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

function domainFrom(points: CandlestickPoint[]): PriceDomain {
  const minPrice = Math.min(...points.map((p) => p.low));
  const maxPrice = Math.max(...points.map((p) => p.high));
  const raw = maxPrice - minPrice || 0.0001;
  const pad = raw * 0.08;
  return { lo: minPrice - pad, hi: maxPrice + pad };
}

/**
 * Y-domain that tracks the live price near vertical center so the chart
 * scrolls up/down as price moves (XY motion), while still fitting visible highs/lows.
 */
function domainTrackingFocus(points: CandlestickPoint[], focus: number): PriceDomain {
  const minPrice = Math.min(...points.map((p) => p.low), focus);
  const maxPrice = Math.max(...points.map((p) => p.high), focus);
  const dataSpan = Math.max(maxPrice - minPrice, Math.abs(focus) * 1e-4, 1e-5);
  const above = Math.max(maxPrice - focus, dataSpan * 0.4);
  const below = Math.max(focus - minPrice, dataSpan * 0.4);
  const half = Math.max(above, below) * 1.15;
  return { lo: focus - half, hi: focus + half };
}

function lerpDomain(prev: PriceDomain | null, next: PriceDomain, t: number): PriceDomain {
  if (!prev) return next;
  return {
    lo: prev.lo + (next.lo - prev.lo) * t,
    hi: prev.hi + (next.hi - prev.hi) * t,
  };
}

export function CandlestickChart({
  data,
  width = 362,
  height = 188,
  className,
  visibleBars = 40,
}: CandlestickChartProps) {
  /** Pixel offset: 0 = glued to latest candle (right edge). Positive = older history. */
  const [panPx, setPanPx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{ x: number; pan: number } | null>(null);
  const frozenDomainRef = useRef<PriceDomain | null>(null);
  const smoothDomainRef = useRef<PriceDomain | null>(null);
  const panPxRef = useRef(0);
  const clipId = useId().replace(/:/g, '');
  const [, bump] = useState(0);

  const sanitized = useMemo(() => data.map(sanitize), [data]);

  const padL = 4;
  const padR = 52;
  const padT = 8;
  const padB = 6;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;
  const slot = plotW / Math.max(visibleBars, 1);
  const bodyW = Math.max(3, Math.min(12, slot * 0.78));
  const wickW = bodyW >= 5 ? 1.5 : 1.2;
  const maxPanPx = Math.max(0, (sanitized.length - visibleBars) * slot);
  const clampedPan = Math.min(Math.max(0, panPx), maxPanPx);
  const followLive = clampedPan < slot * 0.25 && !dragging;

  const rightIndex = sanitized.length === 0
    ? 0
    : sanitized.length - 1 - Math.round(clampedPan / slot);
  const leftIndex = Math.max(0, rightIndex - visibleBars + 1);
  const visiblePoints = useMemo(() => {
    if (sanitized.length === 0) return [];
    const end = Math.min(sanitized.length, rightIndex + 1);
    const start = Math.max(0, end - visibleBars);
    return sanitized.slice(start, end);
  }, [sanitized, rightIndex, visibleBars]);

  const liveClose = sanitized.length > 0 ? sanitized[sanitized.length - 1]!.close : 0;

  const targetDomain = useMemo(() => {
    if (visiblePoints.length === 0) return { lo: 0, hi: 1 };
    if (followLive) return domainTrackingFocus(visiblePoints, liveClose);
    return domainFrom(visiblePoints);
  }, [visiblePoints, followLive, liveClose]);

  useEffect(() => {
    if (dragging || !followLive) return;
    smoothDomainRef.current = lerpDomain(smoothDomainRef.current, targetDomain, 0.4);
    bump((n) => n + 1);
  }, [targetDomain, dragging, followLive]);

  const domain: PriceDomain = (() => {
    if (dragging || !followLive) {
      return frozenDomainRef.current ?? targetDomain;
    }
    return smoothDomainRef.current ?? targetDomain;
  })();

  const lo = domain.lo;
  const hi = domain.hi;
  const priceRange = hi - lo || 1;

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<SVGSVGElement>) => {
      event.currentTarget.setPointerCapture(event.pointerId);
      frozenDomainRef.current = smoothDomainRef.current ?? targetDomain;
      dragRef.current = { x: event.clientX, pan: clampedPan };
      setDragging(true);
    },
    [clampedPan, targetDomain],
  );

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<SVGSVGElement>) => {
      const drag = dragRef.current;
      if (!drag) return;
      const dx = event.clientX - drag.x;
      const next = Math.min(maxPanPx, Math.max(0, drag.pan + dx));
      panPxRef.current = next;
      setPanPx(next);
    },
    [maxPanPx],
  );

  const endDrag = useCallback((event: ReactPointerEvent<SVGSVGElement>) => {
    dragRef.current = null;
    setDragging(false);
    if (panPxRef.current < slot * 0.25) {
      frozenDomainRef.current = null;
      smoothDomainRef.current = null;
    }
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      /* already released */
    }
  }, [slot]);

  useEffect(() => {
    setPanPx((p) => {
      const next = Math.min(p, maxPanPx);
      panPxRef.current = next;
      return next;
    });
  }, [maxPanPx]);

  if (sanitized.length === 0) return null;

  const scaleY = (price: number) => padT + plotH - ((price - lo) / priceRange) * plotH;

  const drawStart = Math.max(0, leftIndex - 2);
  const drawEnd = Math.min(sanitized.length - 1, rightIndex + 2);

  const gridSteps = 4;
  const gridLines = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const t = i / gridSteps;
    const price = hi - t * priceRange;
    return { y: padT + plotH * t, price };
  });

  const liveCandle = sanitized[sanitized.length - 1]!;
  const lastUp = liveCandle.close >= liveCandle.open;
  const lastColor = lastUp ? UP : DOWN;
  const lastY = scaleY(liveCandle.close);
  const priceLabel = formatPrice(liveCandle.close, priceRange);
  const labelH = 16;
  const labelW = Math.max(44, priceLabel.length * 6.4 + 10);
  const labelY = Math.min(Math.max(lastY - labelH / 2, padT), height - padB - labelH);
  const latestCenterX = padL + plotW - slot / 2;

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
      style={{ touchAction: 'none', cursor: maxPanPx > 0 ? (dragging ? 'grabbing' : 'grab') : 'default' }}
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

      <defs>
        <clipPath id={clipId}>
          <rect x={padL} y={padT} width={plotW} height={plotH} />
        </clipPath>
      </defs>

      <g clipPath={`url(#${clipId})`}>
        {Array.from({ length: Math.max(0, drawEnd - drawStart + 1) }, (_, i) => {
          const index = drawStart + i;
          const point = sanitized[index]!;
          const isUp = point.close >= point.open;
          const color = isUp ? UP : DOWN;
          const xCenter = latestCenterX - (sanitized.length - 1 - index) * slot + clampedPan;
          const x = xCenter - bodyW / 2;
          const bodyTop = scaleY(Math.max(point.open, point.close));
          const bodyBottom = scaleY(Math.min(point.open, point.close));
          const bodyHeight = Math.max(1.5, bodyBottom - bodyTop);

          return (
            <g key={`${index}-${point.time ?? 't'}`}>
              <line
                x1={xCenter}
                y1={scaleY(point.high)}
                x2={xCenter}
                y2={scaleY(point.low)}
                stroke={color}
                strokeWidth={wickW}
                strokeLinecap="butt"
              />
              <rect
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
      </g>

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
    </svg>
  );
}
