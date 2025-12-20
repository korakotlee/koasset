import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import type { Asset } from '../../types/Asset';
import { formatCurrency } from '../../services/currencyUtils';

interface AssetCompositionChartProps {
  assets: Asset[];
  height?: number;
}

// Modern, distinct colors for the pie chart
const COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#06b6d4', // cyan-500
  '#f97316', // orange-500
];

export const AssetCompositionChart: React.FC<AssetCompositionChartProps> = ({
  assets,
  height = 300
}) => {
  const data = useMemo(() => {
    // Group by category or just show top assets?
    // Let's show top 5 assets + "Other" for now to keep it clean
    // Or just all assets if there are few.

    // Let's do by Category for a better high-level view
    const categoryMap = new Map<string, number>();

    assets.forEach(asset => {
      const current = categoryMap.get(asset.category) || 0;
      categoryMap.set(asset.category, current + asset.value);
    });

    const chartData = Array.from(categoryMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value); // Sort by value descending

    return chartData;
  }, [assets]);


  if (assets.length === 0) {
    return (
      <div className="flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700" style={{ height }}>
        <p className="text-gray-500 dark:text-gray-400 text-sm">No assets to display.</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 pt-4 px-4 pb-8" style={{ height: height + 80 }}>
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-4">Portfolio Allocation</h3>
      <div style={{ width: '100%', height: height }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number | string | Array<number | string> | undefined) => [formatCurrency(Number(value || 0), false), 'Value']}
              contentStyle={{
                backgroundColor: 'var(--chart-tooltip-bg)',
                borderColor: 'var(--chart-tooltip-border)',
                color: 'var(--chart-tooltip-text)',
                borderRadius: '0.375rem',
                borderWidth: '1px',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              wrapperStyle={{ color: 'var(--chart-text)' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
