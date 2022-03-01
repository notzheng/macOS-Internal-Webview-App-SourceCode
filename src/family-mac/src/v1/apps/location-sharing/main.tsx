// Libraries
import 'normalize.css'
import React, { ReactElement, useState } from 'react'
import ReactDOM from 'react-dom'
// Local Libraries
import {
  openHelp,
  getApiConfig,
  webClientIsReady,
  getCurrentUserDsid,
  MacOsWindow,
  openExternalUrl,
} from '@src/v1/lib/mac-bridge'
// Contexts
import LocStringsContext from '@src/v1/contexts/loc-strings'
// Components
import App from './index'
import Api, { FamilyDetails, FamilyMember } from '@src/v1/lib/api'
import { HELP_TOPIC } from '@src/v1/components/help-icon'
import Loc from '@src/v1/lib/loc'

interface WindowWithFamilyData extends MacOsWindow {
  __family_data: FamilyDetails
  configuration: { familyLocationSharingLearnMoreUrl: string }
  sharingDeviceName: string
}

const FamilyMembersWithNative = (): ReactElement | null => {
  const {
    __loc_strings,
    __family_data,
    configuration: { familyLocationSharingLearnMoreUrl },
    sharingDeviceName,
  } = (window as unknown) as WindowWithFamilyData
  const loc = new Loc(__loc_strings)
  const api = new Api(getApiConfig(loc))
  // Get the family data on load
  const [familyData, setFamilyData] = useState<FamilyDetails>(__family_data)
  const { familyMembers } = familyData
  const viewerDsid = getCurrentUserDsid()
  const isOrganizer = viewerDsid === familyData.family.organizer

  return (
    <LocStringsContext.Provider value={__loc_strings}>
      <App
        onUpdateMember={async (newMemberInfo: FamilyMember): Promise<void> => {
          const updatedFamilyData = await api.updateMember(newMemberInfo)
          setFamilyData(updatedFamilyData)
        }}
        familyMembers={familyMembers}
        openHelp={(): void => {
          openHelp(HELP_TOPIC.CHANGE_FAMILY_PREFERENCES)
        }}
        viewerDsid={viewerDsid}
        onLearnMore={(): void => {
          openExternalUrl(familyLocationSharingLearnMoreUrl)
        }}
        isOrganizer={isOrganizer}
        sharingDeviceName={sharingDeviceName}
      />
    </LocStringsContext.Provider>
  )
}

webClientIsReady()

// Render
const rootEl = document.body
ReactDOM.render(<FamilyMembersWithNative />, rootEl)
