// Libraries
import 'normalize.css'
import React, { ReactElement } from 'react'
import ReactDOM from 'react-dom'
import { webClientIsReady, openHelp, MacOsWindow } from '@src/v1/lib/mac-bridge'
import LocStringsContext from '@src/v1/contexts/loc-strings'
import App from './index'
import { HELP_TOPIC } from '@src/v1/components/help-icon'

interface WindowWithAppData extends MacOsWindow {
  __app_data: PageDataAppleSubscriptions
}

const AppleSubscriptionWithNative = (): ReactElement | null => {
  const {
    __loc_strings,
    __app_data: appData,
  } = (window as unknown) as WindowWithAppData
  const handleOpenHelp = (): void => {
    openHelp(HELP_TOPIC.CHANGE_SUBSCRIPTION)
  }

  return (
    <LocStringsContext.Provider value={__loc_strings}>
      <App onOpenHelp={handleOpenHelp} appData={appData} />
    </LocStringsContext.Provider>
  )
}

webClientIsReady()

// Render
const rootEl = document.getElementById('app')
ReactDOM.render(<AppleSubscriptionWithNative />, rootEl)
