import { EbmYesOrNo } from '#types/ebm/ebm_service_type'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'branch_insurances'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.integer('user_branch_id').notNullable().references('id').inTable('branches')

      table.integer('tin', 9).notNullable()
      table.string('branch_id', 2).notNullable()
      table.string('insurance_code', 10).notNullable()
      table.string('insurance_name', 100).notNullable()
      table.float('premium_rate').notNullable()
      table.enum('used', Object.values(EbmYesOrNo)).notNullable()
      table.string('registrant_name', 60).notNullable()
      table.string('registrant_id', 20).notNullable()
      table.string('modifier_name', 60).notNullable()
      table.string('modifier_id', 60).notNullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
