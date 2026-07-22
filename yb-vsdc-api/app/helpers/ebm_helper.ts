import env from '#start/env'
import { EbmLastRequestDateTime, ItemCodeEbmOptions } from '#types/ebm/ebm_service_type'
import { EbmCountryCode, EbmPackagingUnit, EbmPaymentMethod, EbmProductType, EbmTaxType, EbmUnitOfQuantity } from '#types/ebm/ebm_type'
import { ItemCodeParts } from '#types/index'
import { DateTime } from 'luxon'

export function getTaxAmountByType(type: EbmTaxType) {
  // TODO: Fetch from TaxConfig model for full dynamic support
  switch (type) {
    case EbmTaxType.A:
      return env.get('EBM_TAX_RATE_A')
    case EbmTaxType.B:
      return env.get('EBM_TAX_RATE_B')
    case EbmTaxType.C:
      return env.get('EBM_TAX_RATE_C')
    case EbmTaxType.D:
      return env.get('EBM_TAX_RATE_D')
  }
}

export function getTaxRateByType(type: EbmTaxType) {
  switch (type) {
    case EbmTaxType.A:
      return env.get('EBM_TAX_DIVIDER_A')
    case EbmTaxType.B:
      return env.get('EBM_TAX_DIVIDER_B')
    case EbmTaxType.C:
      return env.get('EBM_TAX_DIVIDER_C')
    case EbmTaxType.D:
      return env.get('EBM_TAX_DIVIDER_D')
  }
}

export function convertEbmLastRequestDateToDt(date: EbmLastRequestDateTime) {
  if (!date.year) return undefined

  return DateTime.fromObject({
    year: +date.year!!,
    month: +date.month!!,
    day: +date.day!!,
    hour: +date.hour!!,
    minute: +date.minute!!,
    second: +date.second!!,
  })
}

export function convertDateTimeToLastRequestDtOption(dt: DateTime | undefined | null) {
  if (!dt) return undefined

  return {
    year: dt.year.toString(),
    month: dt.month.toString(),
    day: dt.day.toString(),
    hour: dt.hour.toString(),
    minute: dt.minute.toString(),
    second: dt.second.toString(),
  }
}

export function getEbmTaxName(tax: 'A' | 'B' | 'C' | 'D') {
  if (tax == 'A') {
    return 'A-EX'
  } else if (tax == 'B') {
    return ' B-18.00%'
  } else {
    return tax
  }
}

/**
 * F-51: Extract main item group (product type) from classification code
 * Classification code format: CC[productType]... where CC=country code, productType=1-4
 * Examples: RW1XXXX, RW2XXXX, RW3XXXX, RW4XXXX
 */
export function getMainItemGroup(classificationCode: string): string {
  if (!classificationCode || classificationCode.length < 3) return 'Other'

  const productTypeCode = classificationCode.charAt(2)
  const groups: { [key: string]: string } = {
    '1': 'Raw Materials',
    '2': 'Finished Products',
    '3': 'Services',
    '4': 'Composed Items',
  }

  return groups[productTypeCode] || 'Other'
}

export function getEbmPaymentMethodDescription(paymentMethod: EbmPaymentMethod): string {
  const descriptions: { [key in EbmPaymentMethod]: string } = {
    [EbmPaymentMethod.CASH]: 'CASH',
    [EbmPaymentMethod.CREDIT]: 'CREDIT',
    [EbmPaymentMethod.CASH_CREDIT]: 'CASH/CREDIT',
    [EbmPaymentMethod.BANK_CHECK]: 'BANK CHECK PAYMENT',
    [EbmPaymentMethod.DEBIT_CREDIT_CARD]: 'DEBIT & CREDIT CARD PAYMENT',
    [EbmPaymentMethod.MOBILE_MONEY]: 'MOBILE MONEY',
    [EbmPaymentMethod.OTHER]: 'OTHER MEANS OF PAYMENT',
  }

  return descriptions[paymentMethod]
}

