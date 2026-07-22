import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import Branch from './branch.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { EbmYesOrNo } from '#types/ebm/ebm_service_type'
import hash from '@adonisjs/core/services/hash'

export default class BranchUser extends BaseModel {
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
  declare userId: string

  @column()
  declare userName: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare address?: string

  @column()
  declare contact?: string

  @column()
  declare authorityCode?: string

  @column()
  declare remark?: string

  @column()
  declare used: EbmYesOrNo

  @column()
  declare registrantName: string

  @column()
  declare registrantId: string

  @column()
  declare modifierName: string

  @column()
  declare modifierId: string

  @column()
  declare userBranchId: number

  //#region relationhips
  @belongsTo(() => Branch, {
    foreignKey: 'user_branch_id',
  })
  declare branch: BelongsTo<typeof Branch>
  //#endregion

  //#region hooks
  @beforeCreate()
  static async setId(user: BranchUser) {
    user.id = crypto.randomUUID()
    user.password = await hash.use('scrypt').make(user.password)
  }

  
  //#endregion
  //#region metods 
  static async getLastUserId(userBranchId: number, tin: number) {
    const usr = await BranchUser.query().where({userBranchId, tin}).orderBy('created_at', 'desc').first()
    if (!usr) return `${tin}_1`
    const splitId = usr.userId.split('_')
    return splitId[0] + '_' + (+splitId[1] + 1)
  }



//#endregion
}
