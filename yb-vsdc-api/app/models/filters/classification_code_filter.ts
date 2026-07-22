
import { BaseModelFilter } from 'adonis-lucid-filter'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import ClassificationCode from '#models/classification_code'

export default class ClassificationCodeFilter extends BaseModelFilter {
  declare $query: ModelQueryBuilderContract<typeof ClassificationCode>

  // exact field searches
  name(value: string): void {
    this.$query.whereILike('name', `%${value}%`)
  }

  code(value: string): void {
    this.$query.whereILike('code', `%${value}%`)
  }

  // combined OR search — matches name OR code (used by the picker)
  q(value: string): void {
    this.$query.where(builder => {
      builder.whereILike('name', `%${value}%`).orWhereILike('code', `%${value}%`)
    })
  }

  taxType(value: string): void {
    this.$query.where('tax_type', value)
  }
}