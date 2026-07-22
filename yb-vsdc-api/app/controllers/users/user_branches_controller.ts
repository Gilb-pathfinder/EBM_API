import BranchCustomer from '#models/branch_customer'
import User from '#models/user'
import { EbmBranchService } from '#services/ebm/ebm_branch_service'
import {
  BranchCustomerInfo,
  BranchInsuranceInfo,
  BranchUsersInfo,
  EbmYesOrNo,
} from '#types/ebm/ebm_service_type'
import { EbmApiResponseCode } from '#types/ebm/ebm_type'
import {
  saveBranchCustomerValidator,
  saveBranchInsuranceValidator,
  saveBranchUserValidator,
  updateBranchCustomerValidator,
  updateBranchUserValidator,
} from '#validators/users/user_branch_validator'
import type { HttpContext } from '@adonisjs/core/http'
import string from '@adonisjs/core/helpers/string'
import CatchEbmAndAllError from '#helpers/classes/catch_ebm_and_all_error'
import BranchUser from '#models/branch_user'
import BranchInsurance from '#models/branch_insurance'
import { padCustomerNoToNineDigits } from '#helpers/ebm_helper'
import { EbmCustomerService } from '#services/ebm/ebm_customer_service'

export default class UserBranchesController extends CatchEbmAndAllError {
  private async ensureBranch(user: User) {
    const branch = await user.related('branches').query().where('branch_id', user.branchId).first()
    if (!branch) {
      return user.related('branches').create({
        tin: user.tin,
        branchId: user.branchId,
        branchName: user.branchName || null,
        userId: String(user.id),
        isHeadquarter: user.isMaster ? EbmYesOrNo.Yes : EbmYesOrNo.No,
      })
    }
    return branch
  }

  async list({ request, response, auth }: HttpContext) {
    const { page, perPage } = request.qs()

    try {
      const user = auth.user as User

      const ebmData = {
        tin: user.tin,
        branchId: user.branchId,
        lastRequestDt: user.branchLastReqDt,
      }

      const result = await new EbmBranchService().selectBranches(ebmData)

      let branchCount = 0
      if (
        result.resultCd === EbmApiResponseCode.ServerSucceeded &&
        result.data &&
        result.data.bhfList.length > 0
      ) {
        
        const newBranches = result.data.bhfList.map((branch) => {
          return {
            tin: branch.tin,
            branchName: branch.bhfNm,
            branchStatusCode: branch.bhfSttsCd,
            provinceName: branch.prvncNm,
            districtName: branch.dstrtNm,
            sectorName: branch.sctrNm,
            locationDescription: branch.locDesc,
            managerName: branch.mgrNm,
            managerPhone: branch.mgrTelNo,
            managerEmail: branch.mgrEmail,
            isHeadquarter: branch.hqYn,
            branchId: user.branchId,
            userId: user.id,
          }
        })

        user.branchLastReqDt = result.resultDt
        branchCount = newBranches.length

        
        await Promise.all([
          user.related('branches').updateOrCreateMany(newBranches, 'tin'),
          user.save(),
        ])
      } else if (result.resultCd === EbmApiResponseCode.NoSearchResult) {
        user.branchLastReqDt = result.resultDt
      } else {
        //FIXME: throw error when items caanot be listed!!
        // throw result
      }
      
      console.log({branchCount})
      const branches = await user
        .related('branches')
        .query()
        .orderBy('created_at', 'asc')
        .orderBy('branch_name', 'desc')
        .paginate(page || 1, perPage || 10)

      return { branches, branchCount }
    } catch (error) {
      this.catchErrors(response, error)
    }
  }

