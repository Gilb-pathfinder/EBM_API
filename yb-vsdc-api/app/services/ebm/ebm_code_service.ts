import { EbmService } from '#services/ebm/ebm_service'
import { EbmEndpoint, SelectCodesEbmOption } from '#types/ebm/ebm_service_type'
import { EbmDefaultResponse } from '#types/ebm/ebm_type'

export class EbmCodeService extends EbmService {
  async selectCodes(options: SelectCodesEbmOption): Promise<EbmDefaultResponse> {    
    return this.selectEbmData<EbmDefaultResponse>(EbmEndpoint.selectCodes, options)
  }
}
