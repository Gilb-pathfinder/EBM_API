import { EbmRegistrationType, EbmStockInOutType } from '#types/ebm/ebm_type'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'stocks'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary()

      table.string('user_id').notNullable().references('id').inTable('users')

      table.string('branch_id').notNullable()
      table.integer('stored_and_released_no').notNullable()
      table.integer('original_stored_and_release_no').notNullable()
      table.enum('registration_type', Object.values(EbmRegistrationType)).notNullable() // Should match  enum
      table.string('customer_tin').nullable()
      table.string('customer_name').nullable()
      table.string('customer_branch_id').nullable()
      table.enum('stored_and_released_type', Object.values(EbmStockInOutType)).notNullable() // Should match EbmStockInOutType enum
      table.string('occured_dt').notNullable()

      table.integer('total_item').notNullable()
      table.decimal('total_taxable_amount', 15, 2).notNullable()
      table.decimal('total_tax_amount', 15, 2).notNullable()
      table.decimal('total_amount', 15, 2).notNullable()

      table.text('remark').nullable()
      table.string('regristrant_id').notNullable()
      table.string('regristrant_name').notNullable()
      table.string('modifier_name').notNullable()
      table.string('modifier_id').notNullable()

      table.json('items').notNullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
