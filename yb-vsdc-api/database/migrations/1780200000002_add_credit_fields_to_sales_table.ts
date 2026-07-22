import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'sales'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.date('expected_payment_date').nullable().after('sale_date') // F-29: Expected payment date for credit sales
      table.enum('credit_status', ['none', 'outstanding', 'partial', 'paid']).defaultTo('none').after('expected_payment_date') // F-29: Credit payment status
      table.decimal('credit_paid_amount', 15, 2).defaultTo(0).after('credit_status') // F-29: Amount paid towards credit
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('expected_payment_date')
      table.dropColumn('credit_status')
      table.dropColumn('credit_paid_amount')
    })
  }
}
