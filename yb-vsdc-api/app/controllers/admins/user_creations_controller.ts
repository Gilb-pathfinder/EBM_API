import User from '#models/user'
import {
  userCreationStoreValidator,
  userUpdateValidator,
} from '#validators/users/user_creation_validator'
import type { HttpContext } from '@adonisjs/core/http'
import { attachmentManager } from '@jrmc/adonis-attachment'
import CatchEbmAndAllError from '#helpers/classes/catch_ebm_and_all_error'
import UserAction from '#actions/user_action'
import { EbmInitService } from '#services/ebm/ebm_init_service'
import vine from '@vinejs/vine'

const userListValidator = vine.compile(
  vine.object({
    page: vine.number().optional(),
    perPage: vine.number().optional(),
    tin: vine.number().optional(),
    email: vine.string().optional(),
  })
)

const reprogramTinValidator = vine.compile(
  vine.object({
    currentTin: vine.number().positive().max(999_999_999),
    newTin:     vine.number().positive().max(999_999_999),
  })
)

export default class UserCreationsController extends CatchEbmAndAllError {
  async create({ request, response }: HttpContext) {
    const payload = await request.validateUsing(userCreationStoreValidator)
    
    try {
      return await UserAction.init(payload)
    } catch (error) {
      console.error(error)
      return this.catchErrors(response, error)
    }
  }

  // Art. 7.2 — TIN reprogramming (service mode): reset all counters and re-initialize with new TIN
  async reprogram_tin({ request, response }: HttpContext) {
    const payload = await request.validateUsing(reprogramTinValidator)

    try {
      const user = await User.query().where('tin', payload.currentTin).first()
      if (!user) return response.notFound({ resultCd: '404', resultMsg: `No device user found with TIN ${payload.currentTin}` })

      // Re-initialize with new TIN to get fresh MRC/SDC credentials from EBM
      const initResult = await new EbmInitService(user).InitilizeDevice({
        tin: payload.newTin,
        branchId: user.branchId,
        deviceSerialNo: user.serialNo,
      })

      // Apply new TIN
      user.tin = payload.newTin

      // Apply new EBM credentials if returned
      if (initResult.data) {
        user.mrc = initResult.data.mrc ?? user.mrc
        user.sdcId = initResult.data.sdcId ?? user.sdcId
        user.branchId = initResult.data.branchId ?? user.branchId
      }

      // Full counter reset (Art. 7.2 requires complete reset on TIN reprogramming)
      user.lastSaleInvoiceNo = 0
      user.lastSaleReceiptNo = 0
      user.lastTrainingInvoiceNo = 0
      user.lastProformaInvoiceNo = 0
      user.lastCopyInvoiceNo = 0
      user.lastPurchaseInvoiceNo = 0
      user.lastInvoiceNo = 0
      user.lastStockNo = 0
      user.lastItemCode = ''

      // Reset all EBM sync timestamps so data is re-fetched from scratch
      const resetDt = '20180101000000'
      user.initLastReqDt = resetDt
      user.itemLastReqDt = resetDt
      user.purchaseLastReqDt = resetDt
      user.stockLastReqDt = resetDt
      user.importLastReqDt = resetDt
      user.noticesLastReqDt = resetDt
      user.branchLastReqDt = resetDt
      user.classificationItemLastReqDt = resetDt

      await user.save()

      return { message: 'TIN reprogrammed successfully. All counters have been reset.', tin: user.tin }
    } catch (error) {
      return this.catchErrors(response, error)
    }
  }

  async deleteAll({ response }: HttpContext) {
    try {
      const users = await User.all()
      await Promise.all(users.map((u) => u.delete()))
      return { message: `Deleted ${users.length} user(s)` }
    } catch (error) {
      return this.catchErrors(response, error)
    }
  }

  async deleteOne({ request, response }: HttpContext) {
    try {
      const id = request.param('id')
      const user = await User.findOrFail(id)
      await user.delete()
      return { message: 'User deleted', id }
    } catch (error) {
      return this.catchErrors(response, error)
    }
  }

  async list({ request, response }: HttpContext) {
    try {
      const { page, perPage, tin, email } = await request.validateUsing(userListValidator)

      const query = User.query()
        .orderBy('created_at', 'desc')

      if (tin) query.where('tin', tin)
      if (email) query.whereLike('email', `%${email}%`)

      return await query
        .select(['id', 'email', 'full_name', 'tin', 'serial_no', 'mrc', 'sdc_id', 'branch_id', 'branch_name', 'tax_payer_name', 'phone_number', 'is_training_mode', 'created_at'])
        .paginate(page || 1, perPage || 20)
    } catch (error) {
      return this.catchErrors(response, error)
    }
  }

  async find({ request, response }: HttpContext) {
    try {
      const id = request.param('id')
      return await User.query()
        .where('id', id)
        .select(['id', 'email', 'full_name', 'tin', 'serial_no', 'mrc', 'sdc_id', 'branch_id', 'branch_name', 'tax_payer_name', 'phone_number', 'province', 'district', 'sector', 'address', 'last_sale_invoice_no', 'last_sale_receipt_no', 'last_item_code', 'is_training_mode', 'created_at'])
        .firstOrFail()
    } catch (error) {
      return this.catchErrors(response, error)
    }
  }

  async update({ request, response }: HttpContext) {
    const payload = await request.validateUsing(userUpdateValidator)
    try {
      const user = await User.query()
        .where('email', payload.email)
        .andWhere('tin', payload.tin)
        .firstOrFail()

      if (payload.image) {
        user.image = await attachmentManager.createFromFile(payload.image)
        user.imageLink = ''
      } else if (payload.imageLink) {
        user.imageLink = payload.imageLink
        user.image = null
      }

      if (payload.fullName) user.fullName = payload.fullName
      if (payload.password) user.password = payload.password
      if (payload.phoneNumber) user.phoneNumber = payload.phoneNumber
      if (payload.phoneNumberTwo !== undefined) user.phoneNumberTwo = payload.phoneNumberTwo
      if (payload.serialNo) user.serialNo = payload.serialNo
      if (payload.mrc) user.mrc = payload.mrc
      if (payload.branchId) user.branchId = payload.branchId
      if (payload.province) user.province = payload.province
      if (payload.district) user.district = payload.district
      if (payload.sector) user.sector = payload.sector
      if (payload.address) user.address = payload.address
      if (payload.taxPayerName) user.taxPayerName = payload.taxPayerName

      await user.save()

      return { message: 'User updated successfully', user: { id: user.id, email: user.email, tin: user.tin, fullName: user.fullName } }
    } catch (error) {
      return this.catchErrors(response, error)
    }
  }
}
