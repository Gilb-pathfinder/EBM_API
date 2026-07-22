import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'item_compositions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.string('item_code').notNullable()
      table.string('component_item_code').notNullable()
      table.decimal('quantity', 18, 2).notNullable()
      table.decimal('cost', 18, 2).notNullable()
      table.string('user_id').references('id').inTable('users').onDelete('CASCADE')
      
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
