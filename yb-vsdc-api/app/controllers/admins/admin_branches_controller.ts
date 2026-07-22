import Branch from '#models/branch'
import User from '#models/user'
import CatchEbmAndAllError from '#helpers/classes/catch_ebm_and_all_error'
import { EbmDeviceService } from '#services/ebm/ebm_device_service'
import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'

const listValidator = vine.compile(
  vine.object({
    page:    vine.number().optional(),
    perPage: vine.number().optional(),
    tin:     vine.string().optional(),
  })
)

const createValidator = vine.compile(
  vine.object({
    branchId:            vine.string().maxLength(2),
    tin:                 vine.string(),
    branchName:          vine.string().optional(),
    isHeadquarter:       vine.enum(['Y', 'N']).optional(),
    branchStatusCode:    vine.string().optional(),
    provinceName:        vine.string().optional(),
    districtName:        vine.string().optional(),
    sectorName:          vine.string().optional(),
    locationDescription: vine.string().optional(),
    managerName:         vine.string().optional(),
    managerPhone:        vine.string().optional(),
    managerEmail:        vine.string().optional(),
    userId:              vine.string().optional(),
  })
)

const updateValidator = vine.compile(
  vine.object({
    branchName:          vine.string().optional(),
    isHeadquarter:       vine.enum(['Y', 'N']).optional(),
    branchStatusCode:    vine.string().optional(),
    provinceName:        vine.string().optional(),
    districtName:        vine.string().optional(),
    sectorName:          vine.string().optional(),
    locationDescription: vine.string().optional(),
    managerName:         vine.string().optional(),
    managerPhone:        vine.string().optional(),
    managerEmail:        vine.string().optional(),
    userId:              vine.string().optional(),
  })
)

export default class AdminBranchesController extends CatchEbmAndAllError {
  async list({ request, response }: HttpContext) {
    try {
      const { page, perPage, tin } = await request.validateUsing(listValidator)
      const query = Branch.query().orderBy('tin').orderBy('branch_id')
      if (tin) query.where('tin', tin)
      return await query.paginate(page ?? 1, perPage ?? 50)
    } catch (error) {
      return this.catchErrors(response, error)
    }
  }

  async create({ request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(createValidator)
      return await Branch.create({
        branchId:            payload.branchId,
        tin:                 payload.tin,
        branchName:          payload.branchName          || null,
        isHeadquarter:       (payload.isHeadquarter ?? 'N') as any,
        branchStatusCode:    payload.branchStatusCode    || null,
        provinceName:        payload.provinceName        || null,
        districtName:        payload.districtName        || null,
        sectorName:          payload.sectorName          || null,
        locationDescription: payload.locationDescription || null,
        managerName:         payload.managerName         || null,
        managerPhone:        payload.managerPhone        || null,
        managerEmail:        payload.managerEmail        || null,
        userId:              payload.userId              || null,
      })
    } catch (error) {
      return this.catchErrors(response, error)
    }
  }

  async update({ request, response, params }: HttpContext) {
    try {
      const branch = await Branch.findOrFail(params.id)
      const payload = await request.validateUsing(updateValidator)
      branch.merge({
        ...payload,
        userId: payload.userId ?? branch.userId,
      } as any)
      await branch.save()

      // §2.4 — notify EBM of branch settings change (fire-and-forget)
      // Looks up the operator on this branch to supply device credentials
      User.query()
        .where('tin', branch.tin)
        .where('branch_id', branch.branchId)
        .first()
        .then(user => {
          if (!user) return
          return new EbmDeviceService().saveDeviceInfo({
            tin: user.tin,
            branchId: branch.branchId,
            deviceSerialNo: user.serialNo,
            mrcNo: user.mrc,
            sdcId: user.sdcId,
          })
        })
        .catch(err => console.warn('[saveDeviceInfo] branch update notify failed (non-critical):', err?.resultMsg ?? err))

      return branch
    } catch (error) {
      return this.catchErrors(response, error)
    }
  }

  async deleteOne({ response, params }: HttpContext) {
    try {
      const branch = await Branch.findOrFail(params.id)
      await branch.delete()
      return { message: 'Branch deleted', id: params.id }
    } catch (error) {
      return this.catchErrors(response, error)
    }
  }
}
