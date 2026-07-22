import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'sales'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.date('export_date').nullable().after('sale_date') // F-32: Export date (when goods leave the country)
      table.string('export_document_ref', 50).nullable().after('export_date') // F-32: Export document reference (e.g., customs doc number, bill of lading)
      table.string('export_country_code', 2).nullable().after('export_document_ref') // F-32: ISO 3166-1 alpha-2 country code (e.g., US, TZ, UG)
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('export_date')
      table.dropColumn('export_document_ref')
      table.dropColumn('export_country_code')
    })
  }
}
