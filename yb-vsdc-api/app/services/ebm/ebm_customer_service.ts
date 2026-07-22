import { EbmEndpoint, EbmSelectCustomerRequest, EbmSelectCustomerResponse } from '#types/ebm/ebm_service_type'
import { EbmService } from './ebm_service.js'

export class EbmCustomerService extends EbmService {
  // Your code here
  async selectCustumer(options: EbmSelectCustomerRequest) {
    const body = this.convertselectCustumerOptionToEbmProps(options)
    return this.postEbmData<EbmSelectCustomerResponse>(EbmEndpoint.selectCustomer, body)
  }

  private convertselectCustumerOptionToEbmProps(options: EbmSelectCustomerRequest) {
    return JSON.stringify({
      tin: options.tin,
      bhfId: options.branchId,
      custmTin: options.customerTin
    })
  }
}
