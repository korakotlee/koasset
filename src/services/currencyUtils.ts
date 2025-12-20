/**
 * Utility functions for handling monetary values in cents to avoid floating point precision issues.
 */

/**
 * Converts a dollar amount (number or string) to cents.
 * Handles input like "123", "123.45", 123.45.
 * Uses rounding to ensure accuracy for inputs with more than 2 decimal places.
 */
export const toCents = (dollars: number | string): number => {
  const amount = typeof dollars === 'string' ? parseFloat(dollars.replace(/,/g, '')) : dollars;
  if (isNaN(amount)) return 0;
  // Round to nearest integer to avoid precision issues like 1.1 * 100 = 110.00000000000001
  return Math.round(amount * 100);
};

/**
 * Converts a cent amount to dollars.
 */
export const toDollars = (cents: number): number => {
  return cents / 100;
};

/**
 * Formats a cent amount as a currency string (USD).
 * @param cents - Value in cents
 * @param includeDecimals - Whether to show .00 for whole numbers
 */
export const formatCurrency = (cents: number, includeDecimals: boolean = true): string => {
  const dollars = toDollars(cents);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(dollars);
};
