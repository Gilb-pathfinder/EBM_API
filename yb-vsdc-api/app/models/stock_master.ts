import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class StockMaster extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare tin: string

  @column()
  declare branchId: string

  @column()
  declare itemCode: string

  @column()
  declare remainQuantity: number

  @column()
  declare registrantId: string

  @column()
  declare registrantName: string

  @column()
  declare modifierId: string

  @column()
  declare modifierName: string

  @column()
  declare originalStoredAndReleaseNo: number

  //#region relationships
  @belongsTo(() => StockMaster)
  declare user: BelongsTo<typeof StockMaster>

  //#endregion

  //#region hooks
  @beforeCreate()
  static async setId(stock: StockMaster) {
    stock.id = crypto.randomUUID()
  }

  //#endregion
}
