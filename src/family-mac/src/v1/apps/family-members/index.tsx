import React, { ReactElement, useState, useContext } from 'react'
import { PageLayout, PageMain, PageFooter } from '@src/v1/components/page-layout'
import HelpIcon from '@src/v1/components/help-icon'
import { ListBox, ROW_HEIGHT } from '@src/v1/components/list-box'
import FamilyMemberListBoxItem from './family-member-list-box-item'
import InvitationListBoxItem from './invitation-list-box-item'
import TransferRequestOriginatorListBoxItem from './transfer-request-originator-list-box-item'
import TransferRequestRecipientListBoxItem from './transfer-request-recipient-list-box-item'
import Button from '@src/v1/components/button'
import { css } from '@emotion/react'
import ButtonGroup from '@src/v1/components/button-group'
import UiText from '@src/v1/components/ui-text'
import { IMAGE_SIZE } from '@src/v1/lib/style-enums'
import { ContactInfo } from '@src/v1/lib/mac-bridge'
import { MAX_FAMILY_MEMBERS } from '@src/v1/lib/family'
import { FamilyMember } from '@src/v1/lib/api'
import Loc from '@src/v1/lib/loc'
import LocStringsContext from '@src/v1/contexts/loc-strings'

export interface FamilyMembersAppProps {
  addMember: (isOrganizer: boolean) => void
  imageDataMap: { [dsid: string]: string | undefined }
  openMemberDetails: (dsid: string) => void
  familyId: string
  familyMembers: FamilyMember[]
  familyPhotoData: string | undefined
  invitations: FamilyInvitation[]
  incomingTransfers?: IncomingTransferRequest[]
  outgoingTransfers: OutgoingTransferRequest[]
  openHelp: () => void
  organizerDsid: string
  onRemoveMember: (member: FamilyMember, isSelf: boolean) => void
  onRemoveInvitation: (invitation: FamilyInvitation) => void
  onRemoveOutgoingTransferRequest: (
    transferRequest: OutgoingTransferRequest
  ) => void
  onRemoveIncomingTransferRequest: (
    transferRequest: IncomingTransferRequest
  ) => void
  onResendInvitation: (recipient: string) => void
  onResendTransferRequest: (transferDetails: ResendTransferApiRequest) => void
  onViewTransferRequest: (incomingRequest: IncomingTransferRequest) => void
  getContactForEmail: (email: string) => Promise<ContactInfo>
  viewerDsid: string
  isSheetOpen: boolean
}

enum REMOVE_TYPES {
  MEMBER = 'member',
  INVITATION = 'invitation',
  INCOMING_TRANSFER_REQUEST = 'incoming-transfer-request',
  OUTGOING_TRANSFER_REQUEST = 'outgoing-transfer-request',
}

