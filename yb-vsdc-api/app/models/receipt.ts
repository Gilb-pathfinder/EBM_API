import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import Sale from './sale.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class Receipt extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare userId: string

  @column()
  declare saleId: string

  @belongsTo(() => Sale)
  declare sale: BelongsTo<typeof Sale>
}