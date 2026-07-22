import { EbmYesOrNo } from '#types/ebm/ebm_service_type'
import {
  EbmCountryCode,
  EbmPackagingUnit,
  EbmProductType,
  EbmTaxType,
  EbmUnitOfQuantity,
} from '#types/ebm/ebm_type'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'items'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary()

      table.string('user_id').notNullable().references('id').inTable('users')

      table.string('code').notNullable()
      table.string('classification_code').notNullable()
      table.enum('type_code', Object.values(EbmProductType)).notNullable()
      table.string('name').notNullable()
      table.string('standar_name').nullable()
      table.enum('original_nation_code', Object.values(EbmCountryCode)).notNullable()
      table.enum('packaging_unit_code', Object.values(EbmPackagingUnit)).notNullable()
      table.enum('quantity_unit_code', Object.values(EbmUnitOfQuantity)).notNullable()
      table.enum('tax_type_code', Object.values(EbmTaxType)).notNullable()
      table.string('batch_no').nullable()
      table.string('barcode').nullable()
      table.decimal('default_unit_price', 15, 2).notNullable()
      table.decimal('group_price_l_1', 15, 2).nullable()
      table.decimal('group_price_l_2', 15, 2).nullable()
      table.decimal('group_price_l_3', 15, 2).nullable()
      table.decimal('group_price_l_4', 15, 2).nullable()
      table.decimal('group_price_l_5', 15, 2).nullable()
      table.text('additinal_info').nullable()
      table.integer('safty_quantity').nullable()
      table.enum('insurance_applicable_yn', Object.values(EbmYesOrNo)).notNullable()
      table.enum('use_yn', Object.values(EbmYesOrNo)).notNullable()
      table.enum('rra_mod_yn', Object.values(EbmYesOrNo)).defaultTo(EbmYesOrNo.No)
      table.string('regristant_name').notNullable()
      table.string('regristrant_id').notNullable()
      table.string('modifier_name').notNullable()
      table.string('modifier_id').notNullable()
      table.string('cis_product_id').notNullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
