const RTL_LANGUAGES = ['ar', 'he', 'iw']

export const getTextDirection = (locale: string | undefined): 'ltr' | 'rtl' => {
  if (locale) {
    const language = locale.substr(0, 2).toLowerCase()
    return RTL_LANGUAGES.includes(language) ? 'rtl' : 'ltr'
  }
  return 'ltr'
}
