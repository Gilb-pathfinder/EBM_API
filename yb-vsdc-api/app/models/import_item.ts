import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import { EbmImportItemStatus } from '#types/ebm/ebm_type'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import env from '#start/env'

export default class ImportItem extends BaseModel {
  static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  declare id: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare tin: number

  @column()
  declare branchId: string

  @column()
  declare taskCode: number

  @column()
  declare declarationDate: string

  @column()
  declare itemSequence: number

  @column()
  declare hsCode: string

  @column()
  declare itemClassificationCode: string

  @column()
  declare itemName: string

  @column()
  declare itemCode: string

  @column()
  declare statusCode: EbmImportItemStatus

  @column()
  declare modifierId: string

  @column()
  declare modifierName: string

  @column()
  declare remark: string | null

  @column()
  declare ebmApiVersion: string

  @column()
  declare cisApiVersion: string


  @column()
  declare userId: string

  //#region relationships
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  //#endregion

  //#region hooks
  @beforeCreate()
  static async setId(item: ImportItem) {
    item.id = crypto.randomUUID()
    item.cisApiVersion = env.get('EBM_CIS_VERSION')
    item.ebmApiVersion = env.get('EBM_API_VERSION')
  }
}
