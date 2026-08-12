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
};

const CANDLE_UP = '#12e655';
const CANDLE_DOWN = '#dd0912';
const GRID = 'rgba(255,255,255,0.06)';

export function CandlestickChart({
  data,
  width = 362,
  height = 168,
  className,
}: CandlestickChartProps) {
  if (data.length === 0) return null;

  const padL = 6;
  const padR = 6;
  const padT = 10;
  const padB = 10;
  const chartWidth = width - padL - padR;
  const chartHeight = height - padT - padB;
  const lows = data.map((point) => point.low);
  const highs = data.map((point) => point.high);
  const minPrice = Math.min(...lows);
  const maxPrice = Math.max(...highs);
  const padRange = (maxPrice - minPrice) * 0.06 || 0.0001;
  const lo = minPrice - padRange;
  const hi = maxPrice + padRange;
  const priceRange = hi - lo || 1;
  const slot = chartWidth / data.length;
  const candleGap = Math.max(1.2, Math.min(3, slot * 0.28));
  const candleWidth = Math.max(2.5, slot - candleGap);

  const scaleY = (price: number) => padT + chartHeight - ((price - lo) / priceRange) * chartHeight;

  const gridYs = [0.2, 0.5, 0.8].map((t) => padT + chartHeight * t);

  return (
    <svg
      className={cn(styles.chart, className)}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Candlestick chart"
    >
      {gridYs.map((y) => (
        <line
          key={y}
          x1={padL}
          y1={y}
          x2={width - padR}
          y2={y}
          stroke={GRID}
          strokeWidth={1}
        />
      ))}

      {data.map((point, index) => {
        const x = padL + index * slot + (slot - candleWidth) / 2;
        const isUp = point.close >= point.open;
        const bodyTop = scaleY(Math.max(point.open, point.close));
        const bodyBottom = scaleY(Math.min(point.open, point.close));
        const bodyHeight = Math.max(1.5, bodyBottom - bodyTop);
        const wickTop = scaleY(point.high);
        const wickBottom = scaleY(point.low);
        const color = isUp ? CANDLE_UP : CANDLE_DOWN;
        const centerX = x + candleWidth / 2;
        const isLive = index === data.length - 1;

        return (
          <g
            key={`${index}-${point.open.toFixed(5)}-${point.close.toFixed(5)}`}
            className={isLive ? styles.liveCandle : undefined}
          >
            <line
              className={styles.wick}
              x1={centerX}
              y1={wickTop}
              x2={centerX}
              y2={wickBottom}
              stroke={color}
              strokeWidth={1.5}
              strokeLinecap="round"
            />
            <rect
              className={styles.body}
              x={x}
              y={bodyTop}
              width={candleWidth}
              height={bodyHeight}
              fill={color}
              rx={Math.min(2, candleWidth / 3)}
            />
          </g>
        );
      })}
    </svg>
  );
}
