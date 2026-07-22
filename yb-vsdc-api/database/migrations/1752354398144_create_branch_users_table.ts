import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'branch_users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').notNullable().primary().unique()

      table.integer('user_branch_id').notNullable().references('id').inTable('branches')

      table.integer('tin', 9).notNullable()
      table.string('branch_id', 2).notNullable()
      table.string('user_id', 20).notNullable()
      table.string('user_name', 60).notNullable()
      table.string('password', 255).notNullable()
      table.string('address', 200).nullable()
      table.string('contact', 20).nullable()
      table.string('authority_code', 100).nullable()
      table.string('remark', 2000).nullable()
      table.enum('used', ['Y', 'N']).notNullable()
      table.string('registrant_name', 60).notNullable()
      table.string('registrant_id', 20).notNullable()
      table.string('modifier_name', 60).notNullable()
      table.string('modifier_id', 20).notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
