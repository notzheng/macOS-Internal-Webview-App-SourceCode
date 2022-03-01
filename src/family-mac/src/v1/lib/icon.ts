import { FAMILY_SERVICE_ID } from './api'

export enum ICON {
  // The values are those that are returned from the subscriptions API.
  FAMILY = 'FAMILY',
  ASK_TO_BUY = 'ASK_TO_BUY',
  PURCHASE_SHARING = 'PURCHASE_SHARING',
  STORAGE = 'STORAGE',
  LOCATION_SHARING = 'LOCATION_SHARING',
  SCREEN_TIME = 'SCREEN_TIME',
  MUSIC = 'MUSIC',
  TV = 'TV',
  ARCADE = 'ARCADE',
  NEWS = 'NEWS',
  APPLE_SUBSCRIPTIONS = 'APPLE_SUBSCRIPTIONS',
  NONE = 'NONE',
}

export const nativeIcons: {
  [key: string]: { appPath: string; iconFileName: string } | undefined
} = {
  [ICON.PURCHASE_SHARING]: {
    appPath: '/System/Applications/App Store.app',
    iconFileName: 'AppIcon.icns',
  },
  [ICON.LOCATION_SHARING]: {
    appPath: '/System/Applications/FindMy.app',
    iconFileName: 'AppIcon',
  },
  [ICON.SCREEN_TIME]: {
    appPath: '/System/Library/PreferencePanes/ScreenTime.prefPane',
    iconFileName: 'ScreenTime.icns',
  },
  [ICON.MUSIC]: {
    appPath: '/System/Applications/music.app',
    iconFileName: 'AppIcon.icns',
  },
  [ICON.TV]: {
    appPath: '/System/Applications/tv.app',
    iconFileName: 'AppIcon.icns',
  },
  [ICON.NEWS]: {
    appPath: '/System/Applications/news.app',
    iconFileName: 'AppIcon',
  },
}

export const getIconFromAppId = (
  appName: FAMILY_SERVICE_ID | undefined
): ICON => {
  switch (appName) {
    case FAMILY_SERVICE_ID.PURCHASE_SHARING:
    case FAMILY_SERVICE_ID.ASK_TO_BUY:
      return ICON.PURCHASE_SHARING
    case FAMILY_SERVICE_ID.ICLOUD_STORAGE:
      return ICON.STORAGE
    case FAMILY_SERVICE_ID.SHARE_MY_LOCATION:
      return ICON.LOCATION_SHARING
    case FAMILY_SERVICE_ID.SCREEN_TIME:
      return ICON.SCREEN_TIME
    case FAMILY_SERVICE_ID.APPLE_MUSIC:
      return ICON.MUSIC
    case FAMILY_SERVICE_ID.APPLE_TV_PLUS:
      return ICON.TV
    case FAMILY_SERVICE_ID.ARCADE:
      return ICON.ARCADE
    case FAMILY_SERVICE_ID.NEWS_PLUS:
      return ICON.NEWS
    default:
      return ICON.NONE
  }
}
