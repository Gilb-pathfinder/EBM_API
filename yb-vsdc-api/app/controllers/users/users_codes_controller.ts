import ClassificationCodeAction from '#actions/classification_code_action'
import ClassificationCode from '#models/classification_code'
import User from '#models/user'
import { EbmCodeService } from '#services/ebm/ebm_code_service'
import { EbmApiResponseCode } from '#types/ebm/ebm_type'
import { listItemClassficationCodeValidator } from '#validators/ebm_item_validator'
import type { HttpContext } from '@adonisjs/core/http'

export default class UserCodesController {
  async select({ response, auth, request }: HttpContext) {
    const usr = auth.user as User
    const lastRequestDt = request.input('dt', '')
    const branchId = request.param('branchId')

    try {
      const res = await new EbmCodeService().selectCodes({
        tin: usr.tin,
        branchId,
        lastRequestDt,
      })

      if (res.resultCd == EbmApiResponseCode.ServerDeviceInstalled) {
        usr.initLastReqDt = res.resultDt
        await usr.save()
      }

      return res
    } catch (error) {
      console.error(error)

      return response.badRequest({ error })
    }
  }

  async item_classification_list({ response, auth, request }: HttpContext) {
    const { page, perPage, ...input } = await request.validateUsing(listItemClassficationCodeValidator)

    // return ClassificationCodeAction.search(name)
    return ClassificationCode.filter(input).paginate(page || 1, perPage || 10)
  }
}
