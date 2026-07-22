import { EbmItemService } from '#services/ebm/ebm_item_service'
import { EbmApiResponseCode } from '#types/ebm/ebm_type'
import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class UserItemClassController {
  async select({ response, auth, request }: HttpContext) {
    const usr = auth.user as User
    const lastRequestDt = request.input('dt', '20180101000000')
    const branchId = request.param('branchId') || usr.branchId || '00'

    try {
      const res = await new EbmItemService().selectItemClass({
        tin: usr.tin,
        branchId,
        lastRequestDt,
      })

      if (res.resultCd === EbmApiResponseCode.ServerDeviceInstalled) {
        usr.initLastReqDt = res.resultDt
        await usr.save()
      }

      return res
    } catch (error) {
      console.error(error)
      return response.status(500).json({ error: 'Failed to fetch item classifications' })
    }
  }
}
