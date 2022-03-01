import { css } from '@emotion/react'
import React, { ReactElement } from 'react'
import UiText from '@src/v1/components/ui-text'
import Button from '@src/v1/components/button'
import { TEXT_FIELD_MARGIN } from '@src/v1/lib/style-enums'

interface FieldGroupProps {
  label: string
  value: string
  button?: { title: string; onClick: () => void } | null
  renderSubcontent?: () => ReactElement | null
}
export const FieldGroup = ({
  label,
  value,
  button,
  renderSubcontent,
}: FieldGroupProps): ReactElement => {
  let fieldContainerGrid
  if (button) {
    fieldContainerGrid = css`
      grid-template-areas:
        'label value edit'
        'subcontent subcontent edit';
      grid-template-columns: auto 1fr auto;
    `
  } else {
    if (renderSubcontent) {
      fieldContainerGrid = css`
        grid-template-areas:
          'label value'
          'subcontent subcontent';
        grid-template-columns: auto 1fr;
      `
    } else {
      fieldContainerGrid = css`
        grid-template-areas: 'label value';
        grid-template-columns: auto 1fr;
      `
    }
  }

  const fieldContainerStyle = css`
    display: grid;
    ${fieldContainerGrid}
    :not(:last-of-type) {
      margin-bottom: ${TEXT_FIELD_MARGIN.MEDIUM}px;
    }
  `
  const fieldLabelStyle = css`
    grid-area: label;
    white-space: pre;
  `
  const fieldValueStyle = css`
    align-self: end;
    grid-area: value;
    white-space: pre-wrap;
  `
  const fieldEditStyle = css`
    grid-area: edit;
    margin-inline-start: 16px;
  `
  const fieldSubContentStyle = css`
    margin-top: ${TEXT_FIELD_MARGIN.SMALL}px;
    grid-area: subcontent;
  `

  return (
    <div css={fieldContainerStyle}>
      <span css={fieldLabelStyle}>
        <UiText textStyle="short-body" weight="semibold" text={label} />
      </span>
      <span css={fieldValueStyle}>
        <UiText textStyle="short-body" text={value} />
      </span>
      {button ? (
        <span css={fieldEditStyle}>
          <Button onClick={button.onClick}>{button.title}</Button>
        </span>
      ) : null}
      {renderSubcontent ? (
        <div css={fieldSubContentStyle}>{renderSubcontent()}</div>
      ) : null}
    </div>
  )
}

export default FieldGroup
