import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import { EbmYesOrNo } from '#types/ebm/ebm_service_type'
import {
  EbmCountryCode,
  EbmPackagingUnit,
  EbmProductType,
  EbmTaxType,
  EbmUnitOfQuantity,
} from '#types/ebm/ebm_type'
import { compose } from '@adonisjs/core/helpers'
import { Filterable } from 'adonis-lucid-filter'
import ItemFilter from './filters/item_filter.js'

export default class Item extends compose(BaseModel, Filterable) {
  static $filter = () => ItemFilter

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare code: string

  @column()
  declare classificationCode: string

  @column()
  declare typeCode: EbmProductType

  @column()
  declare name: string

  @column()
  declare standarName?: string

  @column()
  declare originalNationCode: EbmCountryCode

  @column()
  declare packagingUnitCode: EbmPackagingUnit

  @column()
  declare quantityUnitCode: EbmUnitOfQuantity

  @column()
  declare taxTypeCode: EbmTaxType

  @column()
  declare batchNo?: string

  @column()
  declare barcode?: string

  @column()
  declare defaultUnitPrice: number

  @column()
  declare groupPriceL1?: number

  @column()
  declare groupPriceL2?: number

  @column()
  declare groupPriceL3?: number

  @column()
  declare groupPriceL4?: number

  @column()
  declare groupPriceL5?: number

  @column()
  declare additinalInfo?: string

  @column()
  declare saftyQuantity?: number

  @column()
  declare insuranceApplicableYn: EbmYesOrNo

  @column()
  declare useYn: EbmYesOrNo

  @column()
  declare rraModYn: EbmYesOrNo

  @column()
  declare regristantName: string

  @column()
  declare regristrantId: string

  @column()
  declare modifierName: string

  @column()
  declare modifierId: string

  @column()
  declare cisProductId: string
  
  @column()
  declare userId: string

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  //#region relationships
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  //#endregion

  //#region hooks
  @beforeCreate()
  static async setId(item: Item) {
    item.id = crypto.randomUUID()
  }

  //#endregion
}
