import { EbmYesOrNo } from '#types/ebm/ebm_service_type'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'branches'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.integer('master_branch_id').nullable().references('id').inTable('branches')

      table.string('user_id').notNullable().references('id').inTable('users')

      table.string('branch_id', 2)
      table.string('tin').notNullable()
      table.string('branch_name').nullable() // bhfNm
      table.string('branch_status_code').nullable() // bhfSttsCd
      table.string('province_name').nullable() // prvncNm
      table.string('district_name').nullable() // dstrtNm
      table.string('sector_name').nullable() // sctrNm
      table.string('location_description').nullable() // locDesc
      table.string('manager_name').nullable() // mgrNm
      table.string('manager_phone').nullable() // mgrTelNo
      table.string('manager_email').nullable() // mgrEmail
      table.enum('is_headquarter', Object.values(EbmYesOrNo)) // hqYn

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
