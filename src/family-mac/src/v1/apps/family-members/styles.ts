import { css } from '@emotion/react'
import { IMAGE_SIZE } from '@src/v1/lib/style-enums'

export const listItemStyle = css`
  display: grid;
  grid-template-areas: 'icon name       detailsButton';
  /* Hardcoded image size and fixed margin to prevent jumping. */
  grid-template-columns: ${IMAGE_SIZE.SMALL + 8}px auto auto;
`

export const listItemIconStyle = css`
  grid-area: 'icon';
`

export const listItemNameStyle = css`
  grid-area: 'name';
  justify-self: start;
`

export const listItemDetailsStyle = css`
  grid-area: 'detailsButton';
  justify-self: end;
`

export const secondSubtitleStyle = css`
  padding-top: 8px;
  align-items: start;
`
