import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import type { Asset } from '../../types/Asset';
import { historyStorage } from '../../services/historyStorage';
import { formatCurrency, toDollars } from '../../services/currencyUtils';

interface PortfolioGrowthChartProps {
  assets: Asset[];
  days?: number; // Number of days to show history for (default: 30)
  height?: number;
}

export const PortfolioGrowthChart: React.FC<PortfolioGrowthChartProps> = ({
  assets,
  days = 30,
  height = 300
}) => {
  const data = useMemo(() => {
    if (assets.length === 0) return [];

    const chartData = [];
    const today = new Date();

    // Generate data points for each day in the range
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      const totalValue = historyStorage.getPortfolioValueAtDate(date, assets);

      chartData.push({
        date: date.toLocaleDateString(),
        timestamp: date.getTime(),
        value: totalValue
      });
    }

    return chartData;
  }, [assets, days]);


  if (assets.length === 0) {
    return (
      <div className="flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700" style={{ height }}>
        <p className="text-gray-500 dark:text-gray-400 text-sm">No assets to display.</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 pt-4 px-4 pb-8" style={{ height: height + 80 }}>
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-4">Portfolio Growth (Last {days} Days)</h3>
      <div style={{ width: '100%', height: height }}>
        <ResponsiveContainer>
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: 'var(--chart-text)' }}
              tickMargin={10}
              minTickGap={30}
              stroke="var(--chart-grid)"
            />
            <YAxis
              tickFormatter={(value) => `$${toDollars(value)}`}
              tick={{ fontSize: 12, fill: 'var(--chart-text)' }}
              width={60}
              stroke="var(--chart-grid)"
            />
            <Tooltip
              formatter={(value: number | string | Array<number | string> | undefined) => [formatCurrency(Number(value || 0), false), 'Total Value']}
              labelStyle={{ color: 'var(--chart-tooltip-text)' }}
              contentStyle={{
                backgroundColor: 'var(--chart-tooltip-bg)',
                borderColor: 'var(--chart-tooltip-border)',
                color: 'var(--chart-tooltip-text)',
                borderRadius: '0.375rem',
                borderWidth: '1px',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="var(--chart-success)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--chart-success)' }}
              animationDuration={500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
