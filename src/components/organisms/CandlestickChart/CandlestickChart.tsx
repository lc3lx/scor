import { cn } from '@utils/cn';
import styles from './CandlestickChart.module.css';

export type CandlestickPoint = {
  open: number;
  high: number;
  low: number;
  close: number;
};

export type CandlestickChartProps = {
  data: CandlestickPoint[];
  width?: number;
  height?: number;
  className?: string;
  /** Max candles rendered (TradingView-like density). */
  visibleBars?: number;
};

/** TradingView dark-theme palette */
const UP = '#26a69a';
const DOWN = '#ef5350';
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

export function CandlestickChart({
  data,
  width = 362,
  height = 188,
  className,
  visibleBars = 56,
}: CandlestickChartProps) {
  if (data.length === 0) return null;

  const bars = data.length > visibleBars ? data.slice(-visibleBars) : data;
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
  const bodyW = Math.max(1.5, Math.min(9, slot * 0.62));
  const wickW = bodyW >= 4 ? 1.25 : 1;

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

  return (
    <svg
      className={cn(styles.chart, className)}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Candlestick chart"
    >
      <rect x={0} y={0} width={width} height={height} fill={BG} rx={0} />

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

      {/* Separator for price scale */}
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
        const x = padL + index * slot + (slot - bodyW) / 2;
        const centerX = x + bodyW / 2;
        const bodyTop = scaleY(Math.max(point.open, point.close));
        const bodyBottom = scaleY(Math.min(point.open, point.close));
        const bodyHeight = Math.max(1, bodyBottom - bodyTop);
        const isLive = index === bars.length - 1;

        return (
          <g
            key={`${index}-${point.open.toFixed(5)}-${point.close.toFixed(5)}`}
            className={isLive ? styles.liveCandle : undefined}
          >
            <line
              className={styles.wick}
              x1={centerX}
              y1={scaleY(point.high)}
              x2={centerX}
              y2={scaleY(point.low)}
              stroke={color}
              strokeWidth={wickW}
              strokeLinecap="butt"
            />
            <rect
              className={styles.body}
              x={x}
              y={bodyTop}
              width={bodyW}
              height={bodyHeight}
              fill={color}
              stroke={color}
              strokeWidth={0.5}
            />
          </g>
        );
      })}

      {/* Last price line + TradingView-style tag */}
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
