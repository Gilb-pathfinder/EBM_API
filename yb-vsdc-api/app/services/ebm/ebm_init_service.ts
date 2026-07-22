import { EbmService } from '#services/ebm/ebm_service'
import { EbmEndpoint, InitEbmInfo, InitEbmOption } from '#types/ebm/ebm_service_type'
import { EbmApiResponseCode } from '#types/ebm/ebm_type'

export class EbmInitService extends EbmService {
  // Your code here

  async InitilizeDevice(options: InitEbmOption) {
    const body = this.convertInitilizeDeviceOptionToEbmProps(options)
    const result = await this.postEbmData<{ data: { info: InitEbmInfo } | null }>(
      EbmEndpoint.SelectInitInfo,
      body,
      { tin: options.tin, bhfId: options.branchId, dvcSrlNo: options.deviceSerialNo }
    )

    if (result.resultCd === EbmApiResponseCode.ServerSucceeded) {
      return { ...result, data: null }
    } else if (result.resultCd === EbmApiResponseCode.ServerDeviceInstalled) {
      const data = result.data ? this.formatInitDeviceResponse(result.data.info) : null
      return { ...result, data }
    }
    return Promise.reject(result)
  }

  private convertInitilizeDeviceOptionToEbmProps(options: InitEbmOption) {
    return JSON.stringify({ tin: options.tin, bhfId: options.branchId, dvcSrlNo: options.deviceSerialNo })
  }

  private formatInitDeviceResponse(data: InitEbmInfo) {
    return {
      branchId: data.bhfId,
      headquaterYn: data.hqYn,
      sdcId: data.sdcId,
      mrc: data.mrcNo,
      dvcId: data.dvcId,
      lastPurchaseNo: data.lastPchsInvcNo,
      lastReceiptNo: data.lastSaleInvcNo,
    }
  }
}

  

