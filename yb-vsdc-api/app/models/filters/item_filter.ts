
import { BaseModelFilter } from 'adonis-lucid-filter'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import Item from '#models/item'

export default class ItemFilter extends BaseModelFilter {
  declare $query: ModelQueryBuilderContract<typeof Item>

  name(value: string): void {
    this.$query.whereILike('name', `%${value}%`)
  }

  q(value: string): void {
    this.$query.where((query) => {
      query
        .whereILike('name', `%${value}%`)
        .orWhereILike('code', `%${value}%`)
        .orWhereILike('barcode', `%${value}%`)
    })
  }

  codes(values: string[]): void {
    this.$query.whereIn('code', values)
  }
}