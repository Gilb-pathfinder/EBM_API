import { EbmYesOrNo } from '#types/ebm/ebm_service_type'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'branch_customers'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').notNullable().primary().unique()

      table.integer('user_branch_id').notNullable().references('id').inTable('branches')

      table.integer('tin', 9).notNullable()
      table.string('branch_id', 2).notNullable()
      table.integer('customer_no').notNullable()
      table.string('customer_phone_number').notNullable()
      table.integer('customer_tin', 9).notNullable()
      table.string('customer_name', 60).notNullable()
      table.string('address', 300).nullable()
      table.string('contact').nullable()
      table.string('email', 50).nullable()
      table.string('fax_number').nullable()
      table.enum('used', Object.values(EbmYesOrNo)).notNullable()
      table.string('remark', 1000).nullable()
      table.string('registrant_name', 60).notNullable()
      table.string('registrant_id').notNullable()
      table.string('modifier_name', 60).notNullable()
      table.string('modifier_id').notNullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
