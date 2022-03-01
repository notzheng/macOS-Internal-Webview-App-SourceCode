import { css } from '@emotion/react'
// Library
import React, { useEffect, ReactElement, useState } from 'react'
// Local Library
import { getIcon } from '@src/v1/lib/mac-bridge'
// Images
import appStorePng from '@resources/v1/icons/app_store.png'
import storagePng from '@resources/v1/icons/storage.png'
import findMyPng from '@resources/v1/icons/find_my.png'
import screenTimePng from '@resources/v1/icons/screen_time.png'
import musicPng from '@resources/v1/icons/music.png'
import tvPng from '@resources/v1/icons/tv.png'
import arcadePng from '@resources/v1/icons/arcade.png'
import newsPng from '@resources/v1/icons/news.png'
import { IMAGE_SIZE } from '@src/v1/lib/style-enums'
import { ICON } from '@src/v1/lib/icon'
import { getStaticImage } from '@src/v1/lib/static-assets'

interface AppIconProps {
  icon: ICON
  className?: string
  size?: IMAGE_SIZE
  fallbackImageSrc?: string
}

const AppIcon = ({
  icon,
  // TODO remove classname here as width and height could alias image badly if size is mismatched.
  className,
  size = IMAGE_SIZE.LARGE,
  fallbackImageSrc,
}: AppIconProps): ReactElement | null => {
  const [base64, setBase64] = useState<string>()

  const getAndSetIcon = async (): Promise<void> => {
    try {
      const imageData = await getIcon(icon, size)
      if (imageData.length > 0) {
        setBase64(imageData)
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    getAndSetIcon()
  }, [])

  let imageSrc
  /*if (!!base64) {
    imageSrc = base64
  } else*/ if (fallbackImageSrc) {
    // If we received a fallback image, use that.
    imageSrc = fallbackImageSrc
  } else {
    // As a last resort, use internally supplied static icons.
    switch (icon) {
      case ICON.PURCHASE_SHARING:
      case ICON.ASK_TO_BUY:
        imageSrc = appStorePng
        break
      case ICON.STORAGE:
        imageSrc = storagePng
        break
      case ICON.LOCATION_SHARING:
        imageSrc = findMyPng
        break
      case ICON.SCREEN_TIME:
        imageSrc = screenTimePng
        break
      case ICON.MUSIC:
        imageSrc = musicPng
        break
      case ICON.TV:
        imageSrc = tvPng
        break
      case ICON.ARCADE:
        imageSrc = arcadePng
        break
      case ICON.NEWS:
        imageSrc = newsPng
        break
      case ICON.FAMILY:
        imageSrc = getStaticImage('common/FamilySharing-960-masked.png')
        break
      case ICON.APPLE_SUBSCRIPTIONS:
        imageSrc = getStaticImage('applesubscriptions/SubscriptionsLogo.png')
        break
    }
  }

  return imageSrc ? (
    <img className={className} src={imageSrc} width={size} height={size} />
  ) : (
    <div
      className={className}
      css={css`
        width: ${size}px;
        height: ${size}px;
      `}
    />
  )
}

export default AppIcon
