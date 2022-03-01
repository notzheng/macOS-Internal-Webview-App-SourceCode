import { css } from '@emotion/react'
import React, { ReactElement, useContext } from 'react'
import themeCss from '@src/v1/lib/theme-css'
import LocaleContext from '@src/v1/contexts/locale'

export enum HELP_TOPIC {
  CHANGE_SUBSCRIPTION = 'mchlc9bdbe70',
  CHANGE_SCREEN_TIME_PREFERENCES = 'mchl46fcf556',
  CHANGE_FAMILY_PREFERENCES = 'mchl37e74c6a',
}
export interface HelpIconProps {
  onClick: () => void
}

const HelpIcon = ({ onClick }: HelpIconProps): ReactElement => {
  const locale = useContext(LocaleContext)
  const btnString = locale.toUpperCase().startsWith('AR') ? '؟' : '?'

  return (
    <button
      onClick={onClick}
      css={css`
        ${themeCss.textBackground}
        border-radius: 50%;
        font-family: system-ui;
        cursor: pointer;
        font-size: 14px;
        height: 22px;
        width: 22px;
        padding: 0;
        color: buttontext;
        @media (prefers-color-scheme: light) {
          border: 1px solid ButtonFace;
        }
        @media (prefers-color-scheme: dark) {
          border: none;
        }
      `}
    >
      {btnString}
    </button>
  )
}

export default HelpIcon
