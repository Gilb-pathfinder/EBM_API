import { BaseSchema } from '@adonisjs/lucid/schema'

// No-op migration: tax_configs columns were already created by the original migration.
// This file exists only to satisfy the migration runner state.
export default class extends BaseSchema {
  protected tableName = 'tax_configs'

  async up() {}
  async down() {}
}
