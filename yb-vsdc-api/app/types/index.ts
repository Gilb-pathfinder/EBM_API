import { DateTime } from 'luxon'
import { EbmCountryCode, EbmPackagingUnit, EbmProductType, EbmUnitOfQuantity } from './ebm/ebm_type.js'

export interface SaleData {
  receiptNo: number
  internalData: string
  receiptSignature: string
  totalReceiptNo: number
  vsdcReceiptPublicationDate: DateTime // Date in the format 'yyyyMMddHHmmss'
  sdcId: string
  mrcNo: string
}

export enum PrintPaperSize {
  A4 = 'A4',
  A3 = 'A3',
  A5 = 'A5',
  Letter = 'Letter',
  Legal = 'Legal',
  Tabloid = 'Tabloid',
  Executive = 'Executive',
  B5 = 'B5',
  Roll = 'Roll', // Thermal paper roll ~80mm width
}

export type PaymentSummary = Record<
  string,
  Record<
    string,
    {
      totalReceipt: string
      totalAmount: string
    }
  >
>

export interface ItemCodeParts {
  countryCode: EbmCountryCode
  productType: EbmProductType
  packingUnit: EbmPackagingUnit
  quantityUnit: EbmUnitOfQuantity
  increment: number
}
