import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, beforeSave, belongsTo, column, scope } from '@adonisjs/lucid/orm'
import {
  EbmPaymentMethod,
  EbmReceiptType,
  EbmTransactionProgress,
  EbmTransactionType,
} from '#types/ebm/ebm_type'
import type {
  EbmItem,
  EbmReceipt,
  SaleEbmResponseData,
} from '#types/ebm/ebm_service_type'
import User from '#models/user'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { Filterable } from 'adonis-lucid-filter'
import { compose } from '@adonisjs/core/helpers'
import SaleFilter from '#filters/sale_filter'
import env from '#start/env'
import Purchase from './purchase.js'

export default class Sale extends compose(BaseModel, Filterable) {
  static $filter = () => SaleFilter

  static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare tin: number

  @column()
  declare branchId: string

  @column()
  declare invoiceNo: number

  @column()
  declare originalInvoiceNo: number

  @column()
  declare customerTin: number | null

  @column()
  declare purchaseCode: string | null

  @column()
  declare customerName: string

  @column()
  declare customerMobileNo: string | null

  @column()
  declare saleType: EbmTransactionType

  @column()
  declare receiptType: EbmReceiptType

  @column()
  declare paymentMethod: EbmPaymentMethod

  @column()
  declare paymentBreakdown: Array<{ method: string; amount: number }> | null // F-28: Mixed payment breakdown

  @column()
  declare currencyCode: string | null

  @column()
  declare originalAmount: number | null

  @column()
  declare exchangeRate: number | null

  @column.date()
  declare exchangeRateDate: DateTime | null

  @column()
  declare saleStatus: EbmTransactionProgress

  @column.dateTime()
  declare confirmationDate: DateTime

  @column.date()
  declare saleDate: DateTime

  @column.date()
  declare exportDate: DateTime | null // F-32: Export date (when goods leave the country)

  @column()
  declare exportDocumentRef: string | null // F-32: Export document reference (customs doc, bill of lading, etc.)

  @column()
  declare exportCountryCode: string | null // F-32: ISO 3166-1 alpha-2 country code where goods exported to

  @column.date()
  declare expectedPaymentDate: DateTime | null // F-29: Expected payment date for credit sales

  @column()
  declare creditStatus: 'none' | 'outstanding' | 'partial' | 'paid' // F-29: Credit payment status

  @column()
  declare creditPaidAmount: number // F-29: Amount paid towards credit

  @column.dateTime()
  declare stockReleaseDate: DateTime | null

  @column.dateTime()
  declare cancelRequestDate: DateTime | null

  @column.dateTime()
  declare canceledDate: DateTime | null

  @column.dateTime()
  declare refundDate: DateTime | null

  @column()
  declare refundReason: EbmTransactionProgress | null

  @column()
  declare totalItems: number

  @column()
  declare taxableAmountA: number

  @column()
  declare taxableAmountB: number

  @column()
  declare taxableAmountC: number

  @column()
  declare taxableAmountD: number

  @column()
  declare taxRateA: number

  @column()
  declare taxRateB: number

  @column()
  declare taxRateC: number

  @column()
  declare taxRateD: number

  @column()
  declare taxAmountA: number

  @column()
  declare taxAmountB: number

  @column()
  declare taxAmountC: number

  @column()
  declare taxAmountD: number

  @column()
  declare totalTaxableAmount: number

  @column()
  declare totalTaxAmount: number

  @column()
  declare totalAmount: number

  @column()
  declare itemsReceived: string

  @column()
  declare remark: string | null

  @column()
  declare registrantName: string

  @column()
  declare registrantId: string

  @column()
  declare modifierId: string

  @column()
  declare modifierName: string

  @column()
  declare receipt: EbmReceipt // Store receipt data as JSON

  @column()
  declare items: { data: EbmItem[] } // Store items data as JSON

  @column()
  declare ebmSaleData: SaleEbmResponseData

  // F-54: Signature Chaining — each receipt signature is computed using the previous receipt's signature
  @column()
  declare rcptSign: string | null // Current receipt signature (HMAC)

  @column()
  declare previousRcptSign: string | null // Previous receipt signature for chaining

  @column()
  declare intrlData: string | null // Internal data used for signature computation (F-54)

  @column()
  declare previousIntrlData: string | null

  @column()
  declare cisApiVersion: string

  @column()
  declare ebmApiVersion: string

  @column()
  declare resultDt: string

  @column()
  declare invoiceType: string

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime
  //#endregion

  //#region relationships
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Purchase)
  declare purchase: BelongsTo<typeof Purchase>
  //#endregion

  //#region hooks
  @beforeCreate()
  static async setId(sale: Sale) {
    sale.id = crypto.randomUUID()
  }

  @beforeSave()
  static async insertApiVersion(sale: Sale) {
    sale.ebmApiVersion = env.get('EBM_API_VERSION')
  }

  @beforeSave()
  static async insertInvoiceType(sale: Sale) {
    sale.invoiceType = sale.saleType + sale.receiptType
  }

  //#endregion

  //#region scopes
  
    static totaltSummuries = scope((query) => {
      query
        .count('*', 'totalReceipt')
        .sum('total_amount', 'totalAmount')
    })
  
  static taxAmountSummuries = scope((query) => {
    query
      .sum('taxable_amount_a', 'taxableAmountA')
      .sum('taxable_amount_b', 'taxableAmountB')
      .sum('taxable_amount_c', 'taxableAmountC')
      // .sum('taxable_amount_d', 'taxableAmountD')
      // .sum('tax_amount_a', 'taxAmountA')
      .sum('tax_amount_b', 'taxAmountB')
      .sum('tax_amount_c', 'taxAmountC')
      .sum('tax_amount_d', 'taxAmountD')
      .sum('total_items', 'totalItems')
  })

  //#endregion
}
