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

/** Explicit hex — CSS vars in SVG attrs often fail inside Telegram WebView. */
const CANDLE_UP = '#12e655';
const CANDLE_DOWN = '#dd0912';

export function CandlestickChart({
  data,
  width = 362,
  height = 160,
  className,
}: CandlestickChartProps) {
  if (data.length === 0) return null;

  const padding = 8;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const lows = data.map((point) => point.low);
  const highs = data.map((point) => point.high);
  const minPrice = Math.min(...lows);
  const maxPrice = Math.max(...highs);
  const priceRange = maxPrice - minPrice || 1;
  const candleGap = 2;
  const candleWidth = Math.max(3, chartWidth / data.length - candleGap);

  const scaleY = (price: number) =>
    padding + chartHeight - ((price - minPrice) / priceRange) * chartHeight;

  return (
    <svg
      className={cn(styles.chart, className)}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Candlestick chart"
    >
      {data.map((point, index) => {
        const x = padding + index * (candleWidth + candleGap);
        const isUp = point.close >= point.open;
        const bodyTop = scaleY(Math.max(point.open, point.close));
        const bodyBottom = scaleY(Math.min(point.open, point.close));
        const bodyHeight = Math.max(1, bodyBottom - bodyTop);
        const wickTop = scaleY(point.high);
        const wickBottom = scaleY(point.low);
        const color = isUp ? CANDLE_UP : CANDLE_DOWN;
        const centerX = x + candleWidth / 2;
        const isLive = index === data.length - 1;

        return (
          <g
            key={`${index}-${point.open}-${point.close}`}
            className={isLive ? styles.liveCandle : undefined}
          >
            <line
              className={styles.wick}
              x1={centerX}
              y1={wickTop}
              x2={centerX}
              y2={wickBottom}
              stroke={color}
              strokeWidth={1.25}
            />
            <rect
              className={styles.body}
              x={x}
              y={bodyTop}
              width={candleWidth}
              height={bodyHeight}
              fill={color}
              rx={1}
            />
          </g>
        );
      })}
    </svg>
  );
}
