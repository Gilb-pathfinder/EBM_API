import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'settings'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('user_id').nullable() // Null = global settings, or user_id = user-specific settings
      table.string('key').notNullable() // Setting key (e.g., 'smtp_host', 'timezone', 'webhook_url')
      table.text('value').nullable() // Setting value (can be JSON for complex objects)
      table.string('type').defaultTo('string') // Type: string, json, boolean, number
      table.string('description').nullable() // Human-readable description
      table.boolean('is_encrypted').defaultTo(false) // F-56: For sensitive settings like SMTP password
      table.unique(['user_id', 'key']) // F-56: Unique constraint per user+key
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      table.foreign('user_id').references('users.id').onDelete('CASCADE')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
