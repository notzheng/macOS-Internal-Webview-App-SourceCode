/**
 * This is the wrapper for InternetAccount2 methods. We change signatures for JS here and type them in mac-bridge.d.ts.
 */
import { getAlertButtonIndex } from './mac-os'
import { IMAGE_SIZE } from './style-enums'
import { ICON, nativeIcons } from './icon'
import { HELP_TOPIC } from '@src/v1/components/help-icon'
import Api, { FamilyDetails, ApiConstructorParams } from './api'
import Loc from './loc'
import { logger } from './logger'

const MacOsWindow: MacOsWindow =
  window && (window.parent as unknown as MacOsWindow)

const { InternetAccount2 } = MacOsWindow

export enum PREF_PANE {
  SCREEN_TIME = 'ScreenTime.prefPane',
  APPLE_ID = 'AppleIDPrefPane.prefPane',
  FAMILY = 'FamilySharingPrefPane.prefPane',
}

export enum OS_VERSION {
  STAR = 12,
}

export interface EndSheetOptions {
  shouldCreateChild?: boolean
  shouldInvite?: boolean
  isExit?: boolean
  familyData?: FamilyDetails
  nextPrefPane?: PREF_PANE
}

export interface ExitOptions {
  goToLocation?: PREF_PANE
  aaaction?: 'refresh' // Refresh the specifiers and reload.
  'X-Apple-Family-TeardownCFU'?: string
}

export interface ContactInfo {
  firstName?: string
  lastName?: string
  nickname?: string
  fullName?: string
  photoData: string
}

interface MMICAWebkitViewController {
  account: UserAccount

  authenticateUser: (
    appleId: string,
    password: string,
    /* Start: Ignored fields - We don't use these fields because we make a background call and don't trigger a sheet. */
    title: string,
    message: string,
    defaultButtonTitle: string,
    cancelButtonTitle: string,
    shouldPromptForPasswordOnly: boolean,
    /* End: Ignored fields */
    /* We want this to be false if we don't want to register this device with the auth. This is true for adding other members inline. */
    isEphemeral: boolean,
    callback: (response: AuthUserResponse) => void
  ) => void

  beginSheetWithURL: (
    url: string,
    initialWidth: number,
    initialHeight: number,
    /**
     * Callback to be called when the sheet is eventually closed (via its endSheet() call). This callback should only
     * be invoked once the sheet is totally gone (and the animation has completed, etc.) The web client receiving
     * this callback can assume that it is once again fully visible and active in the UI when the callback is invoked.
     */
    endSheetCallback: (data: EndSheetOptions) => void,
    optionalContext?: {
      initialView:
        | ['iCloudPrefPane', 'ADD_FAMILY_MEMBER']
        | ['iCloudPrefPane', 'ADD_FAMILY_MEMBER_NO_CHILD_CREATE']
      addFamilyMemberLabel?: string
    }
  ) => void

  beginSheetWithContent: (
    htmlContent: string,
    initialWidth: number,
    initialHeight: number,
    endSheetCallback: (data: EndSheetOptions) => void,
    optionalContext?: {
      initialView:
        | ['iCloudPrefPane', 'ADD_FAMILY_MEMBER']
        | ['iCloudPrefPane', 'ADD_FAMILY_MEMBER_NO_CHILD_CREATE']
      addFamilyMemberLabel?: string
    }
  ) => void

  buttonBar: ButtonBar | null

  createChildAccount?: (callback: (isSuccess: boolean) => void) => void

  openSharingWithContext?: (
    options: SharingWithContextOptions,
    callback: (result: SharingWithContextResult) => void
  ) => void

  endSheet: (data: EndSheetOptions) => void

  environment: UserEnvironment

  // By default goes back to Family view
  exit: (options: ExitOptions) => void

  getContactInfoNew: (
    email: string,
    callback: (info: ContactInfo) => void,
    retrieveFromServer?: boolean,
    preferServerVersionToLocal?: boolean,
    dsid?: string
  ) => void

  getFamilyPhoto?: (
    width: number,
    height: number,
    successCallback: (encodedImage: string) => void
  ) => void

  getProfilePictureForFamilyMemberWithAltDSID: (
    altDsid: string,
    diameter: number,
    callback: (imageData: string) => void
  ) => void

  getIcon: (
    appPath: string,
    iconFileName: string,
    iconWidth: number,
    iconHeight: number,
    // Apparently it takes a while for the encoded string to get computed.
    successCallback?: (encodedImage: string) => void
  ) => string

  log: (
    logLevel: 'error' | 'warn' | 'info' | 'debug',
    msg: string | Error
  ) => void

  // Opens an external URL in the user’s default browser.
  openExternalURL: (url: string) => void

  openHelp: (topicId: HELP_TOPIC) => void

  openPrefPane: (pane: string) => void

  resize: (width: number, height: number, callback: () => void) => void

  reauthenticateAlways: (
    message: string,
    callback: (isLoggedIn: boolean) => void
  ) => void

  showAlert: (
    options: NativeAlertOptions,
    // Sometimes the index starts at 1000, other times, it starts at 1, depending on the native system.
    callback: (buttonIndexClicked: number) => void
  ) => void

  /**
   * Invoked when we want the notify the native client that the web client is ready to be viewed.
   * This should be triggered after any initial views have been setup.
   */
  webClientIsReady: () => void

  workflow?: {
    inviteCode?: string
  }
}

export interface MacOsWindow extends Window {
  __loc_strings: LocStrings
  InternetAccount2: MMICAWebkitViewController
  BUILD_INFO: { buildLocale: string } | undefined
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  configuration?: any
}

export interface MacOsWindowFamilyKit extends MacOsWindow {
  __family_data: FamilyDetails
}

export interface AuthenticateUserRequest {
  appleId: string
  password?: string
  title?: string
  description?: string
  cancelButtonText?: string
  continueButtonText?: string
}

// InternetAccount2 wrapper methods.
export const authenticateUser = ({
  appleId,
  password = '',
  title = '',
  description = '',
  cancelButtonText = '',
  continueButtonText = '',
}: AuthenticateUserRequest): Promise<AuthenticatedUser> => {
  return new Promise((resolve, reject) => {
    InternetAccount2?.authenticateUser(
      appleId,
      password, // Empty string will show prompt
      title,
      description,
      cancelButtonText,
      continueButtonText,
      false /* shouldPromptForPasswordOnly */,
      true /* isEphemeral */,
      (response: AuthUserResponse) => {
        const { authenticateUserResults, authenticateUserErrorCode } = response
        if (authenticateUserResults) {
          resolve(authenticateUserResults)
        } else if (authenticateUserErrorCode) {
          reject(authenticateUserErrorCode)
        } else {
          console.error('Unknown rejection from authenticating user', response)
          reject(response)
        }
      }
    )
  })
}
export const getCurrentUserDsid = (): string => {
  return InternetAccount2?.account.dsid
}
export const getCurrentUserAccount = (): UserAccount => {
  return InternetAccount2?.account
}
// Note the ?. operators. Storybook complains because it's not in an OS window.
export const webClientIsReady =
  InternetAccount2?.webClientIsReady.bind(InternetAccount2)
export const openHelp = InternetAccount2?.openHelp.bind(InternetAccount2)
export const beginSheetWithURL =
  InternetAccount2?.beginSheetWithURL.bind(InternetAccount2)
export const endSheet = (options: EndSheetOptions): void => {
  if (InternetAccount2?.endSheet) {
    InternetAccount2.endSheet(options)
  }
}
export const beginSheetWithContent =
  InternetAccount2?.beginSheetWithContent.bind(InternetAccount2)
export const openPrefPane =
  InternetAccount2?.openPrefPane.bind(InternetAccount2)
export const exit = InternetAccount2?.exit.bind(InternetAccount2)
export const setButtonBar = (newButtonBar: ButtonBar): void => {
  if (InternetAccount2) {
    InternetAccount2.buttonBar = newButtonBar
  }
}

export const openExternalUrl =
  InternetAccount2?.openExternalURL.bind(InternetAccount2)

export const log = InternetAccount2?.log.bind(InternetAccount2)

export const reauthenticate = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    InternetAccount2?.reauthenticateAlways('', resolve)
  })
}

//// New Hooks: We have stubs for now until the builds have these actual functions.

export const createChildAccount =
  InternetAccount2?.createChildAccount?.bind(InternetAccount2) ||
  ((callback: (isSuccess: boolean) => void): void => {
    logger.info('stub createChildAccount')
    callback(true)
  })