  async find({ request, response, auth }: HttpContext) {
    try {
      const branchId = request.param('branchId')
      const user = auth.user as User
      // const payload = await userBranchFindValidator.validate(request.qs())

      const branch = await user
        .related('branches')
        .query()
        .where('branch_id', branchId || -1)
        .firstOrFail()
      return [branch]
      // return await new EbmBranchService().selectBranches({
      //   tin: user.tin,
      //   branchId: branch.branchId,
      //   lastReqDt: payload.dt,
      // })
    } catch (error) {
      this.catchErrors(response, error)
    }
  }

  async selectBranches({ response, auth, request }: HttpContext) {
    try {
      const user = auth.user as User
      const lastRequestDt = request.input('dt', user.branchLastReqDt || '20180101000000')
      const branchId = request.param('branchId') || user.branchId || '00'

      const res = await new EbmBranchService().selectBranches({
        tin: user.tin,
        branchId,
        lastRequestDt,
      })

      if (res.resultCd === EbmApiResponseCode.ServerSucceeded) {
        user.branchLastReqDt = res.resultDt
        await user.save()
      }

      return res
    } catch (error) {
      console.error(error)
      return response.status(500).json({
        error: 'Failed to fetch branches',
        detail: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  async save_branch_customer({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(saveBranchCustomerValidator)

    try {
      const user = auth.user as User
      const branch = await this.ensureBranch(user)

      const customerNo = (user.lastCustomerNo += 1)

      const customerData: BranchCustomerInfo = {
        ...payload,
        // FIXME: ask for customer no to rra
        customerNo: padCustomerNoToNineDigits(customerNo),
        registrantId: user.tin.toString(),
        registrantName: user.taxPayerName,
        modifierId: user.tin.toString(),
        modifierName: user.taxPayerName,
        tin: user.tin,
      }

      const res = await new EbmBranchService().saveBranchCustomer(customerData)

      if (res.resultCd === EbmApiResponseCode.ServerSucceeded) {
        const [customer] = await Promise.all([
          await BranchCustomer.create({
            ...customerData,
            userBranchId: branch.id,
            customerNo,
          }),
          user.save(),
        ])

        return customer
      }

      return response.badRequest(res)
    } catch (error) {
      if (error?.cause?.code === 'ECONNREFUSED') {
        return response.serviceUnavailable({ resultMsg: 'EBM server is not connected!' })
      }

      console.error(error)
      return response.badRequest(error)
    }
  }

  async update_branch_customer({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(updateBranchCustomerValidator)

    try {
      const user = auth.user as User
      const branch = await this.ensureBranch(user)

      const customer = await BranchCustomer.query()
        .where({ id: payload.id, userBranchId: branch.id })
        .firstOrFail()

      const customerData: BranchCustomerInfo = {
        ...payload,
        customerNo: padCustomerNoToNineDigits(customer.customerNo),
        registrantId: customer.registrantId,
        registrantName: customer.registrantName,
        modifierId: user.tin.toString(),
        modifierName: user.taxPayerName,
        tin: user.tin,
      }

      const res = await new EbmBranchService().saveBranchCustomer(customerData)

      if (res.resultCd === EbmApiResponseCode.ServerSucceeded) {
        customer.merge({
          ...customerData,
          customerNo: customer.customerNo,
        })
        await customer.save()
        return customer
      }

      return response.badRequest(res)
    } catch (error) {
      return this.catchErrors(response, error)
    }
  }

  async delete_branch_customer({ request, response, auth }: HttpContext) {
    try {
      const user = auth.user as User
      const branch = await this.ensureBranch(user)

      const customer = await BranchCustomer.query()
        .where({ id: request.param('id'), userBranchId: branch.id })
        .firstOrFail()

      await customer.delete()
      return { message: 'Customer deleted successfully' }
    } catch (error) {
      return this.catchErrors(response, error)
    }
  }

  async list_branch_customer({ request, response, auth }: HttpContext) {
    const { page, perPage, ...input } = request.qs()

    try {
      const user = auth.user as User
      const branch = await this.ensureBranch(user)

      return await BranchCustomer.filter(input)
        .where({ branchId: user.branchId, userBranchId: branch.id })
        .paginate(page || 1, perPage || 20)
    } catch (error) {
      if (error?.cause?.code === 'ECONNREFUSED') {
        return response.serviceUnavailable({ resultMsg: 'EBM server is not connected!' })
      }

      console.error(error)
      return response.badRequest(error)
    }
  }

  async search_branch_customer({ request, response, auth }: HttpContext) {
    const { page, perPage, ...input } = request.qs()

    try {
      const user = auth.user as User
      const branch = await this.ensureBranch(user)

      return await BranchCustomer.filter(input)
        .where({ branchId: user.branchId, userBranchId: branch.id })
        .paginate(page || 1, perPage || 20)
    } catch (error) {
      if (error?.cause?.code === 'ECONNREFUSED') {
        return response.serviceUnavailable({ resultMsg: 'EBM server is not connected!' })
      }

      console.error(error)
      return response.badRequest(error)
    }
  }

  async sync_branch_customer({ request, response, auth }: HttpContext) {
    try {
      const user = auth.user as User

      if (user.isTrainingMode) {
        return response.forbidden({ error: 'Customer TIN sync is disabled in Training Mode. Disable training mode before syncing live customer data.' })
      }

      const ebmData = {
        tin: user.tin,
        branchId: user.branchId,
        customerTin: request.input('tin') || -1,
      }

      const result = await new EbmCustomerService().selectCustumer(ebmData)

      let customersCount = 0

      if (
        result.resultCd === EbmApiResponseCode.ServerSucceeded &&
        result.data &&
        result.data.custList.length > 0
      ) {
        const branch = await this.ensureBranch(user)

        const customers = result.data.custList.map((customer) => {
          user.lastCustomerNo++

          return {
            address: customer.locDesc,
            branchId: user.branchId,
            contact: '',
            customerName: customer.taxprNm,
            customerTin: +customer.tin,
            email: '',
            faxNumber: '',
            modifierId: user.tin.toString(),
            customerNo: user.lastCustomerNo,
            customerPhoneNumber: '',
            modifierName: user.taxPayerName,
            registrantId: user.id.toString(),
            registrantName: user.taxPayerName,
            tin: user.tin,
            used: EbmYesOrNo.Yes,
            remark: '',
            userBranchId: branch.id,
          }
        })

        const [customersAddedList] = await Promise.all([
          BranchCustomer.updateOrCreateMany('customerTin', customers),
          user.save(),
        ])

        customersCount = customersAddedList.length

        if (customersAddedList.length <= 0) return { customersCount }

        const customersData: BranchCustomerInfo[] = customersAddedList.map((customer) => {
          return {
            tin: user.tin,
            branchId: user.branchId,
            customerPhoneNumber: customer.customerPhoneNumber,
            customerTin: customer.customerTin,
            customerName: customer.customerName,
            address: customer.address,
            contact: customer.contact,
            email: customer.email,
            faxNumber: customer.faxNumber,
            used: customer.used,
            remark: customer.remark,
            registrantName: customer.registrantName,
            registrantId: customer.registrantId,
            modifierName: customer.modifierName,
            modifierId: customer.id,
            customerNo: padCustomerNoToNineDigits(customer.customerNo),
          }
        })

        for (const customerData of customersData) {
          await new EbmBranchService().saveBranchCustomer(customerData)
        }
      }

      return { customersCount }
    } catch (error) {
      if (error?.cause?.code === 'ECONNREFUSED') {
        return response.serviceUnavailable({ resultMsg: 'EBM server is not connected!' })
      }

      console.error(error)
      return response.badRequest(error)
    }
  }

  async save_branch_user({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(saveBranchUserValidator)

    try {
      const user = auth.user as User

      const branch = await this.ensureBranch(user)

      const branchUserData: BranchUsersInfo = {
        ...payload,
        modifierId: user.tin.toString(),
        modifierName: user.taxPayerName,
        password: string.generateRandom(16),
        registrantId: user.tin.toString(),
        registrantName: user.taxPayerName,
        tin: user.tin,
        used: EbmYesOrNo.Yes,
        userName: payload.userName,
        userId: await BranchUser.getLastUserId(branch.id, user.tin),
      }

      const res = await new EbmBranchService().saveBranchUsers(branchUserData)

      if (res.resultCd === EbmApiResponseCode.ServerSucceeded) {
        return await BranchUser.create({
          ...branchUserData,
          userBranchId: branch.id,
        })
      }

      return response.badRequest(res)
    } catch (error) {
      return this.catchErrors(response, error)
    }
  }

  async update_branch_user({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(updateBranchUserValidator)

    try {
      const user = auth.user as User
      const branch = await this.ensureBranch(user)

      const branchUser = await BranchUser.query()
        .where({ id: payload.id, userBranchId: branch.id })
        .firstOrFail()

      const branchUserData: BranchUsersInfo = {
        ...payload,
        modifierId: user.tin.toString(),
        modifierName: user.taxPayerName,
        password: branchUser.password, // Keep existing password
        registrantId: branchUser.registrantId,
        registrantName: branchUser.registrantName,
        tin: user.tin,
        used: payload.used,
        userName: payload.userName,
        userId: branchUser.userId,
      }

      const res = await new EbmBranchService().saveBranchUsers(branchUserData)

      if (res.resultCd === EbmApiResponseCode.ServerSucceeded) {
        branchUser.merge(payload)
        await branchUser.save()
        return branchUser
      }

      return response.badRequest(res)
    } catch (error) {
      return this.catchErrors(response, error)
    }
  }

  async delete_branch_user({ request, response, auth }: HttpContext) {
    try {
      const user = auth.user as User
      const branch = await this.ensureBranch(user)

      const branchUser = await BranchUser.query()
        .where({ id: request.param('id'), userBranchId: branch.id })
        .firstOrFail()

      await branchUser.delete()
      return { message: 'Branch user deleted successfully' }
    } catch (error) {
      return this.catchErrors(response, error)
    }
  }

  async save_branch_insurance({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(saveBranchInsuranceValidator)

    try {
      const user = auth.user as User

      const branch = await this.ensureBranch(user)

      const branchInsuranceData: BranchInsuranceInfo = {
        ...payload,
        modifierId: user.tin.toString(),
        modifierName: user.taxPayerName,
        registrantId: user.tin.toString(),
        registrantName: user.taxPayerName,
        tin: user.tin,
        used: EbmYesOrNo.Yes,
        insuranceCode: await BranchInsurance.getLastInsuranceCode(branch.id, user.tin),
      }

      const res = await new EbmBranchService().saveBranchInsurance(branchInsuranceData)

      if (res.resultCd === EbmApiResponseCode.ServerSucceeded) {
        return await BranchInsurance.create({
          ...branchInsuranceData,
          userBranchId: branch.id,
        })
      }

      return response.badRequest(res)
    } catch (error) {
      return this.catchErrors(response, error)
    }
  }
  async list_branch_user({ request, response, auth }: HttpContext) {
    const { page, perPage } = request.qs()
    try {
      const user = auth.user as User
      const branch = await this.ensureBranch(user)
      return await BranchUser.query()
        .where('user_branch_id', branch.id)
        .paginate(page || 1, perPage || 20)
    } catch (error) {
      return this.catchErrors(response, error)
    }
  }

  async list_branch_insurance({ request, response, auth }: HttpContext) {
    const { page, perPage } = request.qs()
    try {
      const user = auth.user as User
      const branch = await this.ensureBranch(user)
      return await BranchInsurance.query()
        .where('user_branch_id', branch.id)
        .paginate(page || 1, perPage || 20)
    } catch (error) {
      return this.catchErrors(response, error)
    }
  }
}