const App = ({
  addMember,
  familyMembers,
  familyPhotoData = '',
  imageDataMap,
  invitations,
  incomingTransfers,
  outgoingTransfers,
  openHelp,
  openMemberDetails,
  organizerDsid,
  onRemoveMember,
  onRemoveInvitation,
  onRemoveIncomingTransferRequest,
  onRemoveOutgoingTransferRequest,
  onResendInvitation,
  onResendTransferRequest,
  onViewTransferRequest,
  viewerDsid,
  isSheetOpen,
  getContactForEmail,
}: FamilyMembersAppProps): ReactElement | null => {
  const loc = new Loc(useContext(LocStringsContext))
  const isOrganizer = viewerDsid === organizerDsid
  const selfMember = familyMembers.find((member) => member.dsid === viewerDsid)
  const isParentOrGuardian = selfMember?.hasParentalPrivileges
  const isFullFamily = familyMembers.length === MAX_FAMILY_MEMBERS
  const hasChildren =
    familyMembers.filter((member) => member.ageClassification === 'CHILD')
      .length > 0
  const [selected, setSelected] = useState<
    | FamilyMember
    | FamilyInvitation
    | OutgoingTransferRequest
    | IncomingTransferRequest
  >()
  const [removeType, setRemoveType] = useState<REMOVE_TYPES>()

  const [isRemoveDisabled, setIsRemoveDisabled] = useState<boolean>(true)

  const handleRemove = (): void => {
    if (selected) {
      switch (removeType) {
        case REMOVE_TYPES.MEMBER: {
          const member = selected as FamilyMember
          onRemoveMember(member, viewerDsid === member.dsid)
          break
        }
        case REMOVE_TYPES.INVITATION: {
          const invitation = selected as FamilyInvitation
          onRemoveInvitation(invitation)
          break
        }
        case REMOVE_TYPES.OUTGOING_TRANSFER_REQUEST: {
          const outgoingTransfer = selected as OutgoingTransferRequest
          onRemoveOutgoingTransferRequest(outgoingTransfer)
          break
        }
        case REMOVE_TYPES.INCOMING_TRANSFER_REQUEST: {
          const incomingTransfer = selected as IncomingTransferRequest
          onRemoveIncomingTransferRequest(incomingTransfer)
          break
        }
      }
    }
  }

  const calcNumRequiredRows = () => {
    return (
      familyMembers.length +
      invitations.length * 2 +
      outgoingTransfers.length * 2 +
      (incomingTransfers || []).length * 2
    )
  }

  return (
    <PageLayout>
      <PageMain>
        <div
          css={css`
            text-align: center;
          `}
        >
          <div
            css={css`
              height: ${IMAGE_SIZE.LARGE}px;
              display: grid;
              align-content: center;
              justify-content: center;
            `}
          >
            {familyPhotoData ? (
              <img height={IMAGE_SIZE.LARGE} src={familyPhotoData} />
            ) : null}
          </div>
          <h1>
            <UiText
              size="26"
              weight="semibold"
              text={loc.get(
                'com.apple.cloud.familykit.familylist.header.macos'
              )}
            />
          </h1>
        </div>
        <ListBox
          rowHeight={ROW_HEIGHT.LARGE}
          numShownRows={MAX_FAMILY_MEMBERS}
          css={css`
            margin-bottom: 4px;
          `}
          // Invitations and Transfers take up 2 rows each, so we need to make sure we can show them.
          isScrollableBeyondNumRows={calcNumRequiredRows() > MAX_FAMILY_MEMBERS}
        >
          {familyMembers.map((member) => {
            const { dsid, ageClassification } = member
            const isChild = ageClassification === 'CHILD'
            return (
              <FamilyMemberListBoxItem
                key={dsid}
                isActive={(selected as FamilyMember)?.dsid === member.dsid}
                isSheetOpen={isSheetOpen}
                onClick={(member: FamilyMember): void => {
                  setSelected(member)
                  setRemoveType(REMOVE_TYPES.MEMBER)
                  setIsRemoveDisabled(
                    isChild ||
                      member.hasScreenTimeEnabled ||
                      (!isOrganizer && viewerDsid !== dsid) ||
                      (isOrganizer && viewerDsid === dsid && hasChildren)
                  )
                }}
                imageData={imageDataMap[dsid]}
                organizerDsid={organizerDsid}
                openMemberDetails={openMemberDetails}
                member={member}
              />
            )
          })}
          {invitations.map((invitee) => {
            const { email } = invitee
            return (
              <InvitationListBoxItem
                isSheetOpen={isSheetOpen}
                getContactForEmail={getContactForEmail}
                key={email}
                isActive={
                  (selected as FamilyInvitation)?.email === invitee.email
                }
                onClick={(invitation: FamilyInvitation): void => {
                  setSelected(invitation)
                  setRemoveType(REMOVE_TYPES.INVITATION)
                  setIsRemoveDisabled(!isOrganizer)
                }}
                onResend={(): void => {
                  onResendInvitation(email)
                }}
                invitee={invitee}
                isActionDisabled={isFullFamily}
              />
            )
          })}
          {outgoingTransfers.map((child) => {
            const { requestedAppleId } = child
            return (
              <TransferRequestOriginatorListBoxItem
                key={requestedAppleId}
                isSheetOpen={isSheetOpen}
                isActive={
                  (selected as OutgoingTransferRequest)?.requestedAppleId ===
                  child.requestedAppleId
                }
                onClick={(transferRequest: OutgoingTransferRequest): void => {
                  setSelected(transferRequest)
                  setRemoveType(REMOVE_TYPES.OUTGOING_TRANSFER_REQUEST)
                  setIsRemoveDisabled(!isOrganizer)
                }}
                onResend={(): void => {
                  onResendTransferRequest({
                    appleId: requestedAppleId,
                    isResend: true,
                  })
                }}
                child={child}
                isActionDisabled={isFullFamily}
              />
            )
          })}
          {incomingTransfers?.map((incomingTransferRequest) => {
            const { childAccountEmail } = incomingTransferRequest
            return (
              <TransferRequestRecipientListBoxItem
                key={childAccountEmail}
                isSheetOpen={isSheetOpen}
                isActive={
                  (selected as IncomingTransferRequest)?.childAccountEmail ===
                  incomingTransferRequest.childAccountEmail
                }
                onClick={(transferRequest: IncomingTransferRequest): void => {
                  setSelected(transferRequest)
                  setRemoveType(REMOVE_TYPES.INCOMING_TRANSFER_REQUEST)
                  setIsRemoveDisabled(!isOrganizer)
                }}
                onViewTransferRequest={onViewTransferRequest}
                incomingTransferRequest={incomingTransferRequest}
              />
            )
          })}
        </ListBox>
        <ButtonGroup>
          <Button
            disabled={!(isOrganizer || isParentOrGuardian) || isFullFamily}
            onClick={() => {
              addMember(isOrganizer)
            }}
          >
            +
          </Button>
          <Button disabled={isRemoveDisabled} onClick={handleRemove}>
            -
          </Button>
        </ButtonGroup>
      </PageMain>
      <PageFooter>
        <HelpIcon onClick={openHelp} />
      </PageFooter>
    </PageLayout>
  )
}

export default App
