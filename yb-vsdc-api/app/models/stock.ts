import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import { EbmStockItem } from '#types/ebm/ebm_service_type'
import { EbmRegistrationType, EbmStockInOutType } from '#types/ebm/ebm_type'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class Stock extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare branchId: string

  @column()
  declare storedAndReleasedNo: string

  @column()
  declare originalStoredAndReleaseNo: string

  @column()
  declare registrationType: EbmRegistrationType

  @column()
  declare customerTin?: string

  @column()
  declare customerName?: string

  @column()
  declare customerBranchId?: string

  @column()
  declare storedAndReleasedType: EbmStockInOutType

  @column()
  declare occuredDt: string

  @column()
  declare totalItem: number

  @column()
  declare totalTaxableAmount: number

  @column()
  declare totalTaxAmount: number

  @column()
  declare totalAmount: number

  @column()
  declare remark?: string

  @column()
  declare regristrantId: string

  @column()
  declare regristrantName: string

  @column()
  declare modifierName: string

  @column()
  declare modifierId: string

  @column()
  declare items: {data: EbmStockItem[]}

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  //#region relationships
  @belongsTo(() => Stock)
  declare user: BelongsTo<typeof Stock>

  //#endregion

  //#region hooks
  @beforeCreate()
  static async setId(stock: Stock) {
    stock.id = crypto.randomUUID()
  }

  //#endregion
}
