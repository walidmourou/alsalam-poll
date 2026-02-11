// Ramadan 2026: Starts with 30 Shaban (Feb 18) - 29 Ramadan (March 19)
// 30 Shaban 1447: February 18, 2026
// 1-29 Ramadan 1447: February 19 - March 19, 2026
// Eid al-Fitr: March 20, 2026

export const RAMADAN_START = "2026-02-18";
export const RAMADAN_END_30_DAYS = "2026-03-20";
export const RAMADAN_END_29_DAYS = "2026-03-19";
export const EID_30_DAYS = "2026-03-21";
export const EID_29_DAYS = "2026-03-20";

export const REGULAR_DAY_CAPACITY = 3;

// Generate Ramadan dates only (without Eid)
export function generateRamadanDates(): string[] {
  const dates: string[] = [];
  const start = new Date(RAMADAN_START);
  const end = new Date(RAMADAN_END_29_DAYS);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(d.toISOString().split("T")[0]);
  }

  return dates;
}

// Get Eid day as a special entry (not date-specific)
export function getEidEntry(): string {
  return "EID"; // Special identifier for Eid
}

export function isEidDay(date: string): boolean {
  return date === EID_30_DAYS || date === EID_29_DAYS;
}

// Simple Hijri date conversion (approximation based on Feb 18, 2026 = 30 Shaban 1447)
export function getHijriDate(
  gregorianDateStr: string,
  locale: "de" | "ar" = "de",
): {
  day: number;
  month: string;
  year: number;
} {
  const startDate = new Date(RAMADAN_START); // Feb 18, 2026 = 30 Shaban
  const currentDate = new Date(gregorianDateStr);

  // Calculate days difference from start date (30 Shaban)
  const diffTime = currentDate.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // Feb 18, 2026 = 30 Shaban 1447
  // Feb 19, 2026 = 1 Ramadan 1447
  let hijriDay: number;
  let monthName: string;

  if (diffDays === 0) {
    // First day: 30 Shaban
    hijriDay = 30;
    monthName = locale === "ar" ? "شعبان" : "Shaban";
  } else {
    // Following days: Ramadan (starting from day 1)
    hijriDay = diffDays;
    monthName = locale === "ar" ? "رمضان" : "Ramadan";
  }

  return {
    day: hijriDay,
    month: monthName,
    year: 1447,
  };
}

export function formatDateForDisplay(
  dateStr: string,
  locale: "de" | "ar",
): string {
  // Handle special Eid identifier
  if (dateStr === "EID") {
    return locale === "ar" ? "عيد الفطر" : "Eid al-Fitr";
  }

  const date = new Date(dateStr);

  if (locale === "ar") {
    // Use ar-u-nu-latn to get Arabic text with Latin (Western) numerals
    return date.toLocaleDateString("ar-u-nu-latn", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  return date.toLocaleDateString("de-DE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateWithHijri(
  dateStr: string,
  locale: "de" | "ar",
): string {
  const gregorian = formatDateForDisplay(dateStr, locale);
  const hijri = getHijriDate(dateStr, locale);

  if (locale === "ar") {
    return `${gregorian}\n${hijri.day} ${hijri.month} ${hijri.year}`;
  }

  return `${gregorian}\n${hijri.day}. ${hijri.month} ${hijri.year}`;
}
