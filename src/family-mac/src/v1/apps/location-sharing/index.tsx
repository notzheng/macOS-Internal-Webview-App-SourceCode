import React, { ReactElement, useState, useContext } from 'react'
import {
  PageLayout,
  PageMain,
  PageFooter,
  PageHero,
} from '@src/v1/components/page-layout'
import HelpIcon from '@src/v1/components/help-icon'
import { css } from '@emotion/react'
import Button from '@src/v1/components/button'
import { ICON } from '@src/v1/lib/icon'
import CheckboxGroup from '@src/v1/components/checkbox-group'
import { FamilyMember } from '@src/v1/lib/api'
import UiText from '@src/v1/components/ui-text'
import Loc from '@src/v1/lib/loc'
import LocStringsContext from '@src/v1/contexts/loc-strings'
import FieldGroup from '@src/v1/components/field-group'

interface FamilyMembersAppProps {
  onUpdateMember: (member: FamilyMember) => void | Promise<void>
  familyMembers: FamilyMember[]
  openHelp: () => void
  viewerDsid: string
  isOrganizer: boolean
  onLearnMore: () => void
  sharingDeviceName: string
}

const App = ({
  familyMembers,
  openHelp,
  viewerDsid,
  onUpdateMember,
  isOrganizer,
  onLearnMore,
  sharingDeviceName,
}: FamilyMembersAppProps): ReactElement | null => {
  const loc = new Loc(useContext(LocStringsContext))
  const [isUpdating, setIsUpdating] = useState<boolean>(false)
  const isViewer = (member: FamilyMember): boolean => member.dsid === viewerDsid
  const viewer = familyMembers.find(isViewer)
  const title = loc.get('Family.MacOSX.Location.Default.V2.Text.Header')
  let description = loc.get(
    'com.apple.cloud.familykit.locationSharing.default.text.label'
  )

  if (!viewer || !viewer.hasShareMyLocationEnabled) {
    if (!isOrganizer) {
      description += `${loc.get(
        'Family.MacOSX.Location.Default.Text.Label.Member.Three'
      )}`
    }
    // Disabled
    return (
      <PageLayout>
        <PageHero
          title={title}
          description={description}
          hasTopPadding
          icon={ICON.LOCATION_SHARING}
        />
        <PageMain
          css={css`
            text-align: center;
          `}
        >
          <Button onClick={onLearnMore}>
            {loc.get(
              'Family.MacOSX.Location.Sharing.Turnoff.V2.LearnMore.Button.Text'
            )}
          </Button>
        </PageMain>
      </PageLayout>
    )
  }

  const { shareMyLocationEnabledFamilyMembers } = viewer

  const toggleMember = (
    enabledMembers: string[] = [],
    memberDsid: string
  ): string[] => {
    return enabledMembers && enabledMembers.includes(memberDsid)
      ? enabledMembers.filter((member) => member !== memberDsid)
      : [...enabledMembers, memberDsid]
  }

  return (
    <PageLayout>
      <PageMain>
        <PageHero
          hasHr
          title={title}
          description={description}
          icon={ICON.LOCATION_SHARING}
        />
        <div>
          {sharingDeviceName.trim().length > 0 ? (
            <FieldGroup
              label={loc.get(
                'Family.MacOSX.Location.Sharing.TurnOn.V2.Device.Label'
              )}
              value={sharingDeviceName}
            />
          ) : null}
          <div
            css={css`
              margin: 8px 0;
            `}
          >
            <UiText
              textStyle="short-body"
              text={loc.get(
                'Family.MacOSX.Location.Sharing.TurnOn.V2.Label.Family'
              )}
            />
          </div>
        </div>

        <div
          css={css`
            margin-top: 24px;
          `}
        >
          <UiText
            textStyle="short-body"
            text={loc.get(
              'Family.MacOSX.Location.Sharing.TurnOn.V2.ShareMyLocation.Text.Header'
            )}
          />
        </div>
        <ul
          css={css`
            list-style: none;
            margin: 0;
            padding-inline-start: 16px;
          `}
        >
          {familyMembers.map((member) => {
            const { dsid, fullName } = member

            return !isViewer(member) ? (
              <li
                css={css`
                  margin-top: 8px;
                `}
                key={dsid}
              >
                <CheckboxGroup
                  displayLabel={fullName}
                  checked={shareMyLocationEnabledFamilyMembers?.includes(dsid)}
                  disabled={isUpdating}
                  onClick={async (): Promise<void> => {
                    setIsUpdating(true)
                    await onUpdateMember({
                      ...viewer,
                      shareMyLocationEnabledFamilyMembers: toggleMember(
                        shareMyLocationEnabledFamilyMembers,
                        dsid
                      ),
                    })
                    setIsUpdating(false)
                  }}
                />
              </li>
            ) : null
          })}
        </ul>
      </PageMain>
      <PageFooter>
        <HelpIcon onClick={openHelp} />
      </PageFooter>
    </PageLayout>
  )
}

export default App
