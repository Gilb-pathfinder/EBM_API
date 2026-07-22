// F-56: Settings Persistence Model

import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import User from './user.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class Setting extends BaseModel {
  static table = 'settings'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: string | null // F-56: Null = global setting, otherwise user-specific

  @column()
  declare key: string // F-56: Setting key (e.g., 'smtp_host', 'timezone')

  @column()
  declare value: string | null // F-56: Setting value (JSON for complex objects)

  @column()
  declare type: 'string' | 'json' | 'boolean' | 'number' // F-56: Value type for proper deserialization

  @column()
  declare description: string | null

  @column()
  declare isEncrypted: boolean // F-56: Whether value is encrypted (for passwords, API keys)

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  /**
   * F-56: Get parsed value based on type
   */
  getValue(): any {
    if (!this.value) return null

    switch (this.type) {
      case 'json':
        try {
          return JSON.parse(this.value)
        } catch {
          return this.value
        }
      case 'boolean':
        return this.value === 'true' || this.value === '1'
      case 'number':
        return Number(this.value)
      default:
        return this.value
    }
  }

  /**
   * F-56: Set value and automatically determine type if needed
   */
  setValue(value: any): void {
    if (value === null || value === undefined) {
      this.value = null
      return
    }

    if (this.type === 'json' || typeof value === 'object') {
      this.value = JSON.stringify(value)
      this.type = 'json'
    } else if (typeof value === 'boolean') {
      this.value = value ? 'true' : 'false'
      this.type = 'boolean'
    } else if (typeof value === 'number') {
      this.value = String(value)
      this.type = 'number'
    } else {
      this.value = String(value)
      this.type = 'string'
    }
  }
}
