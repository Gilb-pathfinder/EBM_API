import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'sales'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('rcpt_sign').nullable().after('ebm_receipt_no') // F-54: Current receipt signature (HMAC)
      table.string('prev_rcpt_sign').nullable().after('rcpt_sign') // F-54: Previous receipt signature for chaining
      table.string('intrl_data').nullable().after('prev_rcpt_sign') // F-54: Internal data for signature computation
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('rcpt_sign')
      table.dropColumn('prev_rcpt_sign')
      table.dropColumn('intrl_data')
    })
  }
}
