import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'sale_queue'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.string('user_id').notNullable().index()
      table.integer('invoice_no').notNullable()
      table.jsonb('sale_payload').notNullable()
      table.string('previous_rcpt_sign', 512).nullable()
      table.text('previous_intrl_data').nullable()
      table.enum('status', ['pending', 'processing', 'done', 'failed']).defaultTo('pending').notNullable()
      table.integer('attempt_count').defaultTo(0).notNullable()
      table.text('last_error').nullable()
      table.timestamp('queued_at').notNullable()
      table.timestamp('processed_at').nullable()
      table.timestamps(true, true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
