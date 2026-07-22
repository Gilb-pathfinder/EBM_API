import { EbmYesOrNo } from '#types/ebm/ebm_service_type'
import { EbmTaxType } from '#types/ebm/ebm_type'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'classification_codes'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.string('name').notNullable()
      table.string('code').notNullable()
      table.integer('level').unsigned().notNullable()
      table.enum('tax_type', Object.values(EbmTaxType)).nullable()
      table.enum('is_major_target', Object.values(EbmYesOrNo)).nullable()
      table.enum('used', Object.values(EbmYesOrNo))

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}