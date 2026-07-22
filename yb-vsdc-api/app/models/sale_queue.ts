import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column } from '@adonisjs/lucid/orm'

export type SaleQueueStatus = 'pending' | 'processing' | 'done' | 'failed'

export default class SaleQueue extends BaseModel {
  static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare invoiceNo: number

  @column()
  declare salePayload: Record<string, any>

  @column()
  declare previousRcptSign: string | null

  @column()
  declare previousIntrlData: string | null

  @column()
  declare status: SaleQueueStatus

  @column()
  declare attemptCount: number

  @column()
  declare lastError: string | null

  @column.dateTime()
  declare queuedAt: DateTime

  @column.dateTime()
  declare processedAt: DateTime | null

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @beforeCreate()
  static assignId(item: SaleQueue) {
    item.id = crypto.randomUUID()
  }
}
