export function formatNaira(amount: number): string {
  return `₦${amount.toFixed(2)}`;
}
