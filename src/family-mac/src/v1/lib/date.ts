export const daysFromToday = (days: number): Date => {
  const newDate = new Date()
  newDate.setDate(newDate.getDate() + days)
  return newDate
}

/**
 *
 * @param date The date to format
 * @param locale The locale to format
 */
export const toLocaleDateString = (date: Date, locale: string): string => {
  // XXX this is a hack until we can get the right calendar from preferences.
  // See: rdar://69793689 (LOC: AR-SA: macOS: Family Limit Messages QA: Date parameter is pulling from the Islamic calendar)
  if (locale.toLowerCase().startsWith('ar')) {
    // Defaults to Eastern Arabic numerals and Gregorian calendar.
    return date.toLocaleDateString('ar')
  } else {
    return date.toLocaleDateString(locale)
  }
}
