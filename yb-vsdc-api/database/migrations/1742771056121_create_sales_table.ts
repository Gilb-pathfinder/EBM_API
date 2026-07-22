import { EbmYesOrNo } from '#types/ebm/ebm_service_type'
import { EbmPaymentMethod, EbmReceiptType, EbmTransactionProgress, EbmTransactionType } from '#types/ebm/ebm_type'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'sales'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').notNullable().primary().unique()
      
      table
      .string('user_id')
      .notNullable()
      .references('id')
      .inTable('users')

      table.integer('tin') // Taxpayer Identification Number (TIN)
      table.string('branch_id') // Branch Identifier
      table.integer('invoice_no') // Invoice Number
      table.integer('original_invoice_no') // Original Invoice Number
      table.string('customer_tin').nullable() // Customer TIN (optional)
      table.string('purchase_code', 6).nullable() // Purchase Code (optional)
      table.string('customer_name') // Customer Name
      table.enum('sale_type', Object.values(EbmTransactionType)) // Sale Type enum (adjust with actual values)
      table.enum('receipt_type', Object.values(EbmReceiptType)) // Receipt Type enum (adjust with actual values)
      table.string('invoice_type', 2) // Receipt Type enum (adjust with actual values)
      table.enum('payment_method', Object.values(EbmPaymentMethod)) // Payment Method enum (adjust with actual values)
      table.enum('sale_status', Object.values(EbmTransactionProgress)) // Sale Status enum
      table.timestamp('confirmation_date') // Confirmation Date
      table.date('sale_date') // Sale Date in YYYY-MM-DD format
      table.timestamp('stock_release_date').nullable() // Stock Release Date (optional)
      table.timestamp('cancel_request_date').nullable() // Cancel Request Date (optional)
      table.timestamp('canceled_date').nullable() // Canceled Date (optional)
      table.timestamp('refund_date').nullable() // Refund Date (optional)
      table.enum('refund_reason', Object.values(EbmTransactionProgress)).nullable() // Refund Reason (optional, enum)
      table.integer('total_items') // Total Items Sold
      table.decimal('taxable_amount_a', 15, 2) // Taxable Amount A
      table.decimal('taxable_amount_b', 15, 2) // Taxable Amount B
      table.decimal('taxable_amount_c', 15, 2) // Taxable Amount C
      table.decimal('taxable_amount_d', 15, 2) // Taxable Amount D
      table.decimal('tax_rate_a', 5, 2) // Tax Rate A
      table.decimal('tax_rate_b', 5, 2) // Tax Rate B
      table.decimal('tax_rate_c', 5, 2) // Tax Rate C
      table.decimal('tax_rate_d', 5, 2) // Tax Rate D
      table.decimal('tax_amount_a', 15, 2) // Tax Amount A
      table.decimal('tax_amount_b', 15, 2) // Tax Amount B
      table.decimal('tax_amount_c', 15, 2) // Tax Amount C
      table.decimal('tax_amount_d', 15, 2) // Tax Amount D
      table.decimal('total_taxable_amount', 15, 2) // Total Taxable Amount
      table.decimal('total_tax_amount', 15, 2) // Total Tax Amount
      table.decimal('total_amount', 15, 2) // Total Amount
      table.enum('items_received', Object.values(EbmYesOrNo)) // Purchaser Acceptance Yes or No
      table.text('remark').nullable() // Remark (optional)
      table.string('registrant_name') // Registrant Name
      table.string('registrant_id') // Registrant ID
      table.string('modifier_id') // Modifier ID
      table.string('modifier_name') // Modifier Name
      table.json('receipt') // Receipt (store as JSON for EbmReceipt structure)
      table.json('items') // items (store as JSON for EbmItem[])
      
      //ebm infos
      table.json('ebm_sale_data') // items (store as JSON for SaleEbmResponseData)
      table.string('ebm_api_version')

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