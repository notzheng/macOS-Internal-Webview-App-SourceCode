import { css } from '@emotion/react'
import React, {
  ReactElement,
  DetailedHTMLProps,
  ButtonHTMLAttributes,
} from 'react'

export interface ButtonProps
  extends DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  buttonType?: ButtonBarButtonType
  children: string | string[]
}

// We use button type for native buttons, but we need it in the props.
const Button = ({ buttonType, ...props }: ButtonProps): ReactElement => {
  const normalButtonStyle = css`
    height: 22px;
    font-size: 13px;
  `

  const defaultButtonStyle = css`
    ${normalButtonStyle};
    /* Messing with any CSS in button attributes messes with default styles, so we need all of these as of now. */
    border-radius: 5px;
    border: 1px solid #377af4;
    border-top-style: none;
    background: linear-gradient(#77b0f4 0%, #5199f5 40%, #3481f7 90%);
    color: white;
    height: 21px;
    padding-top: 1px;
    padding-bottom: 2.5px;
  `

  return (
    <button
      // Default styling
      css={buttonType === 'default' ? defaultButtonStyle : normalButtonStyle}
      {...props}
    />
  )
}

export default Button
