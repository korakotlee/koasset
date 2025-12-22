import React, { useState, useMemo } from 'react';
import type { Asset } from '../../types/Asset';
import { assetStorage } from '../../services/assetStorage';
import { EmptyState } from '../common/EmptyState';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { formatCurrency } from '../../services/currencyUtils';

interface AssetListProps {
  onEdit: (asset: Asset) => void;
  onViewDetail: (asset: Asset) => void;
  onCreateNew: () => void;
}

export const AssetList: React.FC<AssetListProps> = ({ onEdit, onViewDetail, onCreateNew }) => {
  const [assets, setAssets] = useState<Asset[]>(() => assetStorage.load());
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'value' | 'category' | 'lastReviewed'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isLoading, setIsLoading] = useState(false);


  const filteredAssets = useMemo(() => {
    let result = [...assets];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(asset =>
        asset.name.toLowerCase().includes(query) ||
        asset.institution?.toLowerCase().includes(query) ||
        asset.accountNumber?.toLowerCase().includes(query) ||
        asset.notes?.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (categoryFilter) {
      result = result.filter(asset => asset.category === categoryFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'value':
          comparison = a.value - b.value;
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        case 'lastReviewed': {
          const dateA = a.lastReviewed ? new Date(a.lastReviewed).getTime() : 0;
          const dateB = b.lastReviewed ? new Date(b.lastReviewed).getTime() : 0;
          comparison = dateA - dateB;
          break;
        }
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [assets, searchQuery, categoryFilter, sortBy, sortOrder]);


  const maskAccountNumber = (accountNumber?: string): string => {
    if (!accountNumber) return 'N/A';
    if (accountNumber.length <= 4) return accountNumber;
    const lastFour = accountNumber.slice(-4);
    return `****${lastFour}`;
  };

  const calculateTotalValue = (): number => {
    return filteredAssets.reduce((sum, asset) => sum + asset.value, 0);
  };


  const handleMarkAsReviewed = async (asset: Asset) => {
    assetStorage.markAsReviewed(asset.id);
    // Reload without full delay for snappy interaction
    const loadedAssets = assetStorage.load();
    setAssets(loadedAssets);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 300));
      assetStorage.delete(id);
      const loadedAssets = assetStorage.load();
      setAssets(loadedAssets);
      setIsLoading(false);
    }
  };

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: typeof sortBy) => {
    if (sortBy !== field) return '↕';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const uniqueCategories = Array.from(new Set(assets.map(a => a.category))).sort();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Total Value */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Assets</h2>
          <p className="text-lg font-semibold text-green-600 mt-1">
            Total Value: {formatCurrency(calculateTotalValue())}
          </p>
        </div>
        <button
          onClick={onCreateNew}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Add Asset
        </button>
      </div>

      {/* Filters and Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Search assets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Categories</option>
          {uniqueCategories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* Assets Table */}
      {filteredAssets.length === 0 ? (
        <EmptyState
          title={assets.length === 0 ? "No assets yet" : "No matching assets"}
          description={assets.length === 0
            ? "Get started by adding your first asset to track your portfolio."
            : "Try adjusting your search or filters to find what you're looking for."}
          actionLabel={assets.length === 0 ? "Add Asset" : undefined}
          onAction={assets.length === 0 ? onCreateNew : undefined}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  onClick={() => toggleSort('name')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  Name {getSortIcon('name')}
                </th>
                <th
                  onClick={() => toggleSort('category')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  Category {getSortIcon('category')}
                </th>
                <th
                  onClick={() => toggleSort('value')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  Value {getSortIcon('value')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Institution
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account #
                </th>
                <th
                  onClick={() => toggleSort('lastReviewed')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  Last Reviewed {getSortIcon('lastReviewed')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAssets.map((asset) => (
                <tr
                  key={asset.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => onViewDetail(asset)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{asset.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {asset.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(asset.value)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {asset.institution || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                    {maskAccountNumber(asset.accountNumber)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {asset.lastReviewed
                      ? new Date(asset.lastReviewed).toLocaleDateString()
                      : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsReviewed(asset);
                        }}
                        className="text-green-600 hover:text-green-900"
                        title="Mark as Reviewed"
                      >
                        ✓
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(asset);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(asset.id);
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="text-sm text-gray-500">
        Showing {filteredAssets.length} of {assets.length} assets
      </div>
    </div>
  );
};
