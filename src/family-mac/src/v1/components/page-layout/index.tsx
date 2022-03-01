import { css } from '@emotion/react'
import React, { Fragment, ReactElement, useCallback, useContext } from 'react'
import AppIcon from '@src/v1/components/app-icon'
import { getTextDirection } from '@src/v1/lib/text-direction'
// import { toNativeButtonBar } from './native-button-bar'
import Button from '@src/v1/components/button'
import HelpIcon from '@src/v1/components/help-icon'
import { toNativeButtonBar } from './native-button-bar'
import { ICON } from '@src/v1/lib/icon'
import { IMAGE_SIZE } from '@src/v1/lib/style-enums'
import LocaleContext from '@src/v1/contexts/locale'
import { MacOsWindow, resize, exit } from '@src/v1/lib/mac-bridge'
import { SHEET_SIZE } from '@src/v1/components/native-sheet'
import UiText from '@src/v1/components/ui-text'
import Spinner from '@src/v1/components/spinner'
import LocStringsContext from '@src/v1/contexts/loc-strings'
import Loc from '@src/v1/lib/loc'

interface LayoutContainerProps {
  className?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children?: any
}

interface PageLayoutContainerProps extends LayoutContainerProps {
  shouldResizeToContent?: boolean
  maxResizeHeight?: number
  isLoading?: boolean
}

interface PageHeroProps {
  className?: string
  description: string
  hasHr?: boolean
  hasTopPadding?: boolean
  // Either icon or iconSrc should be specified
  icon?: ICON
  iconSrc?: string
  title: string
}

export const CONTENT_MARGIN = 20

export const PageHero = ({
  description,
  hasHr,
  hasTopPadding,
  icon = ICON.NONE,
  iconSrc,
  title,
}: PageHeroProps): ReactElement => {
  const marginBottom = hasHr ? '12px' : '16px'
  const marginTop = hasTopPadding ? '94px' : '0'
  const marginSides = '20px'
  const containerStyle = css`
    grid-area: hero;
    margin: ${marginTop} ${marginSides} ${marginBottom};
    text-align: center;
  `
  const heroImageStyle = css`
    margin-bottom: 10px;
  `
  const heroTitleStyle = css`
    margin: 0 0 14px;
  `
  const heroDescriptionStyle = css`
    margin: 0;
  `
  const dividerStyle = css`
    grid-area: divider;
    /* Reset all borders and just put back border-top. */
    border-width: 0;
    margin: 0 0 18px;
    @media (prefers-color-scheme: light) {
      border-top: 1px solid #cccccd;
    }
    @media (prefers-color-scheme: dark) {
      border-top: 1px solid #4a4b4c;
    }
  `

  return (
    <Fragment>
      <section css={containerStyle}>
        <div css={heroImageStyle}>
          <AppIcon
            icon={icon}
            fallbackImageSrc={iconSrc}
            size={IMAGE_SIZE.LARGE}
          />
        </div>
        <h1 css={heroTitleStyle}>
          <UiText size="15" weight="semibold" text={title} />
        </h1>
        <p css={heroDescriptionStyle}>
          <UiText textStyle="short-body" text={description} />
        </p>
      </section>
      {hasHr && <hr css={dividerStyle} />}
    </Fragment>
  )
}

interface PageFooterProps {
  className?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children: ReactElement<typeof HelpIcon>
}

export const PageFooter = ({
  className,
  children,
}: PageFooterProps): ReactElement | null => {
  return (
    <footer
      css={css`
        grid-area: footer;
        /* Flex allows us to have language direction. */
        display: flex;
        justify-content: flex-end;
        width: 100%;
      `}
      // Any CSS props from the caller get translated to className and take precedence.
      className={className}
    >
      {children}
    </footer>
  )
}

// Unfortunately, TS can't currently check the types of children. But this is for documentation purposes.
export type SheetButtonBarChildren =
  | ReactElement<typeof Button>
  | ReactElement<typeof HelpIcon>
  | Array<ReactElement<typeof Button | typeof HelpIcon> | null>

interface SheetButtonBarProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children: SheetButtonBarChildren
  spinner?: Spinner
  /*
   * Set to false to bypass the native button bar. This should only be used if for some reason the bar
   * is incompatible with native. The main use case for this is more than 3 buttons, which shoudn't
   * happen outside of dev testing.
   */
  isNative?: boolean
}

export const SheetButtonBar = ({
  children,
  spinner,
  isNative = true,
}: SheetButtonBarProps): ReactElement | null => {
  const typedWindow = (window as unknown) as MacOsWindow

  if (typedWindow.InternetAccount2 && isNative) {
    // Use the native button
    typedWindow.InternetAccount2.buttonBar = toNativeButtonBar(
      children,
      spinner
    )
    return (
      <div
        css={css`
          /* A magic spacer to offset the margin built in to the button bar */
          height: 6px;
          grid-area: footer;
        `}
      ></div>
    )
  } else {
    return (
      <footer
        css={css`
          grid-area: footer;
          text-align: end;
          width: 100%;
          margin-top: 20px;
          > button:not(:last-of-type) {
            margin-inline-end: 11px;
          }
        `}
      >
        {children}
      </footer>
    )
  }
}

export const PageMain = ({
  className,
  children,
}: LayoutContainerProps): ReactElement => {
  return (
    <main
      css={css`
        grid-area: main;
      `}
      className={className}
    >
      {children}
    </main>
  )
}

export const PageLayout = ({
  className,
  children,
  shouldResizeToContent,
  isLoading,
  maxResizeHeight = 700, // Give some large resize number in case we don't supply it. This will prevent sheets whose buttons extend past desktop.
}: PageLayoutContainerProps): ReactElement => {
  const language =
    ((window as unknown) as MacOsWindow).BUILD_INFO?.buildLocale ||
    window.navigator.language

  const loc = new Loc(useContext(LocStringsContext))

  const domNode = useCallback((node: HTMLElement) => {
    if (node !== null && shouldResizeToContent) {
      const { scrollHeight } = node
      resize(
        SHEET_SIZE.WIDTH,
        Math.min(scrollHeight + CONTENT_MARGIN, maxResizeHeight)
      )
    }
  }, [])

  /* We need the height to account for the top and bottom margin, otherwise it'll be too tall. */
  /* In the case we want the height to be the content, don't set this. */
  const height = !shouldResizeToContent
    ? css`
        height: calc(100vh - (2 * ${CONTENT_MARGIN}px));
      `
    : null

  const width = shouldResizeToContent
    ? css`
        width: ${SHEET_SIZE.WIDTH - 2 * CONTENT_MARGIN}px;
      `
    : null

  return isLoading ? (
    <div
      css={css`
        ${width}
        height: 100vh;
        display: grid;
        justify-items: center;
        align-items: center;
        grid-template-rows: 1fr auto;
        grid-template-areas:
          'spinner'
          'footer';
      `}
    >
      <div
        css={css`
          grid-area: spinner;
        `}
      >
        <Spinner />
      </div>
      {shouldResizeToContent ? (
        <SheetButtonBar
          css={css`
            grid-area: footer;
          `}
        >
          <Button
            onClick={(): void => {
              exit({})
            }}
          >
            {loc.get('mme.setupservice.Family.MacOSX.Button.Done')}
          </Button>
        </SheetButtonBar>
      ) : null}
    </div>
  ) : (
    <LocaleContext.Provider value={language}>
      <section
        ref={domNode}
        dir={getTextDirection(language)}
        css={css`
          ${height}
          ${width}
          color: -apple-system-label;
          -webkit-user-select: none;
          font-family: -apple-system, -webkit-system-font, 'Helvetica Neue',
            'Lucida Grande';
          font-size: 13px;
          margin: ${shouldResizeToContent
            ? `${CONTENT_MARGIN}px auto 0`
            : `${CONTENT_MARGIN}px auto`};
          padding: 0 ${CONTENT_MARGIN}px;
          /* Grid layout determines how we will display the page layout. */
          display: grid;
          grid-template-areas:
            'hero'
            'divider'
            'main'
            'footer';
          /* Stretch the main content to fit the rest of the screen. */
          grid-template-rows: auto auto 1fr auto;
        `}
        // Any CSS props from the caller get translated to className and take precedence.
        className={className}
      >
        {children}
      </section>
    </LocaleContext.Provider>
  )
}
