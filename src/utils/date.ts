// src/utils/date.ts
const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export const formatDobDisplay = (d: Date) =>
  `${String(d.getDate()).padStart(2, '0')}-${MONTHS_SHORT[d.getMonth()]}-${d.getFullYear()}`;

export const formatDobForApi = (d: Date) => {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};
