import React from 'react'
import Button, { ButtonProps } from '@src/v1/components/button'
import HelpIcon, { HelpIconProps } from '@src/v1/components/help-icon'
import { SheetButtonBarChildren } from './index'

export const toNativeButtonBar = (
  children: SheetButtonBarChildren,
  spinner?: Spinner
): ButtonBar => {
  const buttons: ButtonBarButton[] = []
  let helpButton

  React.Children.forEach(children, (child) => {
    if (child === null) {
      return
    }
    const { props, type } = child
    if (type === Button) {
      const {
        buttonType,
        children,
        disabled,
        onClick,
      } = (props as unknown) as ButtonProps
      const nativeButton: ButtonBarButton = {
        title: Array.isArray(children) ? children.join(' ') : children,
        type: buttonType || 'normal',
        isEnabled: !disabled,
        callback: onClick as () => void,
      }
      // The api show buttons in reverse order of dom listing.
      buttons.unshift(nativeButton)
    } else if (type === HelpIcon) {
      const { onClick: callback } = (props as unknown) as HelpIconProps
      helpButton = { callback }
    }
  })

  const buttonBar = {
    spinner,
    buttons,
    helpButton,
  }

  return buttonBar
}
