import React, { ReactElement } from 'react'
import { css } from '@emotion/react'
import { COLOR } from '@src/v1/lib/style-enums'

enum WEIGHT_AS_NUM {
  bold = 700,
  semibold = 600,
  normal = 400,
}

type TextStyle = 'short-body' | 'short-subheadline' | 'short-headline'

export interface UiTextProps {
  size?: '12' | '13' | '15' | '26'
  textStyle?: TextStyle
  weight?: keyof typeof WEIGHT_AS_NUM
  color?: COLOR
  text: string | undefined
  // Rarely the loc string contains HTML.
  dangerouslySetInnerHTML?: { __html: string }
}

const getAppleSystemStyle = (textStyle?: TextStyle): string | null => {
  if (!textStyle) {
    return null
  } else {
    return `-apple-system-${textStyle}`
  }
}

const UiText = ({
  size,
  weight = 'normal',
  color = COLOR.PRIMARY,
  text,
  textStyle,
  dangerouslySetInnerHTML,
}: UiTextProps): ReactElement => {
  const style = css`
    font-family: -apple-system, -webkit-system-font, 'Helvetica Neue',
      'Lucida Grande';
    /* Built in system values if available */
    font: ${getAppleSystemStyle(textStyle)};
    font-size: ${size ? `${size}px` : null};
    font-weight: ${WEIGHT_AS_NUM[weight]};
    color: ${color};
  `

  if (dangerouslySetInnerHTML?.__html) {
    return (
      <span
        css={style}
        dangerouslySetInnerHTML={{ __html: dangerouslySetInnerHTML?.__html }}
      />
    )
  } else {
    return <span css={style}>{text}</span>
  }
}

export default UiText
