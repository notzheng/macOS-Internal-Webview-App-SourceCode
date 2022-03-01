import { css } from '@emotion/react'
import React, { Children, ReactElement, MouseEvent } from 'react'
import { COLOR } from '@src/v1/lib/style-enums'

// Scroll peak is 1.5x height to show there's more content
const SCROLL_PEAK_NUM_ROWS = 0.5

export enum ROW_HEIGHT {
  SMALL = 18,
  MEDIUM = 36,
  LARGE = 48,
}

interface ListBoxItemProps {
  onClick?: (event: MouseEvent) => void
  className?: string
  isActive?: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children?: any
}

export const ListBoxItem = ({
  onClick,
  children,
  className,
  isActive = false,
}: ListBoxItemProps): ReactElement => {
  const activeRowStyle = isActive
    ? css`
        background-color: ${COLOR.SELECTED_CONTENT_BACKGROUND};
        color: ${COLOR.SELECTED_CONTENT_TEXT};
      `
    : undefined
  const rowStyle = css`
    align-items: center;
    display: flex;
    padding: 0;
    /* The following work in most browsers (not Edge) and allow for text direction flexibility. */
    padding-inline-start: 11px;
    padding-inline-end: 14px;

    &:nth-of-type(odd) {
      background-color: ${isActive
        ? undefined
        : COLOR.ODD_ALTERNATING_CONTENT_BACKGROUND};
    }
    &:nth-of-type(even) {
      background-color: ${isActive
        ? undefined
        : COLOR.EVEN_ALTERNATING_CONTENT_BACKGROUND};
    }
    ${activeRowStyle}
  `

  return (
    <li css={rowStyle} className={className} onClick={onClick}>
      {children}
    </li>
  )
}

interface ListBoxProps {
  // TODO need to figure out the proper types here.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children?: any
  className?: string
  numShownRows?: number
  rowHeight: ROW_HEIGHT
  isScrollableBeyondNumRows?: boolean
}

export const ListBox = ({
  children,
  className,
  numShownRows = 0,
  rowHeight = ROW_HEIGHT.MEDIUM,
  isScrollableBeyondNumRows = false,
}: ListBoxProps): ReactElement => {
  // Create a placeholder if the content does not reach the minRows requirement.
  const numChildren = Children.count(children)
  // Placeholders
  const additionalScrollPlaceholder =
    isScrollableBeyondNumRows && numShownRows && numChildren <= numShownRows
      ? 1
      : 0
  const numPlaceholders =
    Math.max(numShownRows - numChildren, 0) + additionalScrollPlaceholder
  const placeHolderItems = []
  for (let i = 0; i < numPlaceholders; i++) {
    placeHolderItems.push(<ListBoxItem key={`placeholder_${i}`} />)
  }
  // Styles

  // If we have 4 rows, show 4.5 rows to indicate that it scrolls.
  const listHeightPx = numShownRows ? `${rowHeight * numShownRows}px` : null
  const listHeightWithScrollPx = numShownRows
    ? `${rowHeight * (numShownRows + SCROLL_PEAK_NUM_ROWS)}px`
    : null
  const listHeightStyle = css`
    height: ${isScrollableBeyondNumRows
      ? listHeightWithScrollPx
      : listHeightPx};
    overflow-y: ${isScrollableBeyondNumRows && numChildren > numShownRows
      ? 'scroll'
      : 'hidden'};
  `

  return (
    <ul
      css={css`
        ${listHeightStyle}
        list-style: none;
        margin: 0;
        padding: 0;
        @media (prefers-color-scheme: light) {
          border: 1px solid #b2b2b2;
        }
        @media (prefers-color-scheme: dark) {
          border: 1px solid #bfbfbf;
        }
        & > li {
          height: ${rowHeight}px;
        }
      `}
      className={className}
    >
      {children}
      {placeHolderItems}
    </ul>
  )
}
