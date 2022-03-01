import { MacOsWindow } from './mac-bridge'

const RESOURCE_HASH_REGEX = /(resource\/[^/]+)/

export const getStaticImage = (
  pathRelativeToImageRoot: string,
  windowPath = document.head.baseURI
): string => {
  if (((window as unknown) as MacOsWindow).InternetAccount2) {
    // Splits before and after the instance of (/(resources\/[^/]+)/), and captures 3 groups, the url before, the actual regex match, and the end path.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [url, resourcePath, toDiscard] = windowPath.split(RESOURCE_HASH_REGEX)
    // Discard the endpath, because we just want the URL up until the regex match.
    const assetRootPath = `${url}${resourcePath}/imgs/familykit/${pathRelativeToImageRoot}`
    return assetRootPath
  } else {
    return `/${pathRelativeToImageRoot}`
  }
}
