import { DateTime } from 'luxon'
import {
  BaseModel,
  beforeCreate, belongsTo,
  column,
  hasMany
} from '@adonisjs/lucid/orm'
import {
  EbmPaymentMethod,
  EbmReceiptType,
  EbmRegistrationType,
  EbmTransactionProgress,
  EbmTransactionType,
} from '#types/ebm/ebm_type'
import type { EbmPurchaseItem, EbmYesOrNo } from '#types/ebm/ebm_service_type'
import User from '#models/user'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import env from '#start/env'
import Sale from './sale.js'

export default class Purchase extends BaseModel {
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
  declare supplierTin: number | null

  @column()
  declare supplierBranchId: string | null

  @column()
  declare supplierName: string | null

  @column()
  declare supplierInvoiceNo: number | null

  @column()
  declare supplierSdcId: string | null

  @column()
  declare registrationTypeCode: EbmRegistrationType

  @column()
  declare purchaseTypeCode: EbmTransactionType

  @column()
  declare receiptTypeCode: EbmReceiptType

  @column()
  declare paymentMethod: EbmPaymentMethod

  @column()
  declare purchaseStatusCode: EbmTransactionProgress

  @column.dateTime()
  declare confirmationDate?: DateTime

  @column()
  declare purchaseDate: DateTime

  @column.dateTime()
  declare warehousingDate?: DateTime | null

  @column.dateTime()
  declare cancelRequestDate?: DateTime | null

  @column.dateTime()
  declare canceledDate?: DateTime | null

  @column()
  declare refundDate?: DateTime | null

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
  declare itemsReceived: EbmYesOrNo

  @column()
  declare registrantName: string

  @column()
  declare registrantId: string

  @column()
  declare modifierId: string

  @column()
  declare modifierName: string

  @column()
  declare remark: string | null

  @column()
  declare items: {data: EbmPurchaseItem[]} // stored as JSON

  @column()
  declare ebmApiVersion: string

  @column()
  declare cisApiVersion: string

  @column()
  declare resultDt: string

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  
  @hasMany(() => Sale)
  declare sales: HasMany<typeof Sale>

  @beforeCreate()
  static async setId(purchase: Purchase) {
    purchase.id = crypto.randomUUID()
    purchase.cisApiVersion = env.get('EBM_CIS_VERSION')
    purchase.ebmApiVersion = env.get('EBM_API_VERSION')
  }

}
