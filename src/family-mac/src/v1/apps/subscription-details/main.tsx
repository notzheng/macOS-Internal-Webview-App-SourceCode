// Libraries
import 'normalize.css'
import React, { ReactElement } from 'react'
import ReactDOM from 'react-dom'
import {
  webClientIsReady,
  openHelp,
  MacOsWindow,
  getCurrentUserDsid,
} from '@src/v1/lib/mac-bridge'
import LocStringsContext from '@src/v1/contexts/loc-strings'
import App from './index'
import { HELP_TOPIC } from '@src/v1/components/help-icon'
import { FamilyDetails, SubscriptionApiDetails } from '@src/v1/lib/api'

interface WindowWithFamilyData extends MacOsWindow {
  __family_data: FamilyDetails
  __app_data: SubscriptionApiDetails
}

const SubscriptionDetailsWithNative = (): ReactElement | null => {
  const {
    __loc_strings,
    __app_data: subscriptionData,
  } = (window as unknown) as WindowWithFamilyData
  const handleOpenHelp = (): void => {
    openHelp(HELP_TOPIC.CHANGE_SUBSCRIPTION)
  }

  return (
    <LocStringsContext.Provider value={__loc_strings}>
      <App
        subscriptionApiDetails={subscriptionData}
        onOpenHelp={handleOpenHelp}
        viewerDsid={getCurrentUserDsid()}
      />
    </LocStringsContext.Provider>
  )
}

webClientIsReady()

// Render
const rootEl = document.body
ReactDOM.render(<SubscriptionDetailsWithNative />, rootEl)
