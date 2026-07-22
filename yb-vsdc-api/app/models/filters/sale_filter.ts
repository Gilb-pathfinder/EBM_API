import { BaseModelFilter } from 'adonis-lucid-filter'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import Sale from '#models/sale'

export default class SaleFilter extends BaseModelFilter {
  declare $query: ModelQueryBuilderContract<typeof Sale>

  id(value: number): void {
    this.$query.where('id', value)
  }

  invoiceNo(value: number) {
    this.$query.where('invoice_no', value)
  }

  ebmInternalData(value: string) {
    this.$query.where(`ebm_sale_data->>'intrlData' = ?`, [value])
  }

  ebmReceiptSignature(value: string) {
    this.$query.where(`ebm_sale_data->>'rcptSign' = ?`, [value])
  }
}
