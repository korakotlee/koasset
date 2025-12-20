import { useState, useCallback } from 'react';
import { Layout } from '../layout/Layout';
import { BeneficiaryList } from './BeneficiaryList';
import { BeneficiaryForm } from './BeneficiaryForm';
import type { Beneficiary } from '../../types/Beneficiary';
import { beneficiaryStorage } from '../../services/beneficiaryStorage';

export function BeneficiariesPage() {
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>(() => beneficiaryStorage.load());
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | undefined>(undefined);

  const loadBeneficiaries = useCallback(() => {
    const data = beneficiaryStorage.load();
    setBeneficiaries(data);
  }, []);

  const handleCreate = () => {
    setSelectedBeneficiary(undefined);
    setView('create');
  };

  const handleEdit = (beneficiary: Beneficiary) => {
    setSelectedBeneficiary(beneficiary);
    setView('edit');
  };

  const handleDelete = () => {
    // Optimistic update, actual delete logic is in BeneficiaryList which calls storage
    loadBeneficiaries();
  };

  const handleSave = () => {
    loadBeneficiaries();
    setView('list');
  };

  const handleCancel = () => {
    setView('list');
    setSelectedBeneficiary(undefined);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Beneficiaries
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage beneficiaries for your assets and estate planning.
            </p>
          </div>
        </div>

        {view === 'list' && (
          <BeneficiaryList
            beneficiaries={beneficiaries}
            onCreate={handleCreate}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

        {(view === 'create' || view === 'edit') && (
          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg">
            <BeneficiaryForm
              initialData={selectedBeneficiary}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </div>
        )}
      </div>
    </Layout>
  );
}
