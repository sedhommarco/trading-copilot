export const CONFIG = {
  githubUser: 'sedhommarco',
  repo: 'trading-copilot',
  branch: 'main',
  dataPath: 'https://raw.githubusercontent.com/sedhommarco/trading-copilot/main/data/',
} as const;

export function formatNumber(value: number | null | undefined, decimals = 2): string {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  return Number(value).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
