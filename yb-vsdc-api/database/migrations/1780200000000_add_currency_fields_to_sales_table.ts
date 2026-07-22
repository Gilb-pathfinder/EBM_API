import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'sales'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('currency_code', 3).nullable().after('payment_method') // ISO 4217: USD, EUR, RWF, default RWF
      table.decimal('original_amount', 15, 2).nullable().after('currency_code') // Amount in original currency
      table.decimal('exchange_rate', 14, 4).nullable().after('original_amount') // Rate used (1 unit = X RWF)
      table.date('exchange_rate_date').nullable().after('exchange_rate') // Date of the exchange rate used
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('currency_code')
      table.dropColumn('original_amount')
      table.dropColumn('exchange_rate')
      table.dropColumn('exchange_rate_date')
    })
  }
}
