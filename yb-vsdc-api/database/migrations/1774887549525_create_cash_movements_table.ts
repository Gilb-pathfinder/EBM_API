import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'cash_movements'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary()
      table.string('user_id').references('id').inTable('users').notNullable().onDelete('CASCADE')
      table.enum('movement_type', ['DEPOSIT', 'WITHDRAWAL']).notNullable()
      table.decimal('amount', 15, 2).notNullable()
      table.string('description').nullable()
      table.string('occurred_dt').notNullable() // EBM format yyyyMMddHHmmss

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
