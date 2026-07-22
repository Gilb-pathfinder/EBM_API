import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, beforeCreate, column, computed, hasMany } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import Branch from './branch.js'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Sale from './sale.js'
import Receipt from './receipt.js'
import { attachment } from '@jrmc/adonis-attachment'
import type { Attachment } from '@jrmc/adonis-attachment/types/attachment'
import Purchase from './purchase.js'
import Item from './item.js'
import Notice from './notice.js'
import ImportItem from './import_item.js'
import { EbmItemClassificationCode, EbmYesOrNo } from '#types/ebm/ebm_service_type'
import env from '#start/env'
import PurchaseList from './purchase_list.js'
import ImportItemList from './import_item_list.js'
import { generateItemCode } from '#helpers/ebm_helper'
import StockMaster from './stock_master.js'
import Stock from './stock.js'
import CashMovement from './cash_movement.js'

const AuthFinder = withAuthFinder(() => hash.use('argon'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  //#region proprties
  static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare fullName: string | null

  @column()
  declare serialNo: string

  @column()
  declare mrc: string

  @column()
  declare sdcId: string

  @column()
  declare taxPayerName: string

  @column()
  declare tin: number

  @column()
  declare phoneNumber: string

  @column()
  declare phoneNumberTwo?: string

  @column()
  declare province: string

  @column()
  declare district: string

  @column()
  declare sector: string

  @column()
  declare address: string

  @attachment({ folder: 'images/users', preComputeUrl: true })
  declare image: Attachment | null

  @column()
  declare imageLink?: string

  @column()
  declare lastSaleReceiptNo: number

  @column()
  declare lastInvoiceNo: number

  @column()
  declare lastSaleInvoiceNo: number

  @column()
  declare lastTrainingInvoiceNo: number

  @column()
  declare lastProformaInvoiceNo: number

  @column()
  declare lastCopyInvoiceNo: number

  @column()
  declare lastItemCode: string

  @column()
  declare lastPurchaseInvoiceNo: number

  @column()
  declare lastStockNo: number

  @column()
  declare lastImportTaskCode: number

  // F-46: Z Report tracking
  @column.dateTime()
  declare lastZReportDate: DateTime | null

  @column()
  declare lastZReportNo: number // Counter for Z reports issued

  @column()
  declare canIssueSales: boolean // F-46: Whether new sales are allowed (blocked after Z report)

  @column()
  declare branchId: string

  @column()
  declare branchName: string

  @column()
  declare initLastReqDt: string

  @column()
  declare itemLastReqDt: string

  @column()
  declare purchaseLastReqDt: string

  @column()
  declare classificationItemLastReqDt: string

  @column()
  declare branchLastReqDt: string

  @column()
  declare noticesLastReqDt: string

  @column()
  declare stockLastReqDt: string

  @column()
  declare importLastReqDt: string

  // F-48: EJ (Electronic Journal) report delta sync tracking
  @column()
  declare ejLastReqDt: string | null

  @column()
  declare lastCustomerNo: number

  @column()
  declare headquarterYn: EbmYesOrNo

  @column()
  declare businessActivity: string

  @column()
  declare branchOpenDate: string

  @column()
  declare managerName: string

  @column()
  declare managerTel: string

  @column()
  declare managerEmail: string

  @column()
  declare deviceId: string

  @column()
  declare isTrainingMode: boolean

  // Art. 7.30 — track last successful EBM communication; null = never connected
  @column.dateTime()
  declare ebmLastOnlineAt: DateTime | null

  // Signature chain — each receipt references the previous one for data integrity
  @column()
  declare lastRcptSign: string | null

  @column()
  declare lastIntrlData: string | null

  //versions
  @column()
  declare ebmApiVersion: string

  @column()
  declare cisApiVersion: string

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime
  //#endregion

  //#region computes
  @computed()
  get isMaster() {
    return this.branchId === '00'
  }

  @computed()
  get isBranch() {
    return this.branchId !== '00'
  }

  //#endregion

  //#region relationships
  @hasMany(() => Branch)
  declare branches: HasMany<typeof Branch>

  @hasMany(() => ImportItem)
  declare importItems: HasMany<typeof ImportItem>

  @hasMany(() => ImportItemList)
  declare importItemList: HasMany<typeof ImportItemList>

  @hasMany(() => Sale)
  declare sales: HasMany<typeof Sale>

  @hasMany(() => StockMaster)
  declare stockMasters: HasMany<typeof StockMaster>

  @hasMany(() => Stock)
  declare stockMovements: HasMany<typeof Stock>

  @hasMany(() => Item)
  declare items: HasMany<typeof Item>

  @hasMany(() => Notice)
  declare notices: HasMany<typeof Notice>

  @hasMany(() => Purchase)
  declare puchases: HasMany<typeof Purchase>

  @hasMany(() => PurchaseList)
  declare puchaseList: HasMany<typeof PurchaseList>

  @hasMany(() => Receipt)
  declare receipts: HasMany<typeof Receipt>

  @hasMany(() => CashMovement)
  declare cashMovements: HasMany<typeof CashMovement>

  //#endregion

  //#region methods
  static accessTokens = DbAccessTokensProvider.forModel(User, {
    table: 'auth_access_tokens',
  })

  //#endregion

  //#region hooks
  @beforeCreate()
  static async setId(user: User) {
    user.id = crypto.randomUUID()
    user.cisApiVersion = env.get('EBM_CIS_VERSION')
    user.ebmApiVersion = env.get('EBM_API_VERSION')
  }

  //#endregion

  //#region methods
  updateItemLastReqDt(value: string) {
    this.itemLastReqDt = value
    return this.save()
  }

  updateItemLastCode(value: string) {
    this.lastItemCode = value
    return this.save()
  }

  generateItemCode(itemCode: EbmItemClassificationCode) {
    return this.lastItemCode = generateItemCode({
      itemCode,
      lastItemCode: this?.lastItemCode,
    })
  }
  //#endregion
}
