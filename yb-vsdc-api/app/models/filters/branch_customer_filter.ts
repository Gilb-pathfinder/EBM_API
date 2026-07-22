
import { BaseModelFilter } from 'adonis-lucid-filter'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import BranchCustomer from '#models/branch_customer'

export default class BranchCustomerFilter extends BaseModelFilter {
  declare $query: ModelQueryBuilderContract<typeof BranchCustomer>

  name(value: string): void {
    console.log({value})
    this.$query.orWhereILike('customer_name', `%${value}%`).orWhereRaw('customer_tin::VARCHAR LIKE ?', [`${value}%`])
  }
}