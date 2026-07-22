import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'notices'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.string('user_id').notNullable().references('id').inTable('users')

      table.integer('notice_no').notNullable()
      table.string('title').notNullable()
      table.text('content').notNullable()
      table.string('detail_url').nullable()
      table.string('registrar_name').nullable()
      table.string('registered_at').notNullable()
      
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
