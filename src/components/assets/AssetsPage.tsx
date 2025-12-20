import React, { useState } from 'react';
import { Layout } from '../layout/Layout';
import type { Asset } from '../../types/Asset';
import { AssetList } from './AssetList';
import { AssetForm } from './AssetForm';
import { AssetDetail } from './AssetDetail';
import { assetStorage } from '../../services/assetStorage';
import { ErrorState } from '../common/ErrorState';

type ViewMode = 'list' | 'create' | 'edit' | 'detail';

export const AssetsPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedAsset, setSelectedAsset] = useState<Asset | undefined>();
  const [error, setError] = useState<string | null>(null);

  const handleCreateNew = () => {
    setSelectedAsset(undefined);
    setError(null);
    setViewMode('create');
  };

  const handleEdit = (asset: Asset) => {
    setSelectedAsset(asset);
    setError(null);
    setViewMode('edit');
  };

  const handleViewDetail = (asset: Asset) => {
    setSelectedAsset(asset);
    setError(null);
    setViewMode('detail');
  };

  const handleSave = (assetData: Partial<Asset>) => {
    try {
      setError(null);
      if (selectedAsset) {
        // Update existing asset
        assetStorage.update(selectedAsset.id, assetData);
      } else {
        // Create new asset
        assetStorage.create({
          name: assetData.name!,
          category: assetData.category!,
          value: assetData.value!,
          interestRate: assetData.interestRate,
          maturityDate: assetData.maturityDate,
          institution: assetData.institution,
          accountNumber: assetData.accountNumber,
          phoneNumber: assetData.phoneNumber,
          url: assetData.url,
          username: assetData.username,
          passwordHint: assetData.passwordHint,
          primaryBeneficiaryId: assetData.primaryBeneficiaryId,
          contingentBeneficiaryIds: assetData.contingentBeneficiaryIds,
          notes: assetData.notes,
          lastReviewed: assetData.lastReviewed,
        });
      }
      setViewMode('list');
      setSelectedAsset(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save asset');
    }
  };

  const handleCancel = () => {
    setViewMode('list');
    setSelectedAsset(undefined);
    setError(null);
  };

  const handleCloseDetail = () => {
    setViewMode('list');
    setSelectedAsset(undefined);
    setError(null);
  };

  const handleEditFromDetail = () => {
    setViewMode('edit');
    setError(null);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-6">
            <ErrorState
              title="Error Saving Asset"
              message={error}
              onRetry={() => setError(null)}
              retryLabel="Dismiss"
            />
          </div>
        )}

        {viewMode === 'list' && (
          <AssetList
            onEdit={handleEdit}
            onViewDetail={handleViewDetail}
            onCreateNew={handleCreateNew}
          />
        )}

        {(viewMode === 'create' || viewMode === 'edit') && (
          <div className="bg-white rounded-lg shadow-lg">
            <AssetForm
              asset={selectedAsset}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </div>
        )}

        {viewMode === 'detail' && selectedAsset && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <AssetDetail
              asset={selectedAsset}
              onEdit={handleEditFromDetail}
              onClose={handleCloseDetail}
            />
          </div>
        )}
      </div>
    </Layout>
  );
};
