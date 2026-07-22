import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tax_configs'

  async up() {
    await this.db.rawQuery(
      `CREATE TABLE IF NOT EXISTS "${this.tableName}" (
        "id" SERIAL PRIMARY KEY,
        "tax_type" VARCHAR(2) NOT NULL UNIQUE,
        "rate" REAL NOT NULL,
        "divider" REAL NOT NULL,
        "is_active" BOOLEAN DEFAULT TRUE,
        "created_at" TIMESTAMPTZ,
        "updated_at" TIMESTAMPTZ
      )`
    )
  }

  async down() {
    this.schema.dropTableIfExists(this.tableName)
  }
}