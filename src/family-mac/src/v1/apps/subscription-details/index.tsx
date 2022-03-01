import React, { ReactElement, useContext } from 'react'
import {
  PageLayout,
  PageMain,
  PageFooter,
  PageHero,
} from '@src/v1/components/page-layout'
import HelpIcon from '@src/v1/components/help-icon'
import { ListBox, ListBoxItem, ROW_HEIGHT } from '@src/v1/components/list-box'
import { MAX_FAMILY_MEMBERS } from '@src/v1/lib/family'
import FieldGroup from '@src/v1/components/field-group'
import UiText from '@src/v1/components/ui-text'
import { css } from '@emotion/react'
import { SubscriptionApiDetails } from '@src/v1/lib/api'
import { getIconFromAppId } from '@src/v1/lib/icon'
import Loc from '@src/v1/lib/loc'
import LocStringsContext from '@src/v1/contexts/loc-strings'

interface SubscriptionDetailsProps {
  subscriptionApiDetails: SubscriptionApiDetails
  onOpenHelp: () => void
  viewerDsid: string
}

const SubscriptionDetails = ({
  subscriptionApiDetails,
  onOpenHelp,
  viewerDsid,
}: SubscriptionDetailsProps): ReactElement | null => {
  const loc = new Loc(useContext(LocStringsContext))
  const {
    id,
    title,
    description,
    activeMembers,
    billedMember,
    subscribingMember,
    subscriptionTier,
    iconSrc,
    manageUrl,
    subscribingMemberDSID: subscriberDsid,
  } = subscriptionApiDetails

  return (
    <PageLayout>
      <PageMain>
        {/* TODO: Loc */}
        <PageHero
          description={description}
          title={title}
          iconSrc={iconSrc}
          icon={getIconFromAppId(id)}
          hasHr
        />

        {subscriptionTier ? (
          <FieldGroup
            label={loc.get(
              'com.apple.cloud.familykit.subscriptiondetails.fieldlabel.subscription.macos'
            )}
            value={subscriptionTier}
            button={
              manageUrl && viewerDsid === subscriberDsid
                ? {
                    title: loc.get(
                      'com.apple.cloud.familykit.subscriptiondetails.button.manage.macos'
                    ),
                    onClick: (): void => {
                      window.location.href = manageUrl
                    },
                  }
                : null
            }
          />
        ) : null}
        <FieldGroup
          label={loc.get(
            'com.apple.cloud.familykit.subscriptiondetails.fieldlabel.subscriber.macos'
          )}
          value={subscribingMember}
        />
        {billedMember ? (
          <FieldGroup
            label={loc.get(
              'com.apple.cloud.familykit.subscriptiondetails.fieldlabel.billedto.macos'
            )}
            value={billedMember}
          />
        ) : null}
        <div>
          <div
            css={css`
              margin: 4px 0;
            `}
          >
            <UiText
              textStyle="short-body"
              weight="semibold"
              text={loc.get(
                'com.apple.cloud.familykit.subscriptiondetails.fieldlabel.sharedwith.macos'
              )}
            />
          </div>
          <ListBox
            rowHeight={ROW_HEIGHT.SMALL}
            numShownRows={MAX_FAMILY_MEMBERS}
          >
            {activeMembers.map((memberName) => {
              return <ListBoxItem key={memberName}>{memberName}</ListBoxItem>
            })}
          </ListBox>
        </div>
      </PageMain>
      <PageFooter>
        <HelpIcon onClick={onOpenHelp} />
      </PageFooter>
    </PageLayout>
  )
}

export default SubscriptionDetails
