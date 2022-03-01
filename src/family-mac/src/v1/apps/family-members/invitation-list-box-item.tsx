import React, { ReactElement, useContext, useState, useEffect } from 'react'
import { ListBoxItem } from '@src/v1/components/list-box'
import Button from '@src/v1/components/button'
import Loc from '@src/v1/lib/loc'
import LocStringsContext from '@src/v1/contexts/loc-strings'
import LocaleContext from '@src/v1/contexts/locale'
import UiText from '@src/v1/components/ui-text'
import { COLOR, IMAGE_SIZE } from '@src/v1/lib/style-enums'
import { ContactInfo } from '@src/v1/lib/mac-bridge'
import UserIcon from '@src/v1/components/user-icon'
import {
  listItemIconStyle,
  listItemStyle,
  listItemNameStyle,
  listItemDetailsStyle,
} from './styles'
import { toLocaleDateString } from '@src/v1/lib/date'

interface InvitationListBoxItemProps {
  // imageData: string | undefined
  isSheetOpen: boolean
  isActive?: boolean
  invitee: FamilyInvitation
  getContactForEmail: (email: string) => Promise<ContactInfo>
  onClick: (invitation: FamilyInvitation) => void
  onResend: () => void
  isActionDisabled: boolean
}

const InvitationListBoxItem = ({
  isActive,
  onClick,
  onResend,
  invitee,
  getContactForEmail,
  isSheetOpen,
  isActionDisabled,
}: InvitationListBoxItemProps): ReactElement<typeof ListBoxItem> => {
  const [contactInfo, setContactInfo] = useState<ContactInfo>()
  const loc = new Loc(useContext(LocStringsContext))
  const locale = useContext(LocaleContext)
  const { email, inviteDateEpoch, membershipStatus } = invitee

  const getContactInfo = async (): Promise<void> => {
    const contactInfo = await getContactForEmail(email)
    setContactInfo(contactInfo)
  }

  useEffect(() => {
    getContactInfo()
  }, [])

  let invitationSubtext = loc.get(
    'com.apple.cloud.familykit.familylist.invitation.subtitle.macos',
    {
      shortFormatDate: inviteDateEpoch
        ? toLocaleDateString(new Date(inviteDateEpoch), locale)
        : '',
    }
  )
  if (membershipStatus === 'INVITE_EXPIRED') {
    invitationSubtext = loc.get(
      'mme.setupservice.Family.MacOSX.FamilyList.Subtitle.Invitation.Expired'
    )
  }

  return (
    <ListBoxItem
      css={listItemStyle}
      isActive={isActive}
      onClick={(): void => {
        if (onClick) {
          onClick(invitee)
        }
      }}
    >
      <div css={listItemIconStyle}>
        <UserIcon imageData={contactInfo?.photoData} size={IMAGE_SIZE.SMALL} />
      </div>
      <div css={listItemNameStyle}>
        <div>
          <UiText
            textStyle="short-body"
            text={contactInfo?.fullName || email}
            color={isActive ? COLOR.SELECTED_CONTENT_TEXT : COLOR.PRIMARY}
          />
        </div>
        <UiText
          textStyle="short-subheadline"
          color={isActive ? COLOR.SELECTED_CONTENT_TEXT : COLOR.SECONDARY}
          text={invitationSubtext}
        />
      </div>
      <div css={listItemDetailsStyle}>
        <Button
          disabled={isSheetOpen || isActionDisabled}
          onClick={(e): void => {
            // Don't highlight on button click.
            e.stopPropagation()
            onResend()
          }}
        >
          {loc.get('com.apple.cloud.familykit.familylist.button.resend.macos')}
        </Button>
      </div>
    </ListBoxItem>
  )
}

export default InvitationListBoxItem
