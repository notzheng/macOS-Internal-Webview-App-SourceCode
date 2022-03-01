import React, { ReactElement } from 'react'
import { MacOsWindow } from '@src/v1/lib/mac-bridge'
import LocaleContext from '@src/v1/contexts/locale'
import LocStringsContext from '@src/v1/contexts/loc-strings'

/**
 * This component should be used in main.tsx. It will provide the loc strings and the locale to all child components.
 */

interface I18nProviderProps {
  window: Window
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children: any
}

const I18nProvider = ({
  children,
  window,
}: I18nProviderProps): ReactElement => {
  const { BUILD_INFO, __loc_strings } = (window as unknown) as MacOsWindow
  return (
    <LocaleContext.Provider
      value={BUILD_INFO?.buildLocale || window.navigator.language}
    >
      <LocStringsContext.Provider value={__loc_strings}>
        {children}
      </LocStringsContext.Provider>
    </LocaleContext.Provider>
  )
}

export default I18nProvider
