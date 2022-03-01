import { log } from '@src/v1/lib/mac-bridge'

export const logger = {
  debug: (message: string | Error): void => {
    console.debug(message)
    log('debug', message)
  },
  info: (message: string | Error): void => {
    console.info(message)
    log('info', message)
  },
  warn: (message: string | Error): void => {
    console.warn(message)
    log('warn', message)
  },
  error: (message: string | Error): void => {
    console.error(message)
    log('error', message)
  },
}
