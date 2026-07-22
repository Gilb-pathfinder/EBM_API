import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Notice extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare noticeNo: number

  @column()
  declare userId: string

  @column()
  declare title: string

  @column()
  declare content: string

  @column()
  declare detailUrl: string | null

  @column()
  declare registrarName: string | null

  @column()
  declare registeredAt: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}