import { formatToEbmReqDt } from '#helpers/ebm_helper'
import { DEFAULT_LAST_REQUEST_DT } from '#helpers/index'
import { EbmYesOrNo } from '#types/ebm/ebm_service_type'
import { BaseSchema } from '@adonisjs/lucid/schema'
import { DateTime } from 'luxon'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').notNullable().primary().unique()
      table.string('email', 254).notNullable().unique()
      table.string('password').notNullable()

      table.string('full_name').unique()
      table.string('serial_no').unique()
      table.string('mrc').unique()
      table.string('tax_payer_name')
      table.integer('tin')
      table.string('phone_number').unique()
      table.string('phone_number_two').unique().nullable()
      table.string('province').nullable()
      table.string('district').nullable()
      table.string('sector').nullable()
      table.string('address').nullable()

      //last vsdc data
      table.bigInteger('last_purchase_invoice_no').unsigned().defaultTo(0)
      table.bigInteger('last_sale_receipt_no').unsigned().defaultTo(0)
      table.bigInteger('last_invoice_no').unsigned().defaultTo(0)
      table.bigInteger('last_sale_invoice_no').unsigned().defaultTo(0)
      table.bigInteger('last_training_invoice_no').unsigned().defaultTo(0)
      table.bigInteger('last_proforma_invoice_no').unsigned().defaultTo(0)
      table.bigInteger('last_copy_invoice_no').unsigned().defaultTo(0)
      table.string('last_item_code')
      table.bigInteger('last_stock_no').unsigned().defaultTo(0)
      table.bigInteger('last_import_task_code').unsigned().defaultTo(0)
      table.bigInteger('last_customer_no').unsigned().defaultTo(0)

      //branches
      table.string('branch_id')
      table.string('branch_name')
      table.enum('headquarter_yn', Object.values(EbmYesOrNo))
      table.string('business_activity')
      table.string('branch_open_date')
      table.string('manager_name')
      table.string('manager_tel')
      table.string('manager_email')

      //images
      table.json('image').nullable()
      table.string('image_link').nullable()

      //last result date time (time of initilization)
      table.string('init_last_req_dt').notNullable()
      table.string('item_last_req_dt').notNullable().defaultTo(DEFAULT_LAST_REQUEST_DT)
      table.string('import_last_req_dt').notNullable().defaultTo(DEFAULT_LAST_REQUEST_DT)
      table.string('purchase_last_req_dt').notNullable().defaultTo(DEFAULT_LAST_REQUEST_DT)
      table.string('classification_item_last_req_dt').notNullable().defaultTo(DEFAULT_LAST_REQUEST_DT)
      table.string('branch_last_req_dt').notNullable().defaultTo(DEFAULT_LAST_REQUEST_DT)
      table.string('notices_last_req_dt').notNullable().defaultTo(DEFAULT_LAST_REQUEST_DT)
      table.string('stock_last_req_dt').notNullable().defaultTo(DEFAULT_LAST_REQUEST_DT)

      //sdc data
      table.string('sdc_id').nullable()
      table.string('device_id').notNullable()

      //versions
      table.string('ebm_api_version').notNullable()
      table.string('cis_api_version').notNullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
