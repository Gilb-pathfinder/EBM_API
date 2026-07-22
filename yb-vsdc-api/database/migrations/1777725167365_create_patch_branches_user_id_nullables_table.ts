import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    await this.db.rawQuery(`ALTER TABLE branches ALTER COLUMN user_id DROP NOT NULL`)
    await this.db.rawQuery(`ALTER TABLE branches ALTER COLUMN user_id DROP DEFAULT`)
  }

  async down() {
    await this.db.rawQuery(`UPDATE branches SET user_id = '' WHERE user_id IS NULL`)
    await this.db.rawQuery(`ALTER TABLE branches ALTER COLUMN user_id SET NOT NULL`)
  }
}