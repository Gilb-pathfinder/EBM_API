import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.timestamp('last_z_report_date').nullable().after('last_import_task_code') // F-46: Date/time of last Z report
      table.integer('last_z_report_no').defaultTo(0).after('last_z_report_date') // F-46: Counter for Z reports
      table.boolean('can_issue_sales').defaultTo(true).after('last_z_report_no') // F-46: Whether sales are allowed after Z report
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('last_z_report_date')
      table.dropColumn('last_z_report_no')
      table.dropColumn('can_issue_sales')
    })
  }
}
