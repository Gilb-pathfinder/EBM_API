import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'stock_masters'

  async up() {
    await this.db.rawQuery(`
      ALTER TABLE ${this.tableName}
      ADD COLUMN IF NOT EXISTS tin varchar(20) NULL
    `)
  }

  async down() {
    await this.db.rawQuery(`
      ALTER TABLE ${this.tableName}
      DROP COLUMN IF EXISTS tin
    `)
  }
}