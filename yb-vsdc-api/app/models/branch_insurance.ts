import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import { EbmYesOrNo } from '#types/ebm/ebm_service_type'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class BranchInsurance extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare tin: number

  @column()
  declare branchId: string

  @column()
  declare insuranceCode: string

  @column()
  declare insuranceName: string

  @column()
  declare premiumRate: number

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
  @belongsTo(() => BranchInsurance, {
    foreignKey: 'user_branch_id',
  })
  declare branch: BelongsTo<typeof BranchInsurance>
  //#endregion

  //#region metods
  static async getLastInsuranceCode(userBranchId: number, tin: number) {
    const insurance = await BranchInsurance.query()
      .where({ userBranchId, tin })
      .orderBy('created_at', 'desc')
      .first()

    const prefix = 'ISRCC'
    const currentCode = insurance ? insurance.insuranceCode : prefix + '00'

    const numberPart = currentCode.replace(prefix, '')
    const currentNumber = parseInt(numberPart, 10)

    const nextNumber = currentNumber + 1
    
    return `${prefix}${nextNumber.toString().padStart(2, '0')}`
  }

  //#endregion
}
