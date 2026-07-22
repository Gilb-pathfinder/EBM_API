import { EbmService } from '#services/ebm/ebm_service'
import { EbmEndpoint, SelectNoticesEbmOption, SelectNoticesEbmResponse } from '#types/ebm/ebm_service_type'
import { EbmDefaultResponse } from '#types/ebm/ebm_type'

export class EbmNoticeService extends EbmService {
  // Your code here

  async selectNotices(options: SelectNoticesEbmOption) {
    const body = this.convertselectNoticesOptionToEbmProps(options)
    const headers = { tin: options.tin, bhfId: options.branchId }
    return this.postEbmData<{ data: { noticeList: SelectNoticesEbmResponse[] } | null }>(
      EbmEndpoint.selectNotices,
      body,
      headers
    )
  }

  private convertselectNoticesOptionToEbmProps(options: SelectNoticesEbmOption) {
    return JSON.stringify({
      tin: String(options.tin || this.user?.tin),
      bhfId: String(options.branchId || this.user?.branchId || '00'),
      lastReqDt: options.lastRequestDt,
    })
  }
}
