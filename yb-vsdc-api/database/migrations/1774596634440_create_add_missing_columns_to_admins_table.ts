import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'admins'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('branch_id').defaultTo('00')
      table.string('device_id').nullable()
      table.string('tax_payer_name').nullable()
      table.string('mrc').nullable()
      table.string('sdc_id').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumns('branch_id', 'device_id', 'tax_payer_name', 'mrc', 'sdc_id')
    })
  }
}