import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import { EbmYesOrNo } from '#types/ebm/ebm_service_type'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Branch from './branch.js'
import BranchCustomerFilter from './filters/branch_customer_filter.js'
import { compose } from '@adonisjs/core/helpers'
import { Filterable } from 'adonis-lucid-filter'

export default class BranchCustomer extends compose(BaseModel, Filterable) {
  static $filter = () => BranchCustomerFilter

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
  declare customerNo: number

  @column()
  declare customerPhoneNumber: string

  @column()
  declare customerTin: number

  @column()
  declare customerName: string

  @column()
  declare address?: string

  @column()
  declare contact?: string

  @column()
  declare email?: string

  @column()
  declare faxNumber?: string

  @column()
  declare used: EbmYesOrNo

  @column()
  declare remark?: string

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
  static async setId(user: BranchCustomer) {
    user.id = crypto.randomUUID()
  }

  //#endregion
}
