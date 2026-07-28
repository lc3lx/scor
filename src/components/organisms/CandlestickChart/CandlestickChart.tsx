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
        const color = isUp ? 'var(--color-success)' : 'var(--color-red-primary)';
        const centerX = x + candleWidth / 2;

        return (
          <g key={index}>
            <line
              x1={centerX}
              y1={wickTop}
              x2={centerX}
              y2={wickBottom}
              stroke={color}
              strokeWidth={1}
            />
            <rect
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
