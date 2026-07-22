import edge from 'edge.js'
import env from '#start/env'
import { getEbmTaxName, getEbmPaymentMethodDescription, splitEbmDateTime, splitEveryFourChars, encodeEbmSaleForQRCode, formatEbmCisDateTime } from '#helpers/ebm_helper'

/**
 * Define a global property
 */
edge.global('appUrl', env.get('BASE_URL'))
edge.global('appPhoneNumber', env.get('APP_PHONE_NUMBER'))
edge.global('getEbmTaxName', getEbmTaxName)
edge.global('getEbmPaymentMethodDescription', getEbmPaymentMethodDescription)
edge.global('splitEbmDateTime', splitEbmDateTime)
edge.global('splitEveryFourChars', splitEveryFourChars)
edge.global('encodeEbmSaleForQRCode', encodeEbmSaleForQRCode)
edge.global('formatEbmCisDateTime', formatEbmCisDateTime)
