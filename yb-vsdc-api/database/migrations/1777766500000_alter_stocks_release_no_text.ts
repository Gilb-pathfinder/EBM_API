import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'stocks'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.text('stored_and_released_no').alter()
      table.text('original_stored_and_release_no').alter()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.bigInteger('stored_and_released_no').alter()
      table.bigInteger('original_stored_and_release_no').alter()
    })
  }
}
