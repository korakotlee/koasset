import { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, User, Phone, Mail, MapPin, AlertCircle } from 'lucide-react';
import type { Beneficiary, BeneficiaryRelationship } from '../../types/Beneficiary';
import { beneficiaryStorage } from '../../services/beneficiaryStorage';
import { EmptyState } from '../common/EmptyState';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface BeneficiaryListProps {
  beneficiaries: Beneficiary[];
  onEdit: (beneficiary: Beneficiary) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
}

export function BeneficiaryList({ beneficiaries, onEdit, onDelete, onCreate }: BeneficiaryListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRelationship, setFilterRelationship] = useState<string>('All');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const filteredBeneficiaries = useMemo(() => {
    return beneficiaries.filter(beneficiary => {
      const matchesSearch =
        beneficiary.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        beneficiary.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        beneficiary.relationship.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter = filterRelationship === 'All' || beneficiary.relationship === filterRelationship;

      return matchesSearch && matchesFilter;
    });
  }, [beneficiaries, searchTerm, filterRelationship]);

  const handleDelete = async (id: string) => {
    setDeleteError(null);
    if (window.confirm('Are you sure you want to delete this beneficiary?')) {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 300));
      const result = beneficiaryStorage.delete(id);
      if (result.success) {
        onDelete(id);
      } else {
        setDeleteError(result.error || 'Failed to delete beneficiary');
        // Clear error after 5 seconds
        setTimeout(() => setDeleteError(null), 5000);
      }
      setIsLoading(false);
    }
  };

  const relationships: (BeneficiaryRelationship | 'All')[] = [
    'All', 'Spouse', 'Child', 'Parent', 'Sibling', 'Trust', 'Estate', 'Charity', 'Friend', 'Other'
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 w-full sm:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search beneficiaries..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
            <select
              className="block w-full pl-10 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={filterRelationship}
              onChange={(e) => setFilterRelationship(e.target.value)}
            >
              {relationships.map(rel => (
                <option key={rel} value={rel}>{rel}</option>
              ))}
            </select>
          </div>

          <button
            onClick={onCreate}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Beneficiary
          </button>
        </div>
      </div>

      {deleteError && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error deleting beneficiary</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{deleteError}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {filteredBeneficiaries.length === 0 ? (
        <EmptyState
          title={beneficiaries.length === 0 ? "No beneficiaries yet" : "No matching beneficiaries"}
          description={beneficiaries.length === 0
            ? "Get started by adding your first beneficiary."
            : "Try adjusting your search or filters."}
          actionLabel={beneficiaries.length === 0 ? "Add Beneficiary" : "Clear filters"}
          onAction={beneficiaries.length === 0 ? onCreate : () => { setSearchTerm(''); setFilterRelationship('All'); }}
          icon={<User className="mx-auto h-12 w-12 text-gray-400" />}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBeneficiaries.map((beneficiary) => (
            <div key={beneficiary.id} className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-indigo-100 rounded-full p-2">
                      <User className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-medium text-gray-900 truncate" title={beneficiary.name}>
                        {beneficiary.name}
                      </h3>
                      <p className="text-sm text-gray-500">{beneficiary.relationship}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onEdit(beneficiary)}
                      className="text-gray-400 hover:text-indigo-600 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(beneficiary.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {beneficiary.email && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Mail className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                      <span className="truncate">{beneficiary.email}</span>
                    </div>
                  )}
                  {beneficiary.phoneNumber && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Phone className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                      <span className="truncate">{beneficiary.phoneNumber}</span>
                    </div>
                  )}
                  {beneficiary.address && (
                    <div className="flex items-start text-sm text-gray-500">
                      <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400 mt-0.5" />
                      <span className="line-clamp-2">{beneficiary.address}</span>
                    </div>
                  )}
                  {beneficiary.isMinor && (
                    <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                      Minor {beneficiary.guardianName ? `(Guardian: ${beneficiary.guardianName})` : ''}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
