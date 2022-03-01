import React, { ReactElement, useContext, useState, useEffect } from 'react'
import { ListBoxItem } from '@src/v1/components/list-box'
import Button from '@src/v1/components/button'
import Loc from '@src/v1/lib/loc'
import LocStringsContext from '@src/v1/contexts/loc-strings'
import {
  listItemStyle,
  listItemIconStyle,
  listItemNameStyle,
  listItemDetailsStyle,
  secondSubtitleStyle,
} from './styles'
import UiText from '@src/v1/components/ui-text'
import { COLOR, IMAGE_SIZE } from '@src/v1/lib/style-enums'
import { ContactInfo, getContactForEmail } from '@src/v1/lib/mac-bridge'
import UserIcon from '@src/v1/components/user-icon'
import LocaleContext from '@src/v1/contexts/locale'
import { toLocaleDateString } from '@src/v1/lib/date'

interface TransferRequestOriginatorListBoxItemProps {
  // imageData: string | undefined
  isSheetOpen: boolean
  isActive?: boolean
  child: OutgoingTransferRequest
  onClick?: (transferRequest: OutgoingTransferRequest) => void
  onResend: () => void
  isActionDisabled: boolean
}

const TransferRequestOriginatorListBoxItem = ({
  isActive,
  onClick,
  onResend,
  child,
  isSheetOpen,
  isActionDisabled,
}: TransferRequestOriginatorListBoxItemProps): ReactElement<
  typeof ListBoxItem
> => {
  const loc = new Loc(useContext(LocStringsContext))
  const locale = useContext(LocaleContext)
  const [contactInfo, setContactInfo] = useState<ContactInfo>()
  const {
    requestedFullName: childFullName,
    requestedFirstName: childFirstName,
    requestedLastName: childLastName,
    requestedAppleId,
    membershipStatus,
    requestedDateEpoch,
  } = child

  const childNameLocReplacements = {
    childFirstName,
    childLastName,
    childFullName,
  }

  const getContactInfo = async (): Promise<void> => {
    const contactInfo = await getContactForEmail(requestedAppleId)
    setContactInfo(contactInfo)
  }

  let transferStatus = loc.get(
    'com.apple.cloud.familykit.familylist.transfer.request.subtitle.1.macos',
    {
      shortFormatDate: requestedDateEpoch
        ? toLocaleDateString(new Date(requestedDateEpoch), locale)
        : '',
    }
  )
  let transferDescription = loc.get(
    'com.apple.cloud.familykit.familylist.transfer.request.originator.subtitle.2.macos',
    childNameLocReplacements
  )

  switch (membershipStatus) {
    case 'CHILD_TRANSFER_EXPIRED':
      transferStatus = loc.get(
        'com.apple.cloud.familykit.familylist.transfer.request.expired.originator.subtitle.1.macos'
      )
      break
    case 'CHILD_TRANSFER_REJECTED':
      transferDescription = loc.get(
        'com.apple.cloud.familykit.familylist.transfer.request.rejected.originator.subtitle.2.macos',
        childNameLocReplacements
      )
      break
  }

  useEffect(() => {
    getContactInfo()
  }, [])

  return (
    <React.Fragment>
      <ListBoxItem
        isActive={isActive}
        css={listItemStyle}
        onClick={(): void => {
          if (onClick) {
            onClick(child)
          }
        }}
      >
        <div css={listItemIconStyle}>
          <UserIcon
            imageData={contactInfo?.photoData}
            size={IMAGE_SIZE.SMALL}
          />
        </div>
        <div css={listItemNameStyle}>
          <div>
            <UiText
              textStyle="short-body"
              text={childFullName}
              color={isActive ? COLOR.SELECTED_CONTENT_TEXT : COLOR.PRIMARY}
            />
          </div>
          <div>
            <UiText
              textStyle="short-subheadline"
              color={isActive ? COLOR.SELECTED_CONTENT_TEXT : COLOR.SECONDARY}
              text={transferStatus}
            />
          </div>
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
            {loc.get(
              'com.apple.cloud.familykit.familylist.button.resend.macos'
            )}
          </Button>
        </div>
      </ListBoxItem>
      <ListBoxItem css={secondSubtitleStyle} isActive={isActive}>
        <UiText
          textStyle="short-subheadline"
          color={isActive ? COLOR.SELECTED_CONTENT_TEXT : COLOR.SECONDARY}
          text={transferDescription}
        />
      </ListBoxItem>
    </React.Fragment>
  )
}

export default TransferRequestOriginatorListBoxItem
