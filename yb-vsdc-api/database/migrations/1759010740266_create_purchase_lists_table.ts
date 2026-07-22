import { EbmPaymentMethod, EbmReceiptType } from '#types/ebm/ebm_type'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'purchase_lists'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary().unique()

      table.string('user_id').notNullable().references('id').inTable('users')

      table.integer('tin').notNullable()
      table.string('branch_id').notNullable()
      table.integer('supplier_tin').unsigned().nullable()
      table.string('supplier_branch_id').nullable()
      table.string('supplier_name').nullable()
      table.string('supplier_invoice_no').nullable()
      table.string('sppulier_sdc_id').nullable()

      table.enum('receipt_type_code', Object.values(EbmReceiptType)).notNullable()
      table.enum('payment_method', Object.values(EbmPaymentMethod)).notNullable()
      table.string('supplier_sdc_id')
      table.string('purchase_order_code')
      table.string('supplier_mrc_no')
      
      table.boolean('is_confirmed').defaultTo(false)
      table.boolean('is_rejected').defaultTo(false)

      table.timestamp('confirmation_date').nullable()
      table.timestamp('stock_release_date').nullable()
      table.date('sale_date').notNullable()

      table.integer('total_items').notNullable()

      table.decimal('taxable_amount_a').notNullable()
      table.decimal('taxable_amount_b').notNullable()
      table.decimal('taxable_amount_c').notNullable()
      table.decimal('taxable_amount_d').notNullable()

      table.decimal('tax_rate_a').notNullable()
      table.decimal('tax_rate_b').notNullable()
      table.decimal('tax_rate_c').notNullable()
      table.decimal('tax_rate_d').notNullable()

      table.decimal('tax_amount_a').notNullable()
      table.decimal('tax_amount_b').notNullable()
      table.decimal('tax_amount_c').notNullable()
      table.decimal('tax_amount_d').notNullable()

      table.decimal('total_taxable_amount').notNullable()
      table.decimal('total_tax_amount').notNullable()
      table.decimal('total_amount').notNullable()

      table.string('remark').nullable()
      table.json('items').notNullable()
      table.string('ebm_api_version').notNullable()
      table.string('cis_api_version').notNullable()

      //last result date time (time of creation)
      table.string('result_dt').notNullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}