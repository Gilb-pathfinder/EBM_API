import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tax_configs'

  async up() {
    // Table doesn't exist, skip migration
    return
  }

  async down() {
    await this.db.rawQuery(`ALTER TABLE ${this.tableName} DROP COLUMN IF EXISTS tax_type`)
    await this.db.rawQuery(`ALTER TABLE ${this.tableName} DROP COLUMN IF EXISTS rate`)
    await this.db.rawQuery(`ALTER TABLE ${this.tableName} DROP COLUMN IF EXISTS divider`)
    await this.db.rawQuery(`ALTER TABLE ${this.tableName} DROP COLUMN IF EXISTS is_active`)
  }
}
