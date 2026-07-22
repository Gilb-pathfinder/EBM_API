import CatchEbmAndAllError from '#helpers/classes/catch_ebm_and_all_error'
import { EbmBranchService } from '#services/ebm/ebm_branch_service'
import { EbmStocksService } from '#services/ebm/ebm_stock_service'
import { ebmSelectionValidator } from '#validators/ebm_selection_validator'
import type { HttpContext } from '@adonisjs/core/http'

export default class EbmSelectionsController extends CatchEbmAndAllError {
  async selectBranchUsers({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(ebmSelectionValidator)
    const user = auth.user as any
    const service = new EbmBranchService(user)
    try {
      const options = {
        tin: payload.tin || user.tin,
        branchId: payload.branchId || user.branchId || '00',
        lastRequestDt: payload.lastRequestDt || '20180520000000',
      }
      return await service.selectBranchUsers(options)
    } catch (error) {
      return this.catchErrors(response, error)
    }
  }

  async selectBranchInsurances({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(ebmSelectionValidator)
    const user = auth.user as any
    const service = new EbmBranchService(user)
    try {
      const options = {
        tin: payload.tin || user.tin,
        branchId: payload.branchId || user.branchId || '00',
        lastRequestDt: payload.lastRequestDt || '20180520000000',
      }
      return await service.selectBranchInsurances(options)
    } catch (error) {
      return this.catchErrors(response, error)
    }
  }

  async selectStockItems({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(ebmSelectionValidator)
    const user = auth.user as any
    const service = new EbmStocksService(user)
    try {
      const options = {
        tin: payload.tin || user.tin,
        branchId: payload.branchId || user.branchId || '00',
        lastRequestDt: payload.lastRequestDt || '20180520000000',
      }
      return await service.selectStockItems(options)
    } catch (error) {
      return this.catchErrors(response, error)
    }
  }
}
