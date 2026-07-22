import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('ejLastReqDt').nullable().after('stockLastReqDt') // F-48: Last EJ fetch timestamp for delta sync
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('ejLastReqDt')
    })
  }
}
