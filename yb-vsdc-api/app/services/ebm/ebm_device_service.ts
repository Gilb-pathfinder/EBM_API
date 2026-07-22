import { EbmService } from '#services/ebm/ebm_service'
import { EbmEndpoint, SaveDeviceInfoOption } from '#types/ebm/ebm_service_type'
import { EbmDefaultResponse } from '#types/ebm/ebm_type'

export class EbmDeviceService extends EbmService {
  /**
   * Notifies EBM when device-level info changes:
   * serial number, MRC, or SDC ID.
   * CIS Ref §2.4 / VSDC Ref §4.1 — must be called after any such change.
   * Fire-and-forget safe: EBM rejection here does not block local operations.
   */
  async saveDeviceInfo(options: SaveDeviceInfoOption): Promise<EbmDefaultResponse> {
    const body = JSON.stringify({
      tin:      String(options.tin),
      bhfId:    options.branchId,
      dvcSrlNo: options.deviceSerialNo,
      mrcNo:    options.mrcNo  ?? null,
      sdcId:    options.sdcId  ?? null,
    })
    return this.postEbmData<EbmDefaultResponse>(
      EbmEndpoint.saveDeviceInfo,
      body,
      { tin: options.tin, bhfId: options.branchId, dvcSrlNo: options.deviceSerialNo }
    )
  }
}
