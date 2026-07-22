import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class ExchangeRate extends BaseModel {
  static table = 'exchange_rates'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare currencyCode: string   // ISO 4217: USD, EUR, GBP …

  @column()
  declare currencyName: string

  @column()
  declare rateToRwf: number      // 1 unit = X RWF

  @column()
  declare effectiveDate: string  // YYYY-MM-DD

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
