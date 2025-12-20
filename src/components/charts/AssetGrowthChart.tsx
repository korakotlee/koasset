import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { AssetHistory } from '../../types/AssetHistory';
import { formatCurrency, toDollars } from '../../services/currencyUtils';

interface AssetGrowthChartProps {
  history: AssetHistory[];
  height?: number;
}

export const AssetGrowthChart: React.FC<AssetGrowthChartProps> = ({
  history,
  height = 300
}) => {
  const data = useMemo(() => {
    // Sort history by date (oldest first for chart)
    const sortedHistory = [...history].sort((a, b) =>
      a.timestamp.getTime() - b.timestamp.getTime()
    );

    // Map to chart data format
    return sortedHistory.map(record => ({
      date: record.timestamp.toLocaleDateString(),
      timestamp: record.timestamp.getTime(),
      value: record.value,
      note: record.note
    }));
  }, [history]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700" style={{ height }}>
        <p className="text-gray-500 dark:text-gray-400 text-sm">No history data available yet.</p>
      </div>
    );
  }

  // If we only have one data point, we can't draw a line, but we can show a dot
  // Or we can add a "current" point if it's different/newer


  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 pt-4 px-4 pb-8" style={{ height: height + 80 }}>
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-4">Value History</h3>
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
              formatter={(value: number | string | Array<number | string> | undefined) => [formatCurrency(Number(value || 0), false), 'Value']}
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
              stroke="var(--chart-primary)"
              strokeWidth={2}
              dot={{ r: 4, fill: 'var(--chart-primary)', strokeWidth: 0 }}
              activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--chart-primary)' }}
              animationDuration={500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
