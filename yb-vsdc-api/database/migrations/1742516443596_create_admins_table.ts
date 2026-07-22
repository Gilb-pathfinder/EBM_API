import { DEFAULT_LAST_REQUEST_DT } from '#helpers/index'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'admins'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').notNullable().primary().unique()
      table.string('email', 254).notNullable().unique()
      table.string('password').notNullable()
      table.string('full_name').notNullable()
      table.integer('tin').unsigned()
      table.string('serial_no')
      table.string('classification_last_req_dt').defaultTo(DEFAULT_LAST_REQUEST_DT)

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}