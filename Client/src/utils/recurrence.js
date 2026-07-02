export const RECURRENCE_OPTIONS = [
  { value: 'none',     label: 'Does not repeat' },
  { value: 'daily',    label: 'Daily'           },
  { value: 'weekly',   label: 'Weekly'          },
  { value: 'biweekly', label: 'Biweekly'        },
  { value: 'monthly',  label: 'Monthly'         },
  { value: 'yearly',   label: 'Yearly'          },
];

export function generateDates(startDate, recurrence, count) {
  const [y, m, d] = startDate.split('-').map(Number);
  return Array.from({ length: count }, (_, i) => {
    const dt = new Date(y, m - 1, d);
    if (recurrence === 'daily')    dt.setDate(dt.getDate() + i);
    if (recurrence === 'weekly')   dt.setDate(dt.getDate() + i * 7);
    if (recurrence === 'biweekly') dt.setDate(dt.getDate() + i * 14);
    if (recurrence === 'monthly')  dt.setMonth(dt.getMonth() + i);
    if (recurrence === 'yearly')   dt.setFullYear(dt.getFullYear() + i);
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
  });
}
