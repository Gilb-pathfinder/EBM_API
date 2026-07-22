import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column, scope } from '@adonisjs/lucid/orm'
import User from './user.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import env from '#start/env'
import { EbmPurchaseItem } from '#types/ebm/ebm_service_type'
import { EbmPaymentMethod, EbmReceiptType } from '#types/ebm/ebm_type'

export default class PurchaseList extends BaseModel {

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
  declare supplierTin: number

  @column()
  declare supplierBranchId: string

  @column()
  declare supplierName: string

  @column()
  declare supplierInvoiceNo: number

  @column()
  declare supplierSdcId: string

  @column()
  declare purchaseOrderCode: string

  @column()
  declare supplierMrcNo: string

  @column()
  declare receiptTypeCode: EbmReceiptType

  @column()
  declare paymentMethod: EbmPaymentMethod

  @column.dateTime()
  declare confirmationDate: DateTime

  @column.date()
  declare saleDate: DateTime

  @column.dateTime()
  declare stockReleaseDate: DateTime

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
  declare remark: string | null

  @column()
  declare items: { data: EbmPurchaseItem[] } // stored as JSON

  @column()
  declare ebmApiVersion: string

  @column()
  declare cisApiVersion: string

  @column()
  declare resultDt: string

  @column()
  declare isConfirmed: boolean

  @column()
  declare isRejected: boolean

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @beforeCreate()
  static async setId(purchase: PurchaseList) {
    purchase.id = crypto.randomUUID()
    purchase.cisApiVersion = env.get('EBM_CIS_VERSION')
    purchase.ebmApiVersion = env.get('EBM_API_VERSION')
  }

  static isConfirmed = scope((query) => {
    query.where('is_confirmed', true)
  })
  
  static isRejected = scope((query) => {
    query.where('is_confirmed', true)
  })
  
  static isNotAcceptedAndRejected = scope((query) => {
    query.where('is_confirmed', false).andWhere('is_rejected', false)
  })

}