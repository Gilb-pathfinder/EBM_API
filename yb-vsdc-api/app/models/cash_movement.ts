import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'

export enum CashMovementType {
  Deposit = 'DEPOSIT',
  Withdrawal = 'WITHDRAWAL',
}

export default class CashMovement extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare movementType: CashMovementType

  @column()
  declare amount: number

  @column()
  declare description: string | null

  @column()
  declare occurredDt: string // EBM format yyyyMMddHHmmss

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @beforeCreate()
  static async setId(movement: CashMovement) {
    movement.id = crypto.randomUUID()
  }
}
