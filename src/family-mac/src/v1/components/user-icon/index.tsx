import React, { ReactElement } from 'react'
import { IMAGE_SIZE } from '@src/v1/lib/style-enums'

interface UserIconProps {
  size: IMAGE_SIZE
  imageData: string | undefined // base64 encoded image
}

const UserIcon = ({ imageData, size }: UserIconProps): ReactElement | null => {
  if (imageData) {
    return <img width={size} src={imageData} />
  } else {
    return null
  }
}

export default UserIcon
