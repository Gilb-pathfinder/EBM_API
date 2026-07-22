import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('users', (table) => {
      table.string('last_rcpt_sign', 512).nullable()
      table.text('last_intrl_data').nullable()
    })
    this.schema.alterTable('sales', (table) => {
      table.string('previous_rcpt_sign', 512).nullable()
      table.text('previous_intrl_data').nullable()
    })
  }

  async down() {
    this.schema.alterTable('users', (table) => {
      table.dropColumn('last_rcpt_sign')
      table.dropColumn('last_intrl_data')
    })
    this.schema.alterTable('sales', (table) => {
      table.dropColumn('previous_rcpt_sign')
      table.dropColumn('previous_intrl_data')
    })
  }
}
