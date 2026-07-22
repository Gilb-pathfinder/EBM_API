import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'exchange_rates'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('currency_code', 3).notNullable()     // ISO 4217: USD, EUR, GBP …
      table.string('currency_name', 60).notNullable()    // e.g. US Dollar
      table.decimal('rate_to_rwf', 14, 4).notNullable()  // 1 unit of currency = rate RWF
      table.date('effective_date').notNullable()          // date this rate applies
      table.boolean('is_active').defaultTo(true)
      table.timestamp('created_at')
      table.timestamp('updated_at')
      table.unique(['currency_code', 'effective_date'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}