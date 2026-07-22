import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'sales'

  async up() {
    await this.db.rawQuery(`
      DO $$ BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = '${this.tableName}' AND column_name = 'customer_phone'
        ) THEN
          ALTER TABLE "${this.tableName}" RENAME COLUMN "customer_phone" TO "customer_mobile_no";
        END IF;
      END $$
    `)
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.renameColumn('customer_mobile_no', 'customer_phone')
    })
  }
}
