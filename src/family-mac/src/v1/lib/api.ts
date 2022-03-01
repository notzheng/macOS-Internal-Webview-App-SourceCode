import { HELP_TOPIC } from '@src/v1/components/help-icon'
import Loc from './loc'
import { logger } from './logger'
import {
  authenticateUser,
  ExitOptions,
  isOsVersionOrNewer,
  OS_VERSION,
  reauthenticate,
} from './mac-bridge'

const BASE_URL = 'https://setup.icloud.com/setup/mac/family'
const BASE_URL_V2 = 'https://setup.icloud.com/setup/family/v2/macos'
const BASE_FAMILY_KIT = 'https://setup.icloud.com/setup/familykit'
const BASE_SETUP_URL = 'https://setup.icloud.com/setup'

export type VerifyCvvUserAction = 'ADDING_FAMILY_MEMBER'
export interface PaymentInformation {
  userAction: VerifyCvvUserAction
  'status-message': 'Success'
  billingType: 'Card'
  creditCardImageUrl: string
  creditCardLastFourDigits: string
  verificationType: string // e.g., "CVV"
  creditCardId: string // e.g., "VISA"
  creditCardType: string // e.g., "Visa"
  status: number
}

export enum AUTH_FAILURE {
  INVALID_USER_OR_PASS = -7006,
  ACCOUNT_LOCKED = -7018,
}

export enum FAMILY_SERVICE_ID {
  APPLE_MUSIC = 'APPLE_MUSIC',
  APPLE_TV_PLUS = 'APPLE_TV_PLUS',
  ARCADE = 'ARCADE',
  NEWS_PLUS = 'NEWS_PLUS',
  SHARE_MY_LOCATION = 'SHARE_MY_LOCATION',
  PURCHASE_SHARING = 'PURCHASE_SHARING',
  ICLOUD_STORAGE = 'ICLOUD_STORAGE',
  APPLE_CASH = 'APPLE_CASH',
  ASK_TO_BUY = 'ASK_TO_BUY',
  SCREEN_TIME = 'SCREEN_TIME',
}

interface ServiceGroupItem {
  id: FAMILY_SERVICE_ID
  rightLabel?: string
}

export interface FamilyMember {
  age?: number
  lastName: string
  altDSID: string
  dsid: string
  dsidForPurchases: string
  appleId: string
  appleIdForPurchases: string
  familyId: string
  firstName: string
  fullName: string
  ageClassification: 'ADULT' | 'CHILD' | 'TEEN'
  hasParentalPrivileges: boolean
  hasScreenTimeEnabled: boolean
  hasAskToBuyEnabled: boolean
  hasSharePurchasesEnabled: boolean
  hasShareMyLocationEnabled: boolean
  hasStorageSharingEnabled?: boolean
  isStoragePurchaser?: boolean
  purchaserLocalizedStoragePlan?: string
  shareMyLocationEnabledFamilyMembers?: string[]
  serviceGroups?: ServiceGroupItem[]
}

// This is the API that populates the subscription details page.
export interface SubscriptionApiDetails {
  title: string
  description: string
  activeMembers: string[]
  billedMember?: string // If unspecified, we won't show billedMember.
  subscribingMember: string
  subscribingMemberDSID: string
  subscriptionTier?: string
  id?: FAMILY_SERVICE_ID // Used to identify app for native icon.
  iconSrc: string
  helpTopicId: string
  manageUrl?: string // If unspecified, we don't show a manage button.
}

export interface SubscriptionOffApiDetails {
  title: string
  description: string
  id?: FAMILY_SERVICE_ID // Used to identify app for native icon.
  iconSrc: string
  manageUrl: string // For Learn More
  helpTopicId: HELP_TOPIC
}

export interface FamilyService {
  displayLabel: string
  icon: string
  id: FAMILY_SERVICE_ID
  // If this is true we show it in the add member sheet.
  isSubscription: boolean
}

export type ActiveFamilyServiceMap = {
  [ID in FAMILY_SERVICE_ID]: FamilyService | undefined
}

export interface FamilyDetails {
  activeFamilyServices?: ActiveFamilyServiceMap
  familyInvitations: FamilyInvitation[]
  outgoingTransferRequests: OutgoingTransferRequest[]
  incomingTransferRequests?: IncomingTransferRequest[]
  status: number
  'status-message': string
  showAddMemberButton: boolean
  isMemberOfFamily: boolean
  family: {
    transferRequests: string[]
    outgoingTransferRequests: string[]
    invitations: string[]
    familyId: string
    organizer: string
    members: string[]
  }
  familyMembers: FamilyMember[]
}

