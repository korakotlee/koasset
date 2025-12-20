// Beneficiary interface and related types for KoFi beneficiary management

/**
 * Beneficiary relationship classification
 * Represents the relationship between the user and their beneficiary
 */
export type BeneficiaryRelationship =
  | 'Spouse'
  | 'Child'
  | 'Parent'
  | 'Sibling'
  | 'Trust'
  | 'Estate'
  | 'Charity'
  | 'Friend'
  | 'Other';

/**
 * Beneficiary entity representing a person or entity designated to receive assets
 */
export interface Beneficiary {
  // Core Identity
  id: string;                          // Unique identifier (UUID v4)
  name: string;                        // Full name

  // Contact Information
  email?: string;                      // Email address
  phoneNumber?: string;                // Phone number
  address?: string;                    // Mailing address

  // Relationship
  relationship: BeneficiaryRelationship; // Relationship to asset owner

  // Minor Information (if applicable)
  isMinor?: boolean;                   // Whether beneficiary is a minor
  guardianName?: string;               // Guardian name if beneficiary is minor

  // Metadata
  createdAt: Date;                     // Creation timestamp
  updatedAt: Date;                     // Last modification timestamp
}
