import { EbmService } from '#services/ebm/ebm_service'
import {
  BranchCustomerInfo,
  BranchInsuranceInfo,
  BranchUsersInfo,
  EbmEndpoint,
  EbmSelectBranchInsurancesResponse,
  EbmSelectBranchUsersResponse,
  SelectBranchEbmOption,
} from '#types/ebm/ebm_service_type'
import { EbmDefaultResponse } from '#types/ebm/ebm_type'

export class EbmBranchService extends EbmService {
  // Your code here

  async selectBranches(options: SelectBranchEbmOption) {
    const body = this.convertSelectEbmDataOptionToEbmProps(options)
    return this.postEbmData<{ data: { bhfList: any[] } | null }>(EbmEndpoint.selectBranches, body)
  }

  async selectBranchUsers(options: SelectBranchEbmOption) {
    return this.selectEbmData<EbmSelectBranchUsersResponse>(EbmEndpoint.selectBranchUsers, options)
  }

  async selectBranchInsurances(options: SelectBranchEbmOption) {
    return this.selectEbmData<EbmSelectBranchInsurancesResponse>(EbmEndpoint.selectBranchInsurances, options)
  }

  async saveBranchCustomer(options: BranchCustomerInfo) {
    const body = this.convertSaveBranchCustomerOptionsToEbmProps(options)
    return this.postEbmData<EbmDefaultResponse>(EbmEndpoint.saveBranchCustomers, body)
  }

  async saveBranchUsers(options: BranchUsersInfo) {
    const body = this.convertSaveBranchUsersOptionsToEbmProps(options)
    return this.postEbmData<EbmDefaultResponse>(EbmEndpoint.saveBranchUsers, body)
  }

  async saveBranchInsurance(options: BranchInsuranceInfo) {
    const body = this.convertSaveBranchInsuranceOptionsToEbmProps(options)
    return this.postEbmData<EbmDefaultResponse>(EbmEndpoint.saveBranchInsurances, body)
  }

  private convertSaveBranchInsuranceOptionsToEbmProps(options: BranchInsuranceInfo) {
    return JSON.stringify({
      tin: String(options.tin || this.user?.tin),
      bhfId: String(options.branchId || this.user?.branchId || '00'),
      isrccCd: options.insuranceCode,
      isrccNm: options.insuranceName,
      isrcRt: options.premiumRate,
      useYn: options.used,
      regrNm: options.registrantName || this.user?.taxPayerName,
      regrId: String(options.registrantId || this.user?.tin),
      modrNm: options.modifierName || this.user?.taxPayerName,
      modrId: String(options.modifierId || this.user?.tin),
    })
  }

  private convertSaveBranchUsersOptionsToEbmProps(options: BranchUsersInfo) {
    return JSON.stringify({
      tin: String(options.tin || this.user?.tin),
      bhfId: String(options.branchId || this.user?.branchId || '00'),
      userId: options.userId,
      userNm: options.userName,
      pwd: options.password,
      adrs: options.address,
      cntc: options.contact,
      useYn: options.used,
      remark: options.remark,
      regrNm: options.registrantName || this.user?.taxPayerName,
      regrId: String(options.registrantId || this.user?.tin),
      modrNm: options.modifierName || this.user?.taxPayerName,
      modrId: String(options.modifierId || this.user?.tin),
    })
  }

  private convertSaveBranchCustomerOptionsToEbmProps(options: BranchCustomerInfo) {
    return JSON.stringify({
      tin: String(options.tin || this.user?.tin),
      bhfId: String(options.branchId || this.user?.branchId || '00'),
      custNo: options.customerNo,
      custTin: options.customerTin ? String(options.customerTin) : null,
      custNm: options.customerName,
      adrs: options.address,
      telNo: options.customerPhoneNumber,
      email: options.email,
      faxNo: options.faxNumber,
      useYn: options.used,
      remark: options.remark,
      regrNm: options.registrantName || this.user?.taxPayerName,
      regrId: String(options.registrantId || this.user?.tin),
      modrNm: options.modifierName || this.user?.taxPayerName,
      modrId: String(options.modifierId || this.user?.tin),
    })
  }
}
