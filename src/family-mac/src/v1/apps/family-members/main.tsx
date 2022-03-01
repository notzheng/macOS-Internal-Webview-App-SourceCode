// Libraries
import 'normalize.css'
import React, { ReactElement, useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { renderToString } from 'react-dom/server'
// Local Libraries
import {
  openHelp,
  getApiConfig,
  getMemberPhoto,
  webClientIsReady,
  beginSheetWithContent,
  openPrefPane,
  getFamilyPhoto,
  showAlertAsSheet,
  getCurrentUserDsid,
  MacOsWindow,
  EndSheetOptions,
  getContactForEmail,
  beginSheetWithURL,
  createChildAccount,
  exit,
  PREF_PANE,
} from '@src/v1/lib/mac-bridge'
// Components
import App from './index'
import Api, { FamilyDetails, FamilyMember, SHEET_URLS } from '@src/v1/lib/api'
import NativeSheet, {
  SHEET_SIZE,
  SheetOptions,
} from '@src/v1/components/native-sheet'
import handleAddMemberEndSheet, {
  startAddMemberFlow,
} from '@src/v1/lib/add-member-endsheet'
import { IMAGE_SIZE } from '@src/v1/lib/style-enums'
import { HELP_TOPIC } from '@src/v1/components/help-icon'
import usePrevious from '@src/v1/lib/use-previous'
import Loc from '@src/v1/lib/loc'
import I18nProvider from '@src/v1/components/i18n-provider'
import { logger } from '@src/v1/lib/logger'

interface WindowWithFamilyData extends MacOsWindow {
  __family_data: FamilyDetails
  __app_data?: {
    minorAge: number
  }
}

const FamilyMembersWithNative = (): ReactElement | null => {
  const {
    __loc_strings,
    __family_data,
    __app_data,
  } = (window as unknown) as WindowWithFamilyData
  const loc = new Loc(__loc_strings)
  const api = new Api(getApiConfig(loc))
  const [familyPhotoData, setFamilyPhotoData] = useState<string>()
  const [imageDataMap, setImageDataMap] = useState<{ [dsid: string]: string }>(
    {}
  )
  // Get the family data on load
  const [familyData, setFamilyData] = useState<FamilyDetails>(__family_data)
  // If we need a new sheet
  const [sheetOptions, setSheetOptions] = useState<SheetOptions>()
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false)

  const {
    family: { organizer: organizerDsid, familyId },
    familyMembers,
    familyInvitations,
    outgoingTransferRequests,
    incomingTransferRequests,
  } = familyData

  const handleEndSheet = async (
    endSheetOptions: EndSheetOptions
  ): Promise<void> => {
    const { isExit, familyData, nextPrefPane } = endSheetOptions
    const newSheet = await handleAddMemberEndSheet(endSheetOptions, api)
    if (!isExit) {
      if (familyData) {
        setFamilyData(familyData)
      }
      if (nextPrefPane) {
        openPrefPane(nextPrefPane)
      }
      if (newSheet) {
        setSheetOptions({ ...newSheet, height: SHEET_SIZE.HEIGHT_SMALL })
      }
    }
  }

  const getPhoto = async (): Promise<void> => {
    const familyPhoto = await getFamilyPhoto()
    if (familyPhoto) {
      setFamilyPhotoData(familyPhoto)
    } else {
      // If we can't get the family photo, show the member photo
      const { altDSID } =
        familyMembers.find((member) => member.dsid === organizerDsid) || {}
      if (altDSID) {
        const organizerPhoto = await getMemberPhoto(altDSID, IMAGE_SIZE.LARGE)
        setFamilyPhotoData(organizerPhoto)
      }
    }
  }

  useEffect(() => {
    if (sheetOptions) {
      // Open a sheet any time we change which sheet to show.
      const { appFolder, windowProps, height } = sheetOptions
      setIsSheetOpen(true)
      beginSheetWithContent(
        renderToString(
          <NativeSheet appFolder={appFolder} windowProps={windowProps} />
        ),
        SHEET_SIZE.WIDTH,
        height,
        (options) => {
          setIsSheetOpen(false)
          handleEndSheet(options)
        }
      )
    }
  }, [sheetOptions])

  // Populate the image map with key dsid, value image data string.
  const setMemberPhoto = async ({
    dsid,
    altDSID,
  }: FamilyMember): Promise<void> => {
    const imageData = await getMemberPhoto(altDSID)
    setImageDataMap((prevImageDataMap) => {
      return { ...prevImageDataMap, [dsid]: imageData }
    })
  }

  // This will store previous familyMembers for the useEffect call, like prevProps.
  const prevFamilyMembers = usePrevious(familyMembers)

  useEffect(() => {
    const currentIds = familyMembers.map((member) => member.altDSID)
    const prevIds = prevFamilyMembers?.map((member) => member.altDSID)
    const newlyAddedIds = currentIds.filter(
      (adsid) => !prevIds?.includes(adsid)
    )
    const hasRemovedMembers =
      newlyAddedIds.length === 0 && prevIds?.length !== currentIds.length

    if (newlyAddedIds.length > 0 || hasRemovedMembers) {
      // Regenerate family photo.
      getPhoto()
    }

    if (newlyAddedIds.length > 0) {
      const addedMembers = familyMembers.filter((member) =>
        newlyAddedIds.includes(member.altDSID)
      )
      addedMembers.forEach(setMemberPhoto)
    }
  }, [familyMembers])

  const viewerDsid = getCurrentUserDsid()

  const resendInvitation = async (recipient: string): Promise<void> => {
    const nativeSheetOptions = await startAddMemberFlow({
      api,
      familyData,
      inviteRecipients: [recipient],
    })
    if (nativeSheetOptions) {
      setSheetOptions({
        ...nativeSheetOptions,
        height: SHEET_SIZE.HEIGHT_SMALL,
      })
    }
  }

  const resendTransferRequest = async (
    request: ResendTransferApiRequest
  ): Promise<void> => {
    const updatedFamilyData = await api.sendTransferRequest(request)
    setFamilyData(updatedFamilyData)
  }

  const viewTransferRequest = async ({
    transferCode,
    requestorDsid,
    childDsid,
  }: IncomingTransferRequest): Promise<void> => {
    const queryParams = {
      'request-code': transferCode,
      requesterDsid: requestorDsid,
      childDsid,
    }
    beginSheetWithURL(
      `${SHEET_URLS.INCOMING_TRANSFER_REQUEST}?${new URLSearchParams(
        queryParams
      ).toString()}`,
      SHEET_SIZE.WIDTH,
      SHEET_SIZE.HEIGHT_X_SMALL,
      () => {
        logger.info('closed accept transfer sheet')
      }
    )
  }

  const handleRemoveMember = (member: FamilyMember): void => {
    beginSheetWithContent(
      renderToString(
        <NativeSheet
          appFolder={'remove-member'}
          windowProps={{
            shownMember: member,
            organizerDsid,
            viewerDsid,
          }}
        />
      ),
      SHEET_SIZE.WIDTH,
      SHEET_SIZE.HEIGHT_X_SMALL,
      handleEndSheet
    )
  }

  const handleRemoveInvitation = ({
    email,
    familyId,
  }: FamilyInvitation): void => {
    showAlertAsSheet({
      title: loc.get(
        'com.apple.cloud.familykit.removeinvitation.modal.title.macos'
      ),
      buttons: [
        {
          displayLabel: loc.get('mme.setupservice.Family.MacOSX.Button.OK'),
          action: async (): Promise<void> => {
            const updatedFamilyData = await api.cancelInvitation({
              email,
              familyId,
            })
            if (updatedFamilyData) {
              setFamilyData(updatedFamilyData)
            }
          },
        },
        {
          displayLabel: loc.get(
            'com.apple.cloud.familykit.button.notnow.macos'
          ),
        },
      ],
    })
  }

  const handleRemoveIncomingTransferRequest = ({
    transferCode,
  }: IncomingTransferRequest): void => {
    showAlertAsSheet({
      title: loc.get(
        'com.apple.cloud.familykit.removetransfer.modal.title.macos'
      ),
      buttons: [
        {
          displayLabel: loc.get('mme.setupservice.Family.MacOSX.Button.OK'),
          action: async (): Promise<void> => {
            const updatedFamilyData = await api.rejectTransferRequest(
              transferCode
            )
            if (updatedFamilyData) {
              setFamilyData(updatedFamilyData)
            }
          },
        },
        {
          displayLabel: loc.get(
            'com.apple.cloud.familykit.button.notnow.macos'
          ),
        },
      ],
    })
  }

  const handleRemoveOutgoingTransferRequest = ({
    requestedAppleId,
  }: OutgoingTransferRequest): void => {
    showAlertAsSheet({
      title: loc.get(
        'com.apple.cloud.familykit.removetransfer.modal.title.macos'
      ),
      buttons: [
        {
          displayLabel: loc.get('mme.setupservice.Family.MacOSX.Button.OK'),
          action: async (): Promise<void> => {
            const updatedFamilyData = await api.cancelTransferRequest({
              appleId: requestedAppleId,
            })
            setFamilyData(updatedFamilyData)
          },
        },
        {
          displayLabel: loc.get(
            'com.apple.cloud.familykit.button.notnow.macos'
          ),
        },
      ],
    })
  }

  return (
    <I18nProvider window={window}>
      <App
        addMember={(isOrganizer: boolean): void => {
          if (isOrganizer) {
            setSheetOptions({
              appFolder: 'add-member-flow',
              windowProps: { familyData },
              height: SHEET_SIZE.HEIGHT_SMALL,
            })
          } else {
            createChildAccount((isSuccess) => {
              logger.info(
                `Created child account finished. isSucces: ${isSuccess}`
              )
              exit({ aaaction: 'refresh', goToLocation: PREF_PANE.FAMILY })
            })
          }
        }}
        familyMembers={familyMembers}
        familyPhotoData={familyPhotoData}
        familyId={familyId}
        imageDataMap={imageDataMap}
        openHelp={(): void => {
          openHelp(HELP_TOPIC.CHANGE_FAMILY_PREFERENCES)
        }}
        onRemoveMember={handleRemoveMember}
        onRemoveInvitation={handleRemoveInvitation}
        onRemoveIncomingTransferRequest={handleRemoveIncomingTransferRequest}
        onRemoveOutgoingTransferRequest={handleRemoveOutgoingTransferRequest}
        onResendInvitation={resendInvitation}
        onResendTransferRequest={resendTransferRequest}
        onViewTransferRequest={viewTransferRequest}
        openMemberDetails={(dsid: string): void => {
          setSheetOptions({
            appFolder: 'member-details',
            windowProps: {
              memberDsId: dsid,
              memberImageData: imageDataMap[dsid],
              familyData,
              __app_data,
            },
            height: SHEET_SIZE.HEIGHT_MEDIUM,
          })
        }}
        viewerDsid={viewerDsid}
        organizerDsid={organizerDsid}
        invitations={familyInvitations}
        outgoingTransfers={outgoingTransferRequests}
        incomingTransfers={incomingTransferRequests}
        isSheetOpen={isSheetOpen}
        getContactForEmail={getContactForEmail}
      />
    </I18nProvider>
  )
}

webClientIsReady()

// Render
const rootEl = document.body
ReactDOM.render(<FamilyMembersWithNative />, rootEl)
