import { EbmImportItemStatus } from '#types/ebm/ebm_type'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'import_items'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary()

      table.string('user_id').notNullable().references('id').inTable('users')

      table.integer('tin').notNullable()
      table.string('branch_id').notNullable()
      table.string('task_code').notNullable()
      table.string('declaration_date').notNullable()
      table.integer('item_sequence').notNullable()
      table.string('hs_code').notNullable()
      table.string('item_name').notNullable()
      table.string('item_classification_code').notNullable()
      table.string('item_code').notNullable()
      table.enum('status_code', Object.values(EbmImportItemStatus)).notNullable()
      table.string('modifier_id').notNullable()
      table.string('modifier_name').notNullable()
      table.string('remark').nullable()
      table.string('ebm_api_version').notNullable()
      table.string('cis_api_version').notNullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
