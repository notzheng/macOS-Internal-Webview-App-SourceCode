import { css } from '@emotion/react'
import React, { ReactElement, useContext } from 'react'
import { getTextDirection } from '@src/v1/lib/text-direction'
import LocaleContext from '@src/v1/contexts/locale'

interface ButtonGroupProps {
  children: ReactElement<typeof HTMLButtonElement>[]
}

const ButtonGroup = ({ children }: ButtonGroupProps): ReactElement => {
  const isRtl = getTextDirection(useContext(LocaleContext)) === 'rtl'
  const borderRadius = '6px'
  const firstStyle = isRtl
    ? css`
        border-top-right-radius: ${borderRadius};
        border-bottom-right-radius: ${borderRadius};
      `
    : css`
        border-top-left-radius: ${borderRadius};
        border-bottom-left-radius: ${borderRadius};
      `
  const lastStyle = isRtl
    ? css`
        border-top-left-radius: ${borderRadius};
        border-bottom-left-radius: ${borderRadius};
      `
    : css`
        border-top-right-radius: ${borderRadius};
        border-bottom-right-radius: ${borderRadius};
      `
  const buttonGroupStyle = css`
    button {
      font-size: 15px;
      font-weight: 400;
      width: 24px;
      border: 1px solid #d6d4d4;
      border-radius: 0;
      height: 100%;
      :not(:last-of-type) {
        /* Collapse the button border */
        margin-inline-end: -1px;
      }
      :first-of-type {
        ${firstStyle}
      }
      :last-of-type {
        ${lastStyle}
      }
      background-color: window;
    }
  `
  return <div css={buttonGroupStyle}>{children}</div>
}

export default ButtonGroup
