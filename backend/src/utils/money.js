export function toNumber(value) {
  if (value === null || value === undefined || value === '') return 0;
  return Number(value) || 0;
}

export function roundMoney(value) {
  return Math.round(toNumber(value) * 100) / 100;
}

export function daysBetween(from, to = new Date()) {
  if (!from) return 0;
  const start = new Date(from);
  const end = new Date(to);
  return Math.max(0, Math.floor((end - start) / 86400000));
}
