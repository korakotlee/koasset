import React, { useState } from 'react';
import type { Asset, AssetCategory } from '../../types/Asset';
import type { Beneficiary } from '../../types/Beneficiary';
import { beneficiaryStorage } from '../../services/beneficiaryStorage';
import { toCents, toDollars } from '../../services/currencyUtils';

interface AssetFormProps {
  asset?: Asset;
  onSave: (asset: Partial<Asset>) => void;
  onCancel: () => void;
}

const ASSET_CATEGORIES: AssetCategory[] = [
  'Checking Account',
  'Savings Account',
  'Money Market Account',
  'IRA',
  '401k',
  'Roth IRA',
  'Brokerage Account',
  '529 Plan',
  'HSA',
  'Life Insurance',
  'Disability Insurance',
  'Long-term Care Insurance',
  'Real Estate',
  'Vehicle',
  'Stocks',
  'Bonds',
  'Mutual Funds',
  'Crypto',
  'Cash',
  'Business Equity',
  'Collectibles',
  'Other',
];

export const AssetForm: React.FC<AssetFormProps> = ({ asset, onSave, onCancel }) => {
  const [beneficiaries] = useState<Beneficiary[]>(() => beneficiaryStorage.load());
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: asset?.name || '',
    category: asset?.category || '' as AssetCategory,
    value: asset?.value !== undefined ? toDollars(asset.value).toString() : '',
    interestRate: asset?.interestRate?.toString() || '',
    maturityDate: asset?.maturityDate ? new Date(asset.maturityDate).toISOString().split('T')[0] : '',
    institution: asset?.institution || '',
    accountNumber: asset?.accountNumber || '',
    phoneNumber: asset?.phoneNumber || '',
    url: asset?.url || '',
    username: asset?.username || '',
    passwordHint: asset?.passwordHint || '',
    primaryBeneficiaryId: asset?.primaryBeneficiaryId || '',
    contingentBeneficiaryIds: asset?.contingentBeneficiaryIds || [],
    notes: asset?.notes || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleContingentBeneficiaryToggle = (beneficiaryId: string) => {
    setFormData(prev => {
      const current = prev.contingentBeneficiaryIds;
      const updated = current.includes(beneficiaryId)
        ? current.filter(id => id !== beneficiaryId)
        : [...current, beneficiaryId];
      return { ...prev, contingentBeneficiaryIds: updated };
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = 'Asset name is required';
    } else if (formData.name.length > 200) {
      newErrors.name = 'Name must be 200 characters or less';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.value) {
      newErrors.value = 'Value is required';
    } else {
      const valueNum = parseFloat(formData.value);
      if (isNaN(valueNum) || valueNum < 0) {
        newErrors.value = 'Value must be a non-negative number';
      }
    }

    // Optional field validations
    if (formData.interestRate) {
      const rate = parseFloat(formData.interestRate);
      if (isNaN(rate) || rate < 0 || rate > 100) {
        newErrors.interestRate = 'Interest rate must be between 0 and 100';
      }
    }

    if (formData.institution && formData.institution.length > 200) {
      newErrors.institution = 'Institution name must be 200 characters or less';
    }

    if (formData.accountNumber && formData.accountNumber.length > 100) {
      newErrors.accountNumber = 'Account number must be 100 characters or less';
    }

    if (formData.phoneNumber && formData.phoneNumber.length > 0) {
      const phoneRegex = /^[\d\s\-()+]+$/;
      if (!phoneRegex.test(formData.phoneNumber)) {
        newErrors.phoneNumber = 'Invalid phone number format';
      }
    }

    if (formData.url && formData.url.length > 0) {
      try {
        new URL(formData.url);
      } catch {
        newErrors.url = 'Invalid URL format';
      }
    }

    if (formData.username && formData.username.length > 200) {
      newErrors.username = 'Username must be 200 characters or less';
    }

    if (formData.passwordHint && formData.passwordHint.length > 500) {
      newErrors.passwordHint = 'Password hint must be 500 characters or less';
    }

    if (formData.notes.length > 2000) {
      newErrors.notes = 'Notes must be 2000 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const assetData: Partial<Asset> = {
      ...asset,
      name: formData.name.trim(),
      category: formData.category,
      value: toCents(formData.value),
      interestRate: formData.interestRate ? parseFloat(formData.interestRate) : undefined,
      maturityDate: formData.maturityDate ? new Date(formData.maturityDate) : undefined,
      institution: formData.institution || undefined,
      accountNumber: formData.accountNumber || undefined,
      phoneNumber: formData.phoneNumber || undefined,
      url: formData.url || undefined,
      username: formData.username || undefined,
      passwordHint: formData.passwordHint || undefined,
      primaryBeneficiaryId: formData.primaryBeneficiaryId || undefined,
      contingentBeneficiaryIds: formData.contingentBeneficiaryIds.length > 0 ? formData.contingentBeneficiaryIds : undefined,
      notes: formData.notes || undefined,
    };

    onSave(assetData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto p-6">
      <h2 className="text-2xl font-bold text-gray-900">
        {asset ? 'Edit Asset' : 'Create New Asset'}
      </h2>

      {/* Core Identity */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">Basic Information</h3>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Asset Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Chase Total Checking, Fidelity 401k"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.category ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select a category</option>
            {ASSET_CATEGORIES.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-1">
              Current Value (USD) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="value"
              name="value"
              value={formData.value}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.value ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.value && <p className="mt-1 text-sm text-red-500">{errors.value}</p>}
          </div>

          <div>
            <label htmlFor="interestRate" className="block text-sm font-medium text-gray-700 mb-1">
              Interest Rate (%)
            </label>
            <input
              type="number"
              id="interestRate"
              name="interestRate"
              value={formData.interestRate}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              max="100"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.interestRate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.interestRate && <p className="mt-1 text-sm text-red-500">{errors.interestRate}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="maturityDate" className="block text-sm font-medium text-gray-700 mb-1">
            Maturity Date
          </label>
          <input
            type="date"
            id="maturityDate"
            name="maturityDate"
            value={formData.maturityDate}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Institution/Provider Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">Institution Details</h3>

        <div>
          <label htmlFor="institution" className="block text-sm font-medium text-gray-700 mb-1">
            Institution/Provider
          </label>
          <input
            type="text"
            id="institution"
            name="institution"
            value={formData.institution}
            onChange={handleChange}
            placeholder="e.g., JPMorgan Chase, Fidelity"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.institution ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.institution && <p className="mt-1 text-sm text-red-500">{errors.institution}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Account/Policy Number
            </label>
            <input
              type="text"
              id="accountNumber"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              placeholder="1234567890"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.accountNumber ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.accountNumber && <p className="mt-1 text-sm text-red-500">{errors.accountNumber}</p>}
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Customer Service Phone
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="(800) 555-1234"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.phoneNumber && <p className="mt-1 text-sm text-red-500">{errors.phoneNumber}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
            Online Account URL
          </label>
          <input
            type="url"
            id="url"
            name="url"
            value={formData.url}
            onChange={handleChange}
            placeholder="https://example.com/login"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.url ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.url && <p className="mt-1 text-sm text-red-500">{errors.url}</p>}
        </div>
      </div>

      {/* Access Credentials */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">Access Information</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username/Email
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="user@example.com"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.username ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.username && <p className="mt-1 text-sm text-red-500">{errors.username}</p>}
          </div>

          <div>
            <label htmlFor="passwordHint" className="block text-sm font-medium text-gray-700 mb-1">
              Password Hint (NOT actual password)
            </label>
            <input
              type="text"
              id="passwordHint"
              name="passwordHint"
              value={formData.passwordHint}
              onChange={handleChange}
              placeholder="e.g., Pet name + birth year"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.passwordHint ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.passwordHint && <p className="mt-1 text-sm text-red-500">{errors.passwordHint}</p>}
          </div>
        </div>
      </div>

      {/* Beneficiaries */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">Beneficiaries</h3>

        <div>
          <label htmlFor="primaryBeneficiaryId" className="block text-sm font-medium text-gray-700 mb-1">
            Primary Beneficiary
          </label>
          <select
            id="primaryBeneficiaryId"
            name="primaryBeneficiaryId"
            value={formData.primaryBeneficiaryId}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a beneficiary</option>
            {beneficiaries.map(beneficiary => (
              <option key={beneficiary.id} value={beneficiary.id}>
                {beneficiary.name} ({beneficiary.relationship})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contingent Beneficiaries
          </label>
          <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
            {beneficiaries.length === 0 ? (
              <p className="text-sm text-gray-500">No beneficiaries available. Create beneficiaries first.</p>
            ) : (
              beneficiaries.map(beneficiary => (
                <label key={beneficiary.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.contingentBeneficiaryIds.includes(beneficiary.id)}
                    onChange={() => handleContingentBeneficiaryToggle(beneficiary.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    {beneficiary.name} ({beneficiary.relationship})
                  </span>
                </label>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Additional notes or details about this asset"
          rows={4}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.notes ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.notes && <p className="mt-1 text-sm text-red-500">{errors.notes}</p>}
        <p className="mt-1 text-xs text-gray-500">{formData.notes.length}/2000 characters</p>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-4 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {asset ? 'Update Asset' : 'Create Asset'}
        </button>
      </div>
    </form>
  );
};
