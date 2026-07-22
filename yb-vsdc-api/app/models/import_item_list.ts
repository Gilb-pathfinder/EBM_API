import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column, scope } from '@adonisjs/lucid/orm'
import User from './user.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { EbmCountryCode, EbmImportItemStatus, EbmPackagingUnit, EbmUnitOfQuantity } from '#types/ebm/ebm_type'
import env from '#start/env'

export default class ImportItemList extends BaseModel {
  static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  declare id: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare taskCode: number

  @column()
  declare declarationDate: string

  @column()
  declare itemSequence: number

  @column()
  declare declarationNumber: string

  @column()
  declare hsCode: string

  @column()
  declare itemName: string

  @column()
  declare statusCode: EbmImportItemStatus

  @column()
  declare originNationCode: EbmCountryCode

  @column()
  declare exportNationCode: EbmCountryCode

  @column()
  declare packageQuantity: number

  @column()
  declare packageUnitCode: EbmPackagingUnit | null

  @column()
  declare quantity: number

  @column()
  declare quantityUnitCode: EbmUnitOfQuantity | null

  @column()
  declare totalWeight: number

  @column()
  declare netWeight: number

  @column()
  declare supplierName: string

  @column()
  declare agentName: string

  @column()
  declare invoiceForeignCurrencyAmount: number

  @column()
  declare invoiceForeignCurrencyCode: string

  @column()
  declare invoiceForeignCurrencyExchangeRate: number

  @column()
  declare userId: string

  @column()
  declare ebmApiVersion: string

  @column()
  declare cisApiVersion: string

  @column()
  declare isApproved: boolean

  @column()
  declare isCanceled: boolean

  //#region relationships
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  //#endregion

  //#region hooks
  @beforeCreate()
  static async setId(item: ImportItemList) {
    item.id = crypto.randomUUID()
    item.cisApiVersion = env.get('EBM_CIS_VERSION')
    item.ebmApiVersion = env.get('EBM_API_VERSION')
  }

  static isApproved = scope((query) => {
    query.where('is_approved', true)
  })

  static isCanceled = scope((query) => {
    query.where('is_approved', true)
  })

  static isNotAcceptedAndCanceled = scope((query) => {
    query.where('is_approved', false).andWhere('is_canceled', false)
  })
}