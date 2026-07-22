import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class TaxConfig extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare taxType: string // A, B, C, D

  @column()
  declare rate: number

  @column()
  declare divider: number

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}