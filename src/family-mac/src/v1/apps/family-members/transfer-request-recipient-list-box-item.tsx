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
  incomingTransferRequest: IncomingTransferRequest
  onClick?: (transferRequest: IncomingTransferRequest) => void
  onViewTransferRequest: (transferRequest: IncomingTransferRequest) => void
}

const TransferRequestOriginatorListBoxItem = ({
  isActive,
  onClick,
  onViewTransferRequest,
  incomingTransferRequest,
  isSheetOpen,
}: TransferRequestOriginatorListBoxItemProps): ReactElement<
  typeof ListBoxItem
> => {
  const loc = new Loc(useContext(LocStringsContext))
  const locale = useContext(LocaleContext)
  const [contactInfo, setContactInfo] = useState<ContactInfo>()
  const {
    childFullName,
    requestorFullName,
    childAccountEmail,
    requestedDateEpoch,
  } = incomingTransferRequest

  const getContactInfo = async (): Promise<void> => {
    const contactInfo = await getContactForEmail(childAccountEmail)
    setContactInfo(contactInfo)
  }

  const transferStatus = loc.get(
    'com.apple.cloud.familykit.familylist.transfer.request.subtitle.1.macos',
    {
      shortFormatDate: requestedDateEpoch
        ? toLocaleDateString(new Date(requestedDateEpoch), locale)
        : '',
    }
  )

  useEffect(() => {
    getContactInfo()
  }, [])

  return (
    <React.Fragment>
      <ListBoxItem
        css={listItemStyle}
        isActive={isActive}
        onClick={(): void => {
          if (onClick) {
            onClick(incomingTransferRequest)
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
            disabled={isSheetOpen}
            onClick={(e): void => {
              // Don't highlight on button click.
              e.stopPropagation()
              onViewTransferRequest(incomingTransferRequest)
            }}
          >
            {loc.get('com.apple.cloud.familykit.familylist.button.view.macos')}
          </Button>
        </div>
      </ListBoxItem>
      <ListBoxItem css={secondSubtitleStyle} isActive={isActive}>
        <UiText
          textStyle="short-subheadline"
          color={isActive ? COLOR.SELECTED_CONTENT_TEXT : COLOR.SECONDARY}
          text={loc.get(
            'com.apple.cloud.familykit.familylist.transfer.request.recipient.subtitle.2.macos',
            { otherFamilyOrganizerFullName: requestorFullName, childFullName }
          )}
        />
      </ListBoxItem>
    </React.Fragment>
  )
}

export default TransferRequestOriginatorListBoxItem
