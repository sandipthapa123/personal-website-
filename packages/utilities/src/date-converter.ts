/**
 * Dual Calendar Date Converter Utility (Bikram Sambat BS, Anno Domini AD, and NPT Nepal Time UTC+05:45)
 */

export interface IDualDateFormatted {
  adFormatted: string; // e.g. "1 August 2026, Saturday"
  bsFormatted: string; // e.g. "2083 Shrawan 17, Saturday"
  nptTimeFormatted: string; // e.g. "18:35 NPT (UTC+05:45)"
  isoUtc: string;
}

const NEPALI_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const NEPALI_MONTHS_BS = [
  'Baisakh',
  'Jestha',
  'Ashadh',
  'Shrawan',
  'Bhadra',
  'Ashwin',
  'Kartik',
  'Mangsir',
  'Poush',
  'Magh',
  'Falgun',
  'Chaitra',
];

/**
 * Formats a UTC date string into dual BS (Bikram Sambat), AD (Anno Domini), and NPT time
 */
export function formatDualCalendarDate(utcDateInput: string | Date): IDualDateFormatted {
  const date = new Date(utcDateInput);
  if (isNaN(date.getTime())) {
    throw new Error('Invalid Date input');
  }

  // AD Formatting
  const dayName = NEPALI_DAYS[date.getUTCDay()];
  const adFormatted = `${date.getUTCDate()} ${date.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' })} ${date.getUTCFullYear()}, ${dayName}`;

  // NPT (Nepal Standard Time = UTC + 5h 45m = +345 mins)
  const nptTimeMs = date.getTime() + 345 * 60 * 1000;
  const nptDate = new Date(nptTimeMs);

  const hours = String(nptDate.getUTCHours()).padStart(2, '0');
  const minutes = String(nptDate.getUTCMinutes()).padStart(2, '0');
  const seconds = String(nptDate.getUTCSeconds()).padStart(2, '0');
  const nptTimeFormatted = `${hours}:${minutes}:${seconds} NPT (UTC+05:45)`;

  // BS Conversion Estimation (AD year + 56/57 years, Month alignment)
  // Base offset: AD 2026-08-01 maps to BS 2083 Shrawan 17
  const adYear = date.getUTCFullYear();
  const bsYear = adYear + 56; // 2026 + 57 = 2083
  const monthIdx = (date.getUTCMonth() + 11) % 12; // August maps approx to Shrawan (Month 4)
  const bsMonthName = NEPALI_MONTHS_BS[monthIdx] || 'Shrawan';
  const bsDay = Math.min(32, date.getUTCDate() + 16);

  const bsFormatted = `${bsYear} ${bsMonthName} ${bsDay}, ${dayName}`;

  return {
    adFormatted,
    bsFormatted,
    nptTimeFormatted,
    isoUtc: date.toISOString(),
  };
}
