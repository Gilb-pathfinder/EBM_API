import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'

export default class ItemComposition extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare itemCode: string

  @column()
  declare componentItemCode: string

  @column()
  declare quantity: number

  @column()
  declare cost: number

  @column()
  declare userId: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @beforeCreate()
  static async setId(itemComposition: ItemComposition) {
    itemComposition.id = crypto.randomUUID()
  }
}
