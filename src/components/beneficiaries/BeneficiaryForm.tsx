import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import type { Beneficiary, BeneficiaryRelationship } from '../../types/Beneficiary';
import { beneficiaryStorage } from '../../services/beneficiaryStorage';

interface BeneficiaryFormProps {
  initialData?: Beneficiary;
  onSave: () => void;
  onCancel: () => void;
}

export function BeneficiaryForm({ initialData, onSave, onCancel }: BeneficiaryFormProps) {
  const [formData, setFormData] = useState<Partial<Beneficiary>>({
    name: '',
    email: '',
    phoneNumber: '',
    address: '',
    relationship: 'Other',
    isMinor: false,
    guardianName: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        email: initialData.email || '',
        phoneNumber: initialData.phoneNumber || '',
        address: initialData.address || '',
        relationship: initialData.relationship,
        isMinor: initialData.isMinor || false,
        guardianName: initialData.guardianName || '',
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (formData.phoneNumber && !/^[\d\s()+-]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Invalid phone number format';
    }

    if (formData.isMinor && !formData.guardianName?.trim()) {
      newErrors.guardianName = 'Guardian name is required for minors';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (initialData) {
        beneficiaryStorage.update(initialData.id, formData);
      } else {
        beneficiaryStorage.create(formData as Omit<Beneficiary, 'id' | 'createdAt' | 'updatedAt'>);
      }
      onSave();
    } catch (error) {
      console.error('Failed to save beneficiary:', error);
      setErrors({ submit: 'Failed to save beneficiary. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const relationships: BeneficiaryRelationship[] = [
    'Spouse', 'Child', 'Parent', 'Sibling', 'Trust', 'Estate', 'Charity', 'Friend', 'Other'
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto p-6">
      <h2 className="text-2xl font-bold text-gray-900">
        {initialData ? 'Edit Beneficiary' : 'Add New Beneficiary'}
      </h2>

      {errors.submit && (
        <div className="mb-4 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{errors.submit}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">Basic Information</h3>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="relationship" className="block text-sm font-medium text-gray-700 mb-1">
            Relationship <span className="text-red-500">*</span>
          </label>
          <select
            id="relationship"
            name="relationship"
            value={formData.relationship}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {relationships.map(rel => (
              <option key={rel} value={rel}>{rel}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.phoneNumber && <p className="mt-1 text-sm text-red-500">{errors.phoneNumber}</p>}
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">Address</h3>
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
            Mailing Address
          </label>
          <textarea
            id="address"
            name="address"
            rows={3}
            value={formData.address}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Guardian Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">Guardian Information</h3>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isMinor"
            name="isMinor"
            checked={formData.isMinor}
            onChange={handleCheckboxChange}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="isMinor" className="text-sm font-medium text-gray-700">
            Beneficiary is a minor
          </label>
        </div>
        <p className="text-sm text-gray-500 ml-6 -mt-2">Requires a guardian to be specified.</p>

        {formData.isMinor && (
          <div>
            <label htmlFor="guardianName" className="block text-sm font-medium text-gray-700 mb-1">
              Guardian Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="guardianName"
              name="guardianName"
              value={formData.guardianName}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.guardianName ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.guardianName && <p className="mt-1 text-sm text-red-500">{errors.guardianName}</p>}
          </div>
        )}
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
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : (initialData ? 'Update Beneficiary' : 'Create Beneficiary')}
        </button>
      </div>
    </form>
  );
}
