import { css } from '@emotion/react'
import React, { ReactElement } from 'react'
import UiText from '@src/v1/components/ui-text'

interface CheckboxGroupProps
  extends React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  displayLabel: string
  isLoading?: boolean
}

const CheckboxGroup = ({
  displayLabel,
  ...inputProps
}: CheckboxGroupProps): ReactElement => {
  return (
    <label
      css={css`
        display: grid;
        grid-template-columns: auto 1fr;
      `}
    >
      <input
        {...inputProps}
        css={css`
          margin-inline-end: 4px;
          font-size: 16px;
        `}
        type="checkbox"
      />
      <UiText textStyle="short-body" text={displayLabel} />
    </label>
  )
}

export default CheckboxGroup
