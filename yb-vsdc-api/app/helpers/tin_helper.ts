// F-43: Customer TIN Sync — TIN validation and utilities

/**
 * Validates Rwandan TIN format (15 digits)
 * According to RRA spec, TINs are 15-digit numbers
 * @param tin The TIN string to validate
 * @returns {boolean} true if valid format, false otherwise
 */
export function isValidTinFormat(tin: string | number): boolean {
  const tinStr = String(tin).trim()
  return /^\d{15}$/.test(tinStr)
}

/**
 * Formats TIN for display (with grouping)
 * @param tin The TIN to format
 * @returns Formatted TIN string
 */
export function formatTin(tin: string | number): string {
  const tinStr = String(tin).trim()
  if (!isValidTinFormat(tinStr)) return tinStr
  // Format as: XXX-XXXXX-XXX-XX (3-5-3-2 pattern)
  return tinStr.replace(/(\d{3})(\d{5})(\d{3})(\d{2})/, '$1-$2-$3-$4')
}

/**
 * Removes formatting from TIN
 * @param tin The formatted TIN
 * @returns Raw 15-digit TIN
 */
export function unformatTin(tin: string): string {
  return tin.replace(/-/g, '').trim()
}
