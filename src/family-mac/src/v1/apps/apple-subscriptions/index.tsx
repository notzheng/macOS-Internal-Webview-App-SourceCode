import React, { ReactElement } from 'react'
import {
  PageLayout,
  PageMain,
  PageFooter,
  PageHero,
} from '@src/v1/components/page-layout'
import Button from '@src/v1/components/button'
import HelpIcon from '@src/v1/components/help-icon'
import { ListBox, ListBoxItem, ROW_HEIGHT } from '@src/v1/components/list-box'
import { ICON } from '@src/v1/lib/icon'
import AppIcon from '@src/v1/components/app-icon'
import { IMAGE_SIZE } from '@src/v1/lib/style-enums'
import { css } from '@emotion/react'
import UiText from '@src/v1/components/ui-text'

interface AppleSubscriptionsProps {
  onOpenHelp: () => void
  appData: PageDataAppleSubscriptions
}

const subscriptionContainerStyle = css`
  display: grid;
  grid-template-areas: 'icon title action';
  grid-template-columns: auto 1fr auto;
`
const subscriptionIconStyle = css`
  grid-area: icon;
  margin-inline-end: 16px;
`
const subscriptionTitleStyle = css`
  grid-area: title;
`
const subscriptionActionStyle = css`
  justify-content: end;
  grid-area: action;
`

const AppleSubscriptions = ({
  onOpenHelp,
  appData,
}: AppleSubscriptionsProps): ReactElement | null => {
  const { title, description, subscriptionPromos } = appData
  return (
    <PageLayout>
      <PageMain>
        <PageHero
          description={description}
          title={title}
          icon={ICON.APPLE_SUBSCRIPTIONS}
        />

        <ListBox rowHeight={ROW_HEIGHT.LARGE}>
          {subscriptionPromos.map((sub) => {
            const { title, action, icon, actionButtonLabel } = sub
            return (
              <ListBoxItem key={sub.title} css={subscriptionContainerStyle}>
                <span css={subscriptionIconStyle}>
                  <AppIcon
                    icon={ICON.NONE}
                    fallbackImageSrc={icon}
                    size={IMAGE_SIZE.SMALL}
                  />
                </span>
                <span css={subscriptionTitleStyle}>
                  <UiText textStyle="short-body" text={title} />
                </span>
                <span css={subscriptionActionStyle}>
                  <Button
                    onClick={(): void => {
                      window.location.href = action
                    }}
                  >
                    {actionButtonLabel}
                  </Button>
                </span>
              </ListBoxItem>
            )
          })}
        </ListBox>
      </PageMain>
      <PageFooter>
        <HelpIcon onClick={onOpenHelp} />
      </PageFooter>
    </PageLayout>
  )
}

export default AppleSubscriptions
