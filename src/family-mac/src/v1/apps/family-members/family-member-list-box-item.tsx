import React, { ReactElement, useContext } from 'react'
import { ListBoxItem } from '@src/v1/components/list-box'
import Button from '@src/v1/components/button'
import UserIcon from '@src/v1/components/user-icon'
import Loc from '@src/v1/lib/loc'
import UiText from '@src/v1/components/ui-text'
import { COLOR, IMAGE_SIZE } from '@src/v1/lib/style-enums'
import LocStringsContext from '@src/v1/contexts/loc-strings'
import {
  listItemStyle,
  listItemIconStyle,
  listItemNameStyle,
  listItemDetailsStyle,
} from './styles'
import { FamilyMember } from '@src/v1/lib/api'
import LocaleContext from '@src/v1/contexts/locale'

interface FamilyMemberListBoxItemProps {
  imageData: string | undefined
  isActive?: boolean
  isSheetOpen: boolean
  member: FamilyMember
  organizerDsid: string
  onClick?: (member: FamilyMember) => void
  openMemberDetails: (dsid: string) => void
}

const FamilyMemberListBoxItem = ({
  imageData,
  isActive,
  isSheetOpen,
  onClick,
  openMemberDetails,
  organizerDsid,
  member,
}: FamilyMemberListBoxItemProps): ReactElement<typeof ListBoxItem> => {
  const loc = new Loc(useContext(LocStringsContext))
  const locale = useContext(LocaleContext)

  const { dsid, fullName } = member
  return (
    <ListBoxItem
      css={listItemStyle}
      isActive={isActive}
      onClick={(): void => {
        if (onClick) {
          onClick(member)
        }
      }}
    >
      <div css={listItemIconStyle}>
        <UserIcon imageData={imageData} size={IMAGE_SIZE.SMALL} />
      </div>
      <div css={listItemNameStyle}>
        <div>
          <UiText
            textStyle="short-body"
            text={fullName}
            color={isActive ? COLOR.SELECTED_CONTENT_TEXT : COLOR.PRIMARY}
          />
        </div>
        <UiText
          textStyle="short-subheadline"
          color={isActive ? COLOR.SELECTED_CONTENT_TEXT : COLOR.SECONDARY}
          text={loc.getRoleSubtitle(member, organizerDsid, locale)}
        />
      </div>
      <div css={listItemDetailsStyle}>
        <Button
          disabled={isSheetOpen}
          onClick={(): void => {
            openMemberDetails(dsid)
          }}
        >
          {loc.get('com.apple.cloud.familykit.familylist.button.details.macos')}
        </Button>
      </div>
    </ListBoxItem>
  )
}

export default FamilyMemberListBoxItem
