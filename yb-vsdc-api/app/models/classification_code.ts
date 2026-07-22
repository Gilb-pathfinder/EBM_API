import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { EbmYesOrNo } from '#types/ebm/ebm_service_type'
import { EbmTaxType } from '#types/ebm/ebm_type'
import ClassificationCodeFilter from './filters/classification_code_filter.js'
import { compose } from '@adonisjs/core/helpers'
import { Filterable } from 'adonis-lucid-filter'

export default class ClassificationCode extends compose(BaseModel, Filterable) {
  static $filter = () => ClassificationCodeFilter

  @column({ isPrimary: true })
  declare id: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare name: string

  @column()
  declare code: string

  @column()
  declare level: number

  @column()
  declare taxType: EbmTaxType | null

  @column()
  declare isMajorTarget: EbmYesOrNo | null

  @column()
  declare used: EbmYesOrNo
}