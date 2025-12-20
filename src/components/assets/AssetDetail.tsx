import React, { useMemo } from 'react';
import type { Asset } from '../../types/Asset';
import { beneficiaryStorage } from '../../services/beneficiaryStorage';
import { historyStorage } from '../../services/historyStorage';
import { AssetGrowthChart } from '../charts/AssetGrowthChart';
import { formatCurrency } from '../../services/currencyUtils';

interface AssetDetailProps {
  asset: Asset;
  onEdit: () => void;
  onClose: () => void;
}

const DetailRow: React.FC<{ label: string; value: string | number | undefined; mono?: boolean }> = ({ label, value, mono = false }) => {
  if (!value && value !== 0) return null;

  return (
    <div className="py-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</dt>
      <dd className={`text-sm text-gray-900 dark:text-white ${mono ? 'font-mono' : ''}`}>{value}</dd>
    </div>
  );
};

export const AssetDetail: React.FC<AssetDetailProps> = ({ asset, onEdit, onClose }) => {
  const history = useMemo(() => {
    return historyStorage.getByAssetId(asset.id);
  }, [asset.id]);


  const formatDate = (date?: Date): string => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getBeneficiaryName = (beneficiaryId: string): string => {
    const beneficiary = beneficiaryStorage.find(beneficiaryId);
    if (!beneficiary) return 'Unknown';
    return `${beneficiary.name} (${beneficiary.relationship})`;
  };

  const maskAccountNumber = (accountNumber?: string): string => {
    if (!accountNumber) return 'N/A';
    if (accountNumber.length <= 4) return accountNumber;
    const lastFour = accountNumber.slice(-4);
    return `****${lastFour}`;
  };



  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{asset.name}</h2>
          <span className="inline-block px-3 py-1 mt-2 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
            {asset.category}
          </span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Value Highlight */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-6 mb-6">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Current Value</p>
        <p className="text-4xl font-bold text-green-700 dark:text-green-400">{formatCurrency(asset.value)}</p>
      </div>

      {/* Growth Chart */}
      <div className="mb-6">
        <AssetGrowthChart history={history} />
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Financial Details */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Financial Details</h3>
          <dl className="divide-y divide-gray-200 dark:divide-gray-700">
            <DetailRow label="Category" value={asset.category} />
            <DetailRow label="Current Value" value={formatCurrency(asset.value)} />
            <DetailRow label="Interest Rate" value={asset.interestRate ? `${asset.interestRate}%` : undefined} />
            <DetailRow label="Maturity Date" value={formatDate(asset.maturityDate)} />
          </dl>
        </div>

        {/* Institution Details */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Institution Information</h3>
          <dl className="divide-y divide-gray-200 dark:divide-gray-700">
            <DetailRow label="Institution" value={asset.institution} />
            <DetailRow label="Account Number" value={maskAccountNumber(asset.accountNumber)} mono />
            <DetailRow label="Customer Service Phone" value={asset.phoneNumber} mono />
            {asset.url && (
              <div className="py-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Online Account</dt>
                <dd>
                  <a
                    href={asset.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
                  >
                    {asset.url}
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Access Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Access Information</h3>
          <dl className="divide-y divide-gray-200 dark:divide-gray-700">
            <DetailRow label="Username/Email" value={asset.username} />
            <DetailRow label="Password Hint" value={asset.passwordHint} />
          </dl>
          {(asset.username || asset.passwordHint) && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-xs text-yellow-800 dark:text-yellow-200">
                ⚠️ For security, use a password manager for actual credentials
              </p>
            </div>
          )}
        </div>

        {/* Beneficiary Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Beneficiaries</h3>
          <dl className="divide-y divide-gray-200 dark:divide-gray-700">
            {asset.primaryBeneficiaryId && (
              <div className="py-3 border-b border-gray-200 dark:border-gray-700">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Primary Beneficiary</dt>
                <dd className="text-sm text-gray-900 dark:text-white">{getBeneficiaryName(asset.primaryBeneficiaryId)}</dd>
              </div>
            )}
            {asset.contingentBeneficiaryIds && asset.contingentBeneficiaryIds.length > 0 && (
              <div className="py-3">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Contingent Beneficiaries</dt>
                <dd className="text-sm text-gray-900 dark:text-white">
                  <ul className="list-disc list-inside space-y-1">
                    {asset.contingentBeneficiaryIds.map((id, index) => (
                      <li key={id}>
                        {index + 1}. {getBeneficiaryName(id)}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            )}
            {!asset.primaryBeneficiaryId && (!asset.contingentBeneficiaryIds || asset.contingentBeneficiaryIds.length === 0) && (
              <p className="text-sm text-gray-500 dark:text-gray-400 py-3">No beneficiaries assigned</p>
            )}
          </dl>
        </div>
      </div>

      {/* Notes Section */}
      {asset.notes && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notes</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{asset.notes}</p>
        </div>
      )}

      {/* Metadata */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Metadata</h3>
        <dl className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</dt>
            <dd className="text-sm text-gray-900 dark:text-white mt-1">{formatDate(asset.createdAt)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</dt>
            <dd className="text-sm text-gray-900 dark:text-white mt-1">{formatDate(asset.updatedAt)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Reviewed</dt>
            <dd className="text-sm text-gray-900 dark:text-white mt-1">
              {asset.lastReviewed ? formatDate(asset.lastReviewed) : (
                <span className="text-yellow-600">Never reviewed</span>
              )}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
};
