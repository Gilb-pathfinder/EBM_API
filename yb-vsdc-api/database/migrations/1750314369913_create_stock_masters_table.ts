import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'stock_masters'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary()

      table.string('user_id').notNullable().references('id').inTable('users')

      table.string('branch_id').notNullable()

      table.string('item_code').notNullable()
      table.float('remain_quantity', 2).notNullable()
      table.string('registrant_id').notNullable()
      table.string('registrant_name').notNullable()
      table.string('modifier_id').notNullable()
      table.string('modifier_name').notNullable()

      table.bigInteger('original_stored_and_release_no').unsigned()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
