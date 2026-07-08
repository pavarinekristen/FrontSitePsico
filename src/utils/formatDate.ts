export function getTodayInSaoPaulo(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
}

export function formatDateToBr(value: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value || 'a definir';
  }

  const [year, month, day] = value.split('-');
  void year;
  return `${day}/${month}/${year}`;
}
