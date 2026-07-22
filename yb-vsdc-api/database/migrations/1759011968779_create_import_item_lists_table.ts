import { EbmCountryCode, EbmCurrencyCode, EbmImportItemStatus, EbmPackagingUnit, EbmUnitOfQuantity } from '#types/ebm/ebm_type'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'import_item_lists'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary()

      table.string('user_id').notNullable().references('id').inTable('users')

      table.string('task_code').notNullable()
      table.string('declaration_date').notNullable()
      table.integer('item_sequence').notNullable()
      table.string('declaration_number').notNullable()
      table.string('hs_code').notNullable()
      table.string('item_name').notNullable()
      table.enum('status_code', Object.values(EbmImportItemStatus)).notNullable()
      table.enum('origin_nation_code', Object.values(EbmCountryCode)).notNullable()
      table.enum('export_nation_code', Object.values(EbmCountryCode)).notNullable()
      table.integer('package_quantity').notNullable()
      table.enum('package_unit_code', Object.values(EbmPackagingUnit)).nullable()
      table.integer('quantity').notNullable()
      table.enum('quantity_unit_code', Object.values(EbmUnitOfQuantity)).nullable()
      table.decimal('total_weight', 15, 2).notNullable()
      table.decimal('net_weight', 15, 2).notNullable()
      table.string('supplier_name').notNullable()
      table.string('agent_name').notNullable()
      table.decimal('invoice_foreign_currency_amount', 18, 2).notNullable()
      table.enum('invoice_foreign_currency_code', Object.values(EbmCurrencyCode)).notNullable()
      table.decimal('invoice_foreign_currency_exchange_rate', 15, 2).notNullable()

      table.string('ebm_api_version').notNullable()
      table.string('cis_api_version').notNullable()

      table.boolean('is_approved').notNullable().defaultTo(false)
      table.boolean('is_canceled').notNullable().defaultTo(false)

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}