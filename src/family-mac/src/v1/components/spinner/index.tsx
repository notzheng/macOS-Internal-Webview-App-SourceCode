import React, { ReactElement } from 'react'
import { getStaticImage } from '@src/v1/lib/static-assets'
import { css } from '@emotion/react'
import { IMAGE_SIZE } from '@src/v1/lib/style-enums'

const Spinner = ({
  size = IMAGE_SIZE.EXTRA_SMALL,
}: {
  size?: number
}): ReactElement => {
  const svgSrc = getStaticImage('common/spinner.svg')
  const svgStyle = css`
    animation: spin 1.04s steps(8, start) 0s infinite;
    opacity: 50%;
    @keyframes spin {
      100% {
        transform: rotate(360deg);
      }
    }
    width: ${size}px;
    height: ${size}px;
  `
  return <img src={svgSrc} css={svgStyle} />
}

export default Spinner
