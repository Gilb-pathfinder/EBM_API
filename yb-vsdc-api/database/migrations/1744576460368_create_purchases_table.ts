import { EbmYesOrNo } from '#types/ebm/ebm_service_type'
import {
  EbmPaymentMethod,
  EbmReceiptType,
  EbmRegistrationType,
  EbmTransactionProgress,
  EbmTransactionType,
} from '#types/ebm/ebm_type'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'purchases'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary().unique()

      table.string('user_id').notNullable().references('id').inTable('users')

      table.integer('tin').notNullable()
      table.string('branch_id').notNullable()
      table.integer('invoice_no').notNullable()
      table.integer('original_invoice_no').notNullable()
      table.integer('supplier_tin').unsigned().nullable()
      table.string('supplier_branch_id').nullable()
      table.string('supplier_name').nullable()
      table.integer('supplier_invoice_no').unsigned().nullable()
      table.string('sppulier_sdc_id').nullable()

      table.enum('registration_type_code', Object.values(EbmRegistrationType)).notNullable()
      table.enum('purchase_type_code', Object.values(EbmTransactionType)).notNullable()
      table.enum('receipt_type_code', Object.values(EbmReceiptType)).notNullable()
      table.enum('payment_method', Object.values(EbmPaymentMethod)).notNullable()
      table.enum('purchase_status_code', Object.values(EbmTransactionProgress)).notNullable()
      table.string('supplier_sdc_id')

      table.dateTime('confirmation_date').nullable()
      table.date('purchase_date').nullable()
      table.dateTime('warehousing_date').nullable()
      table.dateTime('cancel_request_date').nullable()
      table.dateTime('canceled_date').nullable()
      table.datetime('refund_date').nullable()

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

      table.string('registrant_name').notNullable()
      table.string('registrant_id').notNullable()
      table.string('modifier_id').notNullable()
      table.string('modifier_name').notNullable()

      table.string('remark').nullable()
      table.jsonb('items').notNullable()
      
      table.string('ebm_api_version').notNullable()
      table.string('cis_api_version').notNullable()

      //last result date time (time of creation)
      table.string('result_dt').notNullable()

      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