export interface FamilyDetailsWithExitParams extends FamilyDetails {
  exitParams: ExitOptions
}

export interface PassThroughExitParams {
  exitParams: ExitOptions
}

interface CreateChildServiceToEnable {
  id: FAMILY_SERVICE_ID
  displayLabel: string
  description: string
  // The key to send back in CreateChildUpdatePayload.
  flagKey: string
  isEnabled: string
}

export interface ChildCreateAppData {
  childDSID: string
  childAltDSID: string
  title: string
  paragraphs: string[]
  services: CreateChildServiceToEnable[]
}

export interface ChildCreateApiRequest {
  isChildRepairUpdate: boolean
  childDSID: string
  [key: string]: boolean | string
}

export interface FamilyMemberLeaveRestrictions {
  daysUntilEligibleToJoinNewFamily: number
  dateEligibleToJoinNewFamily?: string
  familyMembersInEligibleToJoinAnotherFamily?: string[]
}

export interface SetupPurchaseSharingRequest {
  familyId: string
  enableFlag: boolean
  iTunesDsId: string
}

export interface SetupPurchaseSharingResponse {
  isEnabled: boolean
  appleIdForPurchases: string | null
  sharingPurchasesWithFamily: boolean
}

export const SHEET_URLS = {
  INCOMING_TRANSFER_REQUEST: `${BASE_FAMILY_KIT}/macos/loadTransferRequestsUI`,
}

const API_URLS = {
  // Non-conforming base URLs
  CHECK_MEMBER: `https://setup.icloud.com/setup/family/checkiCloudMember`,
  // V1
  CHECK_LEAVE_RESTRICTIONS: `${BASE_URL}/checkLeaveRestrictions`,
  CREATE_FAMILY: `${BASE_URL}/createFamily`,
  FAMILY_DETAILS: `${BASE_URL}/getFamilyDetails`,
  ADD_MEMBER: `${BASE_URL}/addFamilyMember`,
  REMOVE_MEMBER: `${BASE_URL}/removeFamilyMember`,
  LEAVE_FAMILY: `${BASE_URL}/leaveFamily`,
  UPDATE_MEMBER: `${BASE_URL}/updateFamilyMember`,
  SEND_INVITATION: `${BASE_URL}/sendInvitation`,
  ACCEPT_INVITATION: `${BASE_URL}/acceptInvitation`,
  REJECT_INVITATION: `${BASE_URL}/rejectInvitation`,
  CANCEL_INVITATION: `${BASE_URL}/cancelInvitation`,
  SEND_TRANSFER_REQUEST: `${BASE_URL}/sendTransferRequest`,
  CANCEL_TRANSFER_REQUEST: `${BASE_URL}/cancelTransferRequest`,
  ACCEPT_TRANSFER_REQUEST: `${BASE_URL}/acceptTransferRequest`,
  REJECT_TRANSFER_REQUEST: `${BASE_URL}/rejectTransferRequest`,
  GET_PARENTAL_CONSENT_TERMS: `${BASE_URL}/getParentalConsentTerms`,
  GET_ITUNES_TERMS: `${BASE_SETUP_URL}/tos?tosType=iTunes`,
  GET_PAYMENT_INFO: `${BASE_URL}/getiTunesAccountPaymentInfo`,
  VERIFY_CVV: `${BASE_URL}/verifyCVV`,
  // V2
  LOCATION: `${BASE_URL_V2}/location`,
  MUSIC: `${BASE_URL_V2}/music`,
  PURCHASE_SHARING: `${BASE_URL_V2}/purchaseSharing`,
  SCREEN_TIME: `${BASE_URL_V2}/screentime`,
  STORAGE: `${BASE_URL_V2}/storage`,
  SETUP_UP_PURCHASE_SHARING: `${BASE_URL_V2}/setupPurchaseShare`,
  // FamilyKit 2020
  FAMILY_SUBSCRIPTIONS: `${BASE_FAMILY_KIT}/getFamilySubscriptions`,
  FAMILY_KIT_UPDATE_MEMBER: `${BASE_FAMILY_KIT}/macos/updateFamilyMember`,
  BUILD_INVITE: `${BASE_FAMILY_KIT}/macos/buildInvite`,
  REGISTER_INVITE_SENT: `${BASE_FAMILY_KIT}/macos/registerInviteSent`,
}

const createAcceptInvitationRequestBody = (
  invitationCode: string,
  account: UserAccount
): RespondToInvitationRequestBody => {
  const { appleID: appleId } = account
  return {
    invitationCode,
    appleId,
    // Set the same here as it will get changed later in handleSplitAccount.
    appleIdForPurchases: appleId,
    shareMyPurchasesEnabledDefault: false,
    shareMyLocationEnabledDefault: false,
  }
}

const handleSplitAccount = async (
  base: RespondToInvitationRequestBody,
  appleIdForPurchases: string,
  loc: Loc
): Promise<SplitAccountRespondToInvitationRequestBody> => {
  const { AKPassword: appleIdForPurchasesPassword } = await authenticateUser({
    appleId: appleIdForPurchases,
    title: loc.get(
      'com.apple.cloud.familykit.acceptinvite.verify.split.account.macos',
      { appleIdForPurchases }
    ),
    continueButtonText: loc.get(
      'com.apple.cloud.familykit.button.continue.macos'
    ),
    cancelButtonText: loc.get('mme.setupservice.Family.MacOSX.Button.Cancel'),
  })
  return { ...base, appleIdForPurchases, appleIdForPurchasesPassword }
}

export interface ApiConstructorParams {
  account: UserAccount
  environment: UserEnvironment
  handleApiError: (e?: ApiError) => Promise<void>
}

export default class Api {
  account: UserAccount
  environment: UserEnvironment
  handleApiError: (e?: ApiError) => Promise<void>

  constructor({ account, environment, handleApiError }: ApiConstructorParams) {
    this.account = account
    this.environment = environment
    this.handleApiError = handleApiError
  }

  _createFamilyHeaders(): HeadersInit {
    const {
      device,
      osMajorVersion,
      osMinorVersion,
      osRevision,
      osBuild,
      client,
      clientVersion,
    } = this.environment

    const {
      adsid,
      apnsPushToken,
      dsid,
      authToken,
      gsiCloudAuthToken,
      gsFamilyAuthToken,
      appleID,
    } = this.account

    return {
      Authorization: `Basic ${window.btoa(dsid + ':' + authToken)}`,
      Accept: 'application/json; charset=UTF-8',
      'Content-Type': 'application/json',
      // DS is expecting to see ADSID in all the requests for all Grandslam
      // based calls (see: <rdar://problem/17554139>).
      'X-Apple-ADSID': adsid,
      // To prevent redundant push notifications to the machine being used
      // we pass the APNS token for the current machine.
      'X-APNS-Push-Token': apnsPushToken,
      // This header is required to pass certain security checks on the server
      // side. It is documented at:
      // https://iswiki.apple.com/confluence/display/NC/X-MMe-Client-Info+Header
      'X-MMe-Client-Info': `<${device}> <Mac OS X;${osMajorVersion}.${osMinorVersion}.${osRevision};${osBuild}> <webclient/v3.0.0 (${client}/${clientVersion})>`,
      'X-Apple-GS-Token': window.btoa(`${dsid}:${gsiCloudAuthToken}`),
      'X-Apple-Family-GS-Token': window.btoa(`${dsid}:${gsFamilyAuthToken}`),
      'X-MMe-LoggedIn-AppleID': appleID,
    }
  }

  /**
   * This is a protected fetch call that will call the error handler that we pass in to this Api object.
   * @param input Same as the first arg for fetch
   * @param init Same as the second arg for fetch. We will append the necessary headers here by default.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async _tryFetch(input: RequestInfo, init?: RequestInit): Promise<any> {
    let res
    const params = {
      headers: this._createFamilyHeaders(),
      ...init,
    }

    try {
      res = await fetch(input, params)
      // Reauthenticate and try again
      if (res?.status === 401 && (await reauthenticate())) {
        res = await fetch(input, params)
      }
    } catch (e) {
      logger.error('fetch error')
      logger.error(e as Error)
    }
    if (!res || res.status >= 400) {
      let apiError
      try {
        // Parsing will fail if the server responds without a body
        apiError = await res?.json()
      } catch (e) {
        logger.error(`Tried to parse json but failed. Input: ${input}`)
        logger.error(e as Error)
      }
      await this.handleApiError(apiError)
    } else {
      return await res.json()
    }
  }

  async checkLeaveRestrictions(
    isOrganizer: boolean,
    dsid: string
  ): Promise<FamilyMemberLeaveRestrictions> {
    const body = {
      checkOtherFamilyMembers: isOrganizer,
      familyMemberDSID: dsid,
    }
    return await this._tryFetch(API_URLS.CHECK_LEAVE_RESTRICTIONS, {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  async createFamily(): Promise<FamilyDetails> {
    const { appleID, MASAccount } = this.account
    const requestBody: CreateRequest = {
      organizerAppleId: appleID,
      organizerAppleIdForPurchases: MASAccount?.appleID || appleID,
      organizerShareMyLocationEnabledDefault: false,
      organizerShareMyPurchasesEnabledDefault: false,
    }
    return (await this._tryFetch(API_URLS.CREATE_FAMILY, {
      method: 'POST',
      body: JSON.stringify(requestBody),
    })) as FamilyDetails
  }

  async getFamilyDetails(): Promise<FamilyDetails> {
    return (await this._tryFetch(API_URLS.FAMILY_DETAILS)) as FamilyDetails
  }

  async removeMember(member: FamilyMember): Promise<FamilyDetails> {
    return (await this._tryFetch(API_URLS.REMOVE_MEMBER, {
      method: 'POST',
      body: JSON.stringify(member),
    })) as FamilyDetails
  }

  async removeSelf(): Promise<void> {
    await this._tryFetch(API_URLS.LEAVE_FAMILY, {
      method: 'POST',
    })
  }

  async sendInvitation(
    inviteRequestBody: InviteRequest
  ): Promise<FamilyDetails> {
    return (await this._tryFetch(API_URLS.SEND_INVITATION, {
      method: 'POST',
      body: JSON.stringify(inviteRequestBody),
    })) as FamilyDetails
  }

  // Outgoing requests
  async sendTransferRequest(
    transferRequestBody: TransferApiRequest | ResendTransferApiRequest
  ): Promise<FamilyDetails> {
    return await this._tryFetch(API_URLS.SEND_TRANSFER_REQUEST, {
      method: 'POST',
      body: JSON.stringify(transferRequestBody),
    })
  }

  async cancelTransferRequest(cancelParams: {
    appleId: string
  }): Promise<FamilyDetails> {
    return await this._tryFetch(API_URLS.CANCEL_TRANSFER_REQUEST, {
      method: 'POST',
      body: JSON.stringify(cancelParams),
    })
  }

  // Incoming requests
  async acceptTransferRequest(
    requestId: string
  ): Promise<FamilyDetailsWithExitParams | undefined> {
    return await this._tryFetch(API_URLS.ACCEPT_TRANSFER_REQUEST, {
      method: 'POST',
      body: JSON.stringify({ requestId }),
    })
  }

  async rejectTransferRequest(
    requestId: string
  ): Promise<FamilyDetailsWithExitParams | undefined> {
    return await this._tryFetch(API_URLS.REJECT_TRANSFER_REQUEST, {
      method: 'POST',
      body: JSON.stringify({ requestId }),
    })
  }

  async acceptInvitation(
    invitationCode: string,
    loc: Loc
  ): Promise<FamilyDetailsWithExitParams | undefined> {
    const baseBody = createAcceptInvitationRequestBody(
      invitationCode,
      this.account
    )
    const { dsid, MASAccount } = this.account
    const appleIdForPurchases = MASAccount?.appleID
    const dsidForPurchases = MASAccount?.dsid
    const isSplitAccount =
      appleIdForPurchases && dsidForPurchases && dsidForPurchases !== dsid

    let acceptRequestBody = baseBody

    if (
      isSplitAccount &&
      appleIdForPurchases &&
      isOsVersionOrNewer(OS_VERSION.STAR)
    ) {
      acceptRequestBody = await handleSplitAccount(
        baseBody,
        appleIdForPurchases,
        loc
      )
    }

    return await this._tryFetch(API_URLS.ACCEPT_INVITATION, {
      method: 'POST',
      body: JSON.stringify(acceptRequestBody),
    })
  }

  async rejectInvitation(
    invitationCode: string
  ): Promise<PassThroughExitParams | undefined> {
    return await this._tryFetch(API_URLS.REJECT_INVITATION, {
      method: 'POST',
      body: JSON.stringify(
        createAcceptInvitationRequestBody(invitationCode, this.account)
      ),
    })
  }

  async addMember(addRequest: AddMemberRequest): Promise<FamilyDetails> {
    return (await this._tryFetch(API_URLS.ADD_MEMBER, {
      method: 'POST',
      body: JSON.stringify(addRequest),
    })) as FamilyDetails
  }

  async updateMember(member: FamilyMember): Promise<FamilyDetails> {
    return (await this._tryFetch(API_URLS.UPDATE_MEMBER, {
      method: 'PUT',
      body: JSON.stringify(member),
    })) as FamilyDetails
  }

  // TODO replace the above updateMember with this once and rename once we have parity with updateMember.
  async updateMemberFromCfu(
    member: FinishAcceptMember
  ): Promise<FamilyDetailsWithExitParams | undefined> {
    return await this._tryFetch(API_URLS.FAMILY_KIT_UPDATE_MEMBER, {
      method: 'PUT',
      body: JSON.stringify(member),
    })
  }

  async updateMemberFromChildCreate(
    requestPayload: ChildCreateApiRequest
  ): Promise<FamilyDetails> {
    return (await this._tryFetch(API_URLS.FAMILY_KIT_UPDATE_MEMBER, {
      method: 'PUT',
      body: JSON.stringify(requestPayload),
    })) as FamilyDetails
  }

  async buildInvite(inviteRecipients?: string[]): Promise<BuildInviteResponse> {
    return (await this._tryFetch(API_URLS.BUILD_INVITE, {
      method: 'POST',
      body: inviteRecipients ? JSON.stringify({ inviteRecipients }) : undefined,
    })) as BuildInviteResponse
  }

  async registerInviteSent(
    sharingWithContextResult: RegisterInviteRequest
  ): Promise<RegisterInviteResponse> {
    return (await this._tryFetch(API_URLS.REGISTER_INVITE_SENT, {
      method: 'POST',
      body: JSON.stringify(sharingWithContextResult),
    })) as RegisterInviteResponse
  }

  async checkMemberToAdd(email: string): Promise<CheckMemberResponse> {
    const urlEncodedEmail = encodeURIComponent(email)
    return (await this._tryFetch(
      `${API_URLS.CHECK_MEMBER}?email-address=${urlEncodedEmail}`
    )) as CheckMemberResponse
  }

  async getParentalConsentTerms(): Promise<Terms> {
    const termsResponseObject: TermsResponse = await this._tryFetch(
      API_URLS.GET_PARENTAL_CONSENT_TERMS
    )
    // There's always one and only one object in this array.
    return termsResponseObject.tosObjects[0]
  }

  async getITunesTerms(): Promise<iTunesTermsContainer> {
    return await this._tryFetch(API_URLS.GET_ITUNES_TERMS)
  }

  async enablePurchaseSharing(
    requestParams: SetupPurchaseSharingRequest
  ): Promise<SetupPurchaseSharingResponse> {
    return await this._tryFetch(API_URLS.SETUP_UP_PURCHASE_SHARING, {
      method: 'POST',
      body: JSON.stringify(requestParams),
    })
  }

  async cancelInvitation(cancelParams: {
    email: string
    familyId: string
  }): Promise<FamilyDetails> {
    return (await this._tryFetch(API_URLS.CANCEL_INVITATION, {
      method: 'POST',
      body: JSON.stringify(cancelParams),
    })) as FamilyDetails
  }

  async getPaymentInfo({
    organizerDsid,
    userAction,
    sendSMS,
  }: {
    organizerDsid: string
    userAction?: VerifyCvvUserAction
    sendSMS?: boolean
  }): Promise<PaymentInformation> {
    return (await this._tryFetch(API_URLS.GET_PAYMENT_INFO, {
      method: 'POST',
      body: JSON.stringify({
        organizerDSID: organizerDsid,
        userAction,
        sendSMS,
      }),
    })) as PaymentInformation
  }

  async verifyCvv(request: CvvRequest): Promise<CvvResponse | undefined> {
    return (await this._tryFetch(API_URLS.VERIFY_CVV, {
      method: 'POST',
      body: JSON.stringify(request),
    })) as CvvResponse
  }
}
