import React, { ReactElement } from 'react'
import { MacOsWindow } from '@src/v1/lib/mac-bridge'

export interface NativeSheetProps {
  appFolder: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  windowProps?: { [key: string]: any }
}

export interface SheetOptions extends NativeSheetProps {
  height: SHEET_SIZE
}

export enum SHEET_SIZE {
  WIDTH = 468,
  HEIGHT_X_LARGE = 525,
  HEIGHT_LARGE = 475,
  HEIGHT_MEDIUM_LARGE = 425,
  HEIGHT_MEDIUM = 320,
  HEIGHT_SMALL = 150,
  HEIGHT_X_SMALL = 110,
}

/**
 * This is a hack strictly for Native to open a sheet with another app in our apps directory.
 * We have to do this to prevent having to reach back for a MET file on the server.
 * @param appFolder The name of the app folder in our `apps/` dir.
 * @param windowProps Any additional fields you want on the window object.
 */
const NativeSheet = ({
  appFolder,
  windowProps,
}: NativeSheetProps): ReactElement => {
  // Calculate relative URI based on family-mac or rewrite. Theoretically this should always be ../ in prod.
  const {
    __loc_strings: locStrings,
    configuration,
    BUILD_INFO,
  } = (window as unknown) as MacOsWindow
  const relativePathPrefix = '..'

  return (
    <html>
      <meta
        httpEquiv="Cache-Control"
        content="no-cache, no-store, must-revalidate"
      />
      <meta httpEquiv="Pragma" content="no-cache" />
      <meta httpEquiv="Expires" content="0" />
      <head>
        <base href={window.document.baseURI} />
        <link
          rel="stylesheet"
          type="text/css"
          href={`${relativePathPrefix}/${appFolder}/stylesheet-packed.css`}
        />
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `window.__loc_strings = ${JSON.stringify(locStrings)};`,
          }}
        ></script>
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `window.configuration = ${JSON.stringify(configuration)};`,
          }}
        ></script>
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `window.BUILD_INFO = ${JSON.stringify(BUILD_INFO)};`,
          }}
        ></script>
        {windowProps ? (
          <script
            type="text/javascript"
            dangerouslySetInnerHTML={{
              __html: `Object.assign(window, ${JSON.stringify(windowProps)});`,
            }}
          ></script>
        ) : null}
      </head>
      <body>
        <script
          type="text/javascript"
          // Assume all apps are only 1 level deep with sibling apps one directory up.
          src={`${relativePathPrefix}/${appFolder}/javascript-packed.js`}
        ></script>
      </body>
    </html>
  )
}

export default NativeSheet
