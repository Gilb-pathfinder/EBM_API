import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'sales'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.json('payment_breakdown').nullable().after('payment_method') // F-28: Store mixed payment breakdown {method, amount}[]
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('payment_breakdown')
    })
  }
}
