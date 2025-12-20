// AssetHistory interface for tracking value changes over time
export interface AssetHistory {
  id: string;
  assetId: string;
  value: number; // Value in cents
  timestamp: Date;
  note?: string;
}
