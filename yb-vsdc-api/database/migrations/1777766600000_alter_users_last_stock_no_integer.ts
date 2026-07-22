import { BaseSchema } from '@adonisjs/lucid/schema'

const COUNTER_COLS = [
  'last_stock_no',
  'last_purchase_invoice_no',
  'last_sale_receipt_no',
  'last_invoice_no',
  'last_sale_invoice_no',
  'last_training_invoice_no',
  'last_proforma_invoice_no',
  'last_copy_invoice_no',
  'last_import_task_code',
  'last_customer_no',
]

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    // Reset any out-of-range values caused by the "+= 1" string-concat bug
    // (bigint returned as string by pg made "0" + 1 = "01", "1" + 1 = "11", etc.)
    for (const col of COUNTER_COLS) {
      await this.db.rawQuery(
        `UPDATE "${this.tableName}" SET "${col}" = 0 WHERE "${col}" > 2147483647`
      )
    }

    this.schema.alterTable(this.tableName, (table) => {
      for (const col of COUNTER_COLS) {
        table.integer(col).defaultTo(0).alter()
      }
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      for (const col of COUNTER_COLS) {
        table.bigInteger(col).unsigned().defaultTo(0).alter()
      }
    })
  }
}
