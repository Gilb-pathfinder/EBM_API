import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, beforeCreate, column } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'

const AuthFinder = withAuthFinder(() => hash.use('argon'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class Admin extends compose(BaseModel, AuthFinder) {
  //#region proprties
  static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare fullName: string | null

  @column()
  declare taxPayerName: string | null

  @column()
  declare email: string

  @column()
  declare tin: number

  @column()
  declare serialNo: string

  @column()
  declare branchId: string

  @column()
  declare deviceId: string | null

  @column()
  declare mrc: string | null

  @column()
  declare sdcId: string | null

  @column()
  declare classificationLastReqDt: string

  @column({ serializeAs: null })
  declare password: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  //#endregion

  //#region methods
  static accessTokens = DbAccessTokensProvider.forModel(Admin, {
    expiresIn: '7 days',
    prefix: 'aat_',
    table: 'admin_access_tokens',
  })

  //#endregion

  //#region hooks
  @beforeCreate()
  static async setId(user: Admin) {
    user.id = crypto.randomUUID()
  }

  //#endregion
}
