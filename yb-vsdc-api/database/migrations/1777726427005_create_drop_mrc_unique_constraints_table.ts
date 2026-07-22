import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    await this.db.rawQuery(`ALTER TABLE users DROP CONSTRAINT IF EXISTS users_mrc_unique`)
  }

  async down() {
    await this.db.rawQuery(`ALTER TABLE users ADD CONSTRAINT users_mrc_unique UNIQUE (mrc)`)
  }
}