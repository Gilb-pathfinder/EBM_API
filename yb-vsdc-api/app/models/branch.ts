import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import User from './user.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { EbmYesOrNo } from '#types/ebm/ebm_service_type'

export default class Branch extends BaseModel {
  //#region proprties
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare tin: string

  @column()
  declare branchId: string

  @column()
  declare masterBranchId: number | null

  @column()
  declare userId: string

  @column()
  declare branchName: string | null

  @column()
  declare branchStatusCode: string | null

  @column()
  declare provinceName: string | null

  @column()
  declare districtName: string | null

  @column()
  declare sectorName: string | null

  @column()
  declare locationDescription: string | null

  @column()
  declare managerName: string | null

  @column()
  declare managerPhone: string | null

  @column()
  declare managerEmail: string | null

  @column()
  declare isHeadquarter: EbmYesOrNo

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  //#endregion

  //#region relationhips
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => User, {
    foreignKey: 'user_master_id',
  })
  declare master: BelongsTo<typeof User>
  //#endregion

  //#region hooks

  //#endregion
}
