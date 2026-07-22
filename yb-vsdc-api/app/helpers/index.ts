import env from '#start/env'
import { DateTime } from 'luxon'
import { formatToEbmReqDt } from './ebm_helper.js'

export function isDevOrSandboxEnv() {
  return env.get('NODE_ENV') == 'development' || env.get('NODE_ENV') == 'sandbox'
}

export function formatNumberBy2Decimals(nbr: number) {
  return parseFloat(nbr.toFixed(2))
}

export const DEFAULT_LAST_REQUEST_DT = formatToEbmReqDt(DateTime.now().set({year: 2018, month: 1, day: 1, hour: 0, minute: 0, second: 0}))
