const UZ = 'uz-UZ';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(UZ).format(Math.abs(amount)) + " so'm";
}

export function formatNumber(value: number): string {
  return value.toLocaleString(UZ);
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(UZ);
}

export function formatTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString(UZ, { hour: '2-digit', minute: '2-digit' });
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(UZ, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatMonthYear(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(UZ, { month: 'long', year: 'numeric' });
}
