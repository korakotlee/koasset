import { useState } from 'react';
import { Layout } from '../layout/Layout';
import { assetStorage } from '../../services/assetStorage';
import { PortfolioGrowthChart } from '../charts/PortfolioGrowthChart';
import { AssetCompositionChart } from '../charts/AssetCompositionChart';
import type { Asset } from '../../types/Asset';
import { formatCurrency } from '../../services/currencyUtils';

/**
 * Dashboard page component
 * Shows overview of assets, recent activity, and key metrics
 */
export function DashboardPage() {
  const [assets] = useState<Asset[]>(() => assetStorage.load());
  const [totalValue] = useState(() => assetStorage.getTotalValue());


  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Welcome back! Here's your financial overview.</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <p className="text-blue-100 text-sm font-medium mb-1">Net Worth</p>
            <p className="text-4xl font-bold">{formatCurrency(totalValue, false)}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Total Assets</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{assets.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Categories</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {new Set(assets.map(a => a.category)).size}
            </p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Growth Chart (Takes up 2/3 width) */}
          <div className="lg:col-span-2">
            <PortfolioGrowthChart assets={assets} height={350} />
          </div>

          {/* Allocation Chart (Takes up 1/3 width) */}
          <div className="lg:col-span-1">
            <AssetCompositionChart assets={assets} height={350} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