// Promise versions
export const showAlertAsSheet = async (
  options: AlertSheetOptions
): Promise<void> => {
  const { title: messageText, description: informativeText, buttons } = options

  const nativeOptions: NativeAlertOptions = {
    useSheet: true,
    style: 2,
    messageText,
    informativeText,
    // Native takes an array of strings for buttons
    buttons: buttons.map((button) => button.displayLabel),
  }
  return new Promise((resolve) => {
    InternetAccount2?.showAlert(
      nativeOptions,
      // Associate each buttons action as part of the callback and call it if it was the clicked button.
      (nativeButtonIndex: number): void => {
        const buttonIndex = getAlertButtonIndex(nativeButtonIndex)
        const selectedButtonAction = buttons[buttonIndex].action
        if (selectedButtonAction) {
          selectedButtonAction()
        }
        resolve()
      }
    )
  })
}

export const getApiConfig = (
  loc: Loc,
  shouldExitOnError = false
): ApiConstructorParams => {
  const { account, environment } = InternetAccount2
  return {
    account,
    environment,
    handleApiError: async (e?: ApiError): Promise<void> => {
      // If the apiError is undefined, we need to show a generic error.
      const title =
        e && e.title?.trim() !== ''
          ? e.title
          : loc.get('com.apple.cloud.familykit.error.generic.title.macos')
      const description = e
        ? e['status-message']
        : loc.get('com.apple.cloud.familykit.error.generic.description.macos')
      await showAlertAsSheet({
        title: title || '',
        description,
        buttons: [
          { displayLabel: loc.get('mme.setupservice.Family.MacOSX.Button.OK') },
        ],
      })
      if (shouldExitOnError) {
        exit({ aaaction: 'refresh' })
      }
    },
  }
}

export const getIcon = (
  icon: ICON,
  width = IMAGE_SIZE.SMALL,
  height = IMAGE_SIZE.SMALL
): Promise<string> => {
  return new Promise((resolve) => {
    const foundIcon = nativeIcons[icon]
    if (InternetAccount2?.getIcon && foundIcon) {
      const { appPath, iconFileName } = foundIcon
      InternetAccount2.getIcon(appPath, iconFileName, width, height, resolve)
    } else {
      resolve('')
    }
  })
}

export const getMemberPhoto = (
  altDsid: string,
  diameter = IMAGE_SIZE.SMALL
): Promise<string> => {
  return new Promise((resolve) => {
    if (InternetAccount2?.getProfilePictureForFamilyMemberWithAltDSID) {
      InternetAccount2?.getProfilePictureForFamilyMemberWithAltDSID(
        altDsid,
        diameter,
        resolve
      )
    } else {
      logger.info(
        `stub getMember photo adsid: ${altDsid}, diameter: ${diameter}`
      )
      resolve('')
    }
  })
}

export const resize = (width: number, height: number): Promise<void> => {
  return new Promise((resolve) => {
    InternetAccount2?.resize(width, height, resolve)
  })
}

export const openSharingWithContext = (
  options: SharingWithContextOptions
): Promise<SharingWithContextResult> => {
  return new Promise((resolve) => {
    if (InternetAccount2?.openSharingWithContext) {
      InternetAccount2.openSharingWithContext(options, resolve)
    } else {
      logger.info(
        `stubbed openSharingWithContext, options: ${JSON.stringify(options)}`
      )
      resolve({
        inviteRecipients: ['slix.invitee@icloud.com'],
        completionStatus: 'success',
        transportMode: 'messages',
      })
    }
  })
}

export const getFamilyPhoto = (): Promise<string> => {
  return new Promise((resolve) => {
    if (InternetAccount2?.getFamilyPhoto) {
      // XXX: These width and height are going to be removed by client team in future as they don't actually set the image dimensions.
      InternetAccount2.getFamilyPhoto(450, 90, resolve)
    } else {
      logger.info('stub getFamilyPhoto')
      resolve('')
    }
  })
}

export const getContactForEmail = (email: string): Promise<ContactInfo> => {
  return new Promise((resolve) => {
    if (InternetAccount2?.getContactInfoNew) {
      InternetAccount2.getContactInfoNew(email, resolve)
    }
  })
}

export interface CreateInviteAndOpenSharingWithContextResult {
  buildInviteResult: BuildInviteResponse
  sharingResult: SharingWithContextResult
}

export const createInviteAndOpenSharingWithContext = async (
  api: Api,
  inviteRecipients?: string[]
): Promise<CreateInviteAndOpenSharingWithContextResult> => {
  const buildInviteResult = await api.buildInvite(inviteRecipients)
  const sharingResult = await openSharingWithContext(buildInviteResult)
  return { buildInviteResult, sharingResult }
}

export const isOsVersionOrNewer = (version: OS_VERSION): boolean => {
  return InternetAccount2.environment.osMajorVersion >= version
}
