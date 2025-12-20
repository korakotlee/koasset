// Asset interface and related types for KoFi asset management

/**
 * Asset category classification
 * Represents 24 different asset types from financial accounts to physical property
 */
export type AssetCategory =
  // Financial Accounts
  | 'Checking Account'
  | 'Savings Account'
  | 'Money Market Account'

  // Investment Accounts
  | 'IRA'                              // Individual Retirement Account
  | '401k'                             // Employer-sponsored 401(k)
  | 'Roth IRA'
  | 'Brokerage Account'                // Trading/Investment account
  | '529 Plan'                         // Education savings
  | 'HSA'                              // Health Savings Account

  // Insurance
  | 'Life Insurance'
  | 'Disability Insurance'
  | 'Long-term Care Insurance'

  // Real Estate & Property
  | 'Real Estate'                      // Primary residence, rental property
  | 'Vehicle'                          // Cars, boats, RVs

  // Other Assets
  | 'Stocks'                           // Individual stock holdings
  | 'Bonds'
  | 'Mutual Funds'
  | 'Crypto'                           // Cryptocurrency
  | 'Cash'                             // Physical cash holdings
  | 'Business Equity'
  | 'Collectibles'                     // Art, jewelry, antiques
  | 'Other';                           // Miscellaneous

/**
 * Asset entity representing a financial or physical item in the user's portfolio
 */
export interface Asset {
  // Core Identity
  id: string;                          // Unique identifier (UUID v4)
  name: string;                        // Asset name (e.g., "Chase Checking", "Fidelity 401k")
  category: AssetCategory;             // Asset classification

  // Financial Details
  value: number;                       // Current value/balance in CENTS (e.g., 10000 for $100.00)
  interestRate?: number;               // Annual interest rate (percentage, e.g., 4.5 for 4.5%)
  maturityDate?: Date;                 // For CDs, bonds, term policies

  // Institution/Provider Information
  institution?: string;                // Bank/Company name (e.g., "Chase", "Fidelity", "State Farm")
  accountNumber?: string;              // Account or policy number
  phoneNumber?: string;                // Customer service phone number
  url?: string;                        // Online account login URL

  // Access Credentials (for reference only)
  username?: string;                   // Login username/email
  passwordHint?: string;               // Password reminder (NOT actual password)

  // Beneficiary References (IDs of Beneficiary entities)
  primaryBeneficiaryId?: string;       // ID of primary beneficiary
  contingentBeneficiaryIds?: string[]; // IDs of contingent beneficiaries (in order of priority)

  // Additional Details
  notes?: string;                      // Free-form notes or description
  icon?: string;                       // Optional icon/image path or URL

  // Metadata
  createdAt: Date;                     // Creation timestamp
  updatedAt: Date;                     // Last modification timestamp
  lastReviewed?: Date;                 // Last time user reviewed/verified this asset
}