export function splitEbmDateTime(datetimeStr: string): { date: string; time: string } {
  if (!/^\d{14}$/.test(datetimeStr)) {
    throw new Error('Invalid datetime format. Expected format: yyyyMMddhhmmss')
  }

  const year = datetimeStr.substring(0, 4)
  const month = datetimeStr.substring(4, 6)
  const day = datetimeStr.substring(6, 8)
  const hour = datetimeStr.substring(8, 10)
  const minute = datetimeStr.substring(10, 12)
  const second = datetimeStr.substring(12, 14)

  return {
    date: `${day}/${month}/${year}`, // MM/DD/YYYY
    time: `${hour}:${minute}:${second}`, // HH:mm:ss
  }
}

export function splitEveryFourChars(input: string) {
  const parts = []

  for (let i = 0; i < input.length; i += 4) {
    parts.push(input.slice(i, i + 4))
  }

  return parts.join('-')
}

export function encodeEbmSaleForQRCode(data: {
  ebmDt: { date: string; time: string }
  sdcId: string
  rcptNo: string
  intrlData: string
  rcptSign: string
}): string {
  const { date, time } = data.ebmDt
  const { sdcId, rcptNo, intrlData, rcptSign } = data

  const rawString = `${date}#${time}#${sdcId}#${rcptNo}#${intrlData}#${rcptSign}`
  return encodeURIComponent(rawString)
}

export function formatEbmCisDateTime(dateString: string | DateTime) {
  // Convert to a proper Date object
  const date = typeof dateString === 'string' ? DateTime.fromSQL(dateString) : dateString

  return {
    date: date.toFormat('dd/MM/yyyy'),
    time: date.toFormat('HH:mm:ss'),
  }
}

export function padCustomerNoToNineDigits(num: number): string {
  const str = num.toString()

  if (str.length > 9) {
    throw new Error('Number is too large to fit into 9 digits')
  }

  return str.padStart(9, '0')
}

export function formatToEbmReqDt(date: DateTime) {
  console.log({ date })
  return date.toFormat('yyyyMMddHHmmss')
}

export function convertEbmReqDtToDateTime(dt: string) {
  return DateTime.fromFormat('yyyyMMddHHmmss', dt)
}

export function getNumberFromItemCode(itemCode: string) {
  const codeNbr = itemCode.slice(-7)

  if (codeNbr.length == 7) return +codeNbr || 0

  return 0
}

export function parseItemCode(itemCd: string): ItemCodeParts | null {
  // Regex: 2 letters (country) + 1 digit (productType) + 2 letters (packageUnit) + 2-3 letters (quantityUnit) + digits (increment)
  const regex = /^([A-Z]{2})(\d)([A-Z]{2})([A-Z]{1,3})(\d+)$/
  const match = itemCd.match(regex)

  if (!match) return null

  const [, country, productType, packageUnit, quantityUnit, increment] = match

  return {
    countryCode: country as EbmCountryCode,
    productType: productType as EbmProductType,
    packingUnit: packageUnit as EbmPackagingUnit,
    quantityUnit: quantityUnit as EbmUnitOfQuantity,
    increment: parseInt(increment, 10)
  }
}

export function generateItemCode(options: ItemCodeEbmOptions) {
  let lastIncrementCode = ''

  if (!options.lastItemCode) {
    lastIncrementCode = '0000001'
  } else {
    const itemCodeMatch = options.lastItemCode.slice(-7)

    const lastCodePart = (parseInt(itemCodeMatch, 10) + 1).toString()

    for (let i = 0; i < 7 - lastCodePart.length; i++) {
      lastIncrementCode += '0'
    }

    lastIncrementCode += lastCodePart
  }

  return (
    options.itemCode.countryCode +
    options.itemCode.productType +
    options.itemCode.packingUnit +
    options.itemCode.quantityUnit +
    lastIncrementCode
  )
}
