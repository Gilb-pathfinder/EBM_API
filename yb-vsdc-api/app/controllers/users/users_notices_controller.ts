import User from '#models/user'
import { EbmNoticeService } from '#services/ebm/ebm_notice_service'
import { EbmApiResponseCode } from '#types/ebm/ebm_type'
import type { HttpContext } from '@adonisjs/core/http'

export default class UserNoticesController {
  async select({ response, auth, request }: HttpContext) {
    const user = auth.user as User
    const {page, perPage } = request.qs()

    try {
      const res = await new EbmNoticeService().selectNotices({
        tin: user.tin,
        branchId: user.branchId,
        lastRequestDt: user.noticesLastReqDt,
      })

      let noticeCount =  0

      if (
        res.resultCd == EbmApiResponseCode.ServerSucceeded &&
        res.data &&
        res.data.noticeList.length > 0
      ) {
        const notices = res.data.noticeList.map((notice) => {
          return {
            noticeNo: notice.noticeNo,
            title: notice.title,
            content: notice.cont,
            detailUrl: notice.dtlUrl,
            registrarName: notice.regrNm,
            registeredAt: notice.regDt,
            userId: user.id
          }
        })

        noticeCount = notices.length

        await user.related('notices').createMany(notices)

      }

      user.noticesLastReqDt = res.resultDt

      const [notices] = await Promise.all([
        user.related('notices').query().paginate(+page || 1, +perPage || 10),
        user.save()
      ])

      //TODO: add filter for notices
      return {notices, noticeCount}
    } catch (error) {
      console.error(error)

      return response.badRequest({ error })
    }
  }

  async selectNotices({ response, auth, request }: HttpContext) {
    try {
      const user = auth.user as User
      const lastRequestDt = request.input('dt', user.noticesLastReqDt || '20180101000000')
      const branchId = request.param('branchId') || user.branchId || '00'

      const res = await new EbmNoticeService().selectNotices({
        tin: user.tin,
        branchId,
        lastRequestDt,
      })

      if (res.resultCd === EbmApiResponseCode.ServerSucceeded) {
        user.noticesLastReqDt = res.resultDt
        await user.save()
      }

      return res
    } catch (error) {
      console.error(error)
      return response.status(500).json({
        error: 'Failed to fetch notices',
        detail: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
}
