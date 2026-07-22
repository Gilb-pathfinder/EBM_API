import { EbmService } from '#services/ebm/ebm_service'
import {
  EbmEndpoint,
  EbmPurchaseSave,
  EbmYesOrNo,
  SaleEbmResponseData,
  SaveCopyEbmOptions,
  SaveRefundEbmOptions,
  SaveSaleEbmOptions,
  SaveTrainingEbmOptions,
  EbmSelectRequest,
  TrnsPurchaseSalesRequestResponse,
} from '#types/ebm/ebm_service_type'
import { EbmDefaultResponse } from '#types/ebm/ebm_type'
import User from '#models/user'

export class EbmTransactionService extends EbmService {
  constructor(user?: User) {
    super(user)
  }

  async SaveSale(options: SaveSaleEbmOptions) {
    console.log('invoice:sale', options.invoiceNo)

    const body = this.convertSaleOptionToEbmProps(options)
    const headers = {
      tin: options.tin,
      bhfId: options.branchId,
    }
    return this.postEbmData<EbmDefaultResponse>(EbmEndpoint.saveSales, body, headers)
  }

  async SaveRefund(options: SaveRefundEbmOptions) {
    console.log('invoice:refund', options.invoiceNo)

    const body = this.convertSaleOptionToEbmProps(options as SaveSaleEbmOptions)
    const headers = {
      tin: options.tin,
      bhfId: options.branchId,
    }
    return this.postEbmData<EbmDefaultResponse>(EbmEndpoint.saveSales, body, headers)
  }

  async SaveCopy(
    options: SaveCopyEbmOptions
  ): Promise<EbmDefaultResponse & { data: SaleEbmResponseData }> {
    console.log('invoice:copy', options.invoiceNo)

    const body = this.convertSaleOptionToEbmProps(options as SaveSaleEbmOptions)
    const headers = {
      tin: options.tin,
      bhfId: options.branchId,
    }
    return this.postEbmData<EbmDefaultResponse & { data: SaleEbmResponseData }>(
      EbmEndpoint.saveSales,
      body,
      headers
    )
  }

  async SaveTraining(options: SaveTrainingEbmOptions) {
    console.log('invoice:training', options.invoiceNo)
    const body = this.convertSaleOptionToEbmProps(options)
    const headers = {
      tin: options.tin,
      bhfId: options.branchId,
    }
    return this.postEbmData<EbmDefaultResponse>(EbmEndpoint.saveSales, body, headers)
  }

  async SavePurchase(options: EbmPurchaseSave) {
    console.log('invoice:purchase', options.invoiceNo)

    const body = this.convertPurchaseOptionToEbmProps(options)
    const headers = {
      tin: options.tin,
      bhfId: options.branchId,
    }
    return this.postEbmData<EbmDefaultResponse>(EbmEndpoint.savePurchases, body, headers)
  }

  async selectTrnsPurchaseSales(options: EbmSelectRequest) {
    return this.selectEbmData<TrnsPurchaseSalesRequestResponse>(
      EbmEndpoint.selectTrnsPurchaseSales,
      options
    )
  }

  private convertPurchaseOptionToEbmProps(option: EbmPurchaseSave) {
    const itemList = option.items.map((item) => {
      return {
        itemSeq: item.sequenceNo,
        itemCd: item.code,
        itemClsCd: item.classificationCode,
        itemNm: item.name,
        bcd: item.barcode,
        spplrItemClsCd: item.supplierItemClassificationCode,
        spplrItemCd: item.supplierItemCode,
        spplrItemNm: item.supplierItemName,
        pkgUnitCd: item.packageUnit,
        pkg: item.packageNo,
        qtyUnitCd: item.quantityUnit,
        qty: item.quantity,
        prc: item.price,
        splyAmt: item.supplyPrice,
        dcRt: item.discountRate,
        dcAmt: item.discountAmount,
        taxblAmt: item.taxableAmount,
        taxTyCd: item.taxationType,
        taxAmt: item.taxAmount,
        totAmt: item.totalAmount,
        itemExprDt: item.expirationDate?.replaceAll('-', ''),
      }
    })

    return JSON.stringify({
      tin: String(option.tin || this.user?.tin),
      bhfId: String(option.branchId || this.user?.branchId || '00'),
      invcNo: option.invoiceNo,
      orgInvcNo: option.originalInvoiceNo,
      spplrTin: option.supplierTin ? String(option.supplierTin) : null,
      spplrBhfId: option.supplierBranchId ? String(option.supplierBranchId) : null,
      spplrInvcNo: option.supplierInvoiceNo || null,
      spplrNm: option.supplierName || null,
      spplrSdcId: option.supplierSdcId || null,
      prcOrdCd: option.prcOrdCd || null,
      regTyCd: option.registrationTypeCode,
      pchsTyCd: option.purchaseTypeCode,
      rcptTyCd: option.receiptTypeCode,
      pmtTyCd: option.paymentMethod,
      pchsSttsCd: option.purchaseStatusCode,
      cfmDt: option.confirmationDate,
      pchsDt: option.purchaseDate,
      wrhsDt: option.warehousingDate || null,
      cnclReqDt: option.cancelRequestDate || null,
      cnclDt: option.canceledDate || null,
      rfdDt: option.refundDate || null,
      totItemCnt: option.totalItems,
      taxblAmtA: option.taxableAmountA,
      taxblAmtB: option.taxableAmountB,
      taxblAmtC: option.taxableAmountC,
      taxblAmtD: option.taxableAmountD,
      taxRtA: option.taxRateA,
      taxRtB: option.taxRateB,
      taxRtC: option.taxRateC,
      taxRtD: option.taxRateD,
      taxAmtA: option.taxAmountA,
      taxAmtB: option.taxAmountB,
      taxAmtC: option.taxAmountC,
      taxAmtD: option.taxAmountD,
      totTaxblAmt: option.totalTaxableAmount,
      totTaxAmt: option.totalTaxAmount,
      totAmt: option.totalAmount,
      remark: option.remark,
      regrNm: option.registrantName || this.user?.taxPayerName,
      regrId: String(option.registrantId || this.user?.tin),
      modrNm: option.modifierName || this.user?.taxPayerName,
      modrId: String(option.modifierId || this.user?.tin),
      itemList,
    })
  }

  private convertSaleOptionToEbmProps(options: SaveSaleEbmOptions) {
    const receipt = {
      custTin: options.receipt.customerTin ? String(options.receipt.customerTin) : null,
      custMblNo: options.receipt.customerMobileNo,
      rptNo: options.receipt.reportNo,
      trdeNm: options.receipt.tradeName || null,
      adrs: options.receipt.address || null,
      topMsg: options.receipt.topMessage || null,
      btmMsg: options.receipt.bottomMessage || null,
      prchrAcptcYn: options.receipt.itemReceived,
    }

    const itemList = options.items.map((item) => {
      return {
        itemSeq: item.sequenceNo,
        itemCd: item.code,
        itemClsCd: item.classificationCode,
        itemNm: item.name,
        bcd: item.barcode,
        pkgUnitCd: item.packageUnit,
        pkg: item.packageNo,
        qtyUnitCd: item.quantityUnit,
        qty: item.quantity,
        prc: item.price,
        splyAmt: item.supplyPrice,
        dcRt: item.discountRate,
        dcAmt: item.discountAmount,
        isrccCd: item.insuranceCode,
        isrccNm: item.insuranceName,
        isrcRt: item.insuranceRate,
        isrcAmt: item.insuranceAmount,
        taxTyCd: item.taxationType,
        taxblAmt: item.taxableAmount,
        taxAmt: item.taxAmount,
        totAmt: item.totalAmount,
        itemExprDt: item.expirationDate?.replaceAll('-', ''),
      }
    })

    return JSON.stringify({
      tin: String(options.tin || this.user?.tin),
      bhfId: String(options.branchId || this.user?.branchId || '00'),
      invcNo: options.invoiceNo,
      orgInvcNo: options.originalInvoiceNo || 0,
      custTin: options.customerTin ? String(options.customerTin) : null,
      prcOrdCd: options.purchaseCode,
      custNm: options.customerName,
      salesTyCd: options.saleType,
      rcptTyCd: options.receiptType,
      pmtTyCd: options.paymentMethod,
      salesSttsCd: options.saleStatus,
      cfmDt: this.generateLastReqDt(options.confirmationDate),
      salesDt: options.saleDate,
      stockRlsDt: options.stockReleaseDate
        ? this.generateLastReqDt(options.stockReleaseDate)
        : null,
      cnclReqDt: options.cancelRequestDate
        ? this.generateLastReqDt(options.cancelRequestDate)
        : null,
      cnclDt: options.canceledDate ? this.generateLastReqDt(options.canceledDate) : null,
      rfdDt: options.refundDate ? this.generateLastReqDt(options.refundDate) : null,
      rfdRsnCd: options.refundReason,
      totItemCnt: options.totalItems,
      taxblAmtA: options.taxableAmountA,
      taxblAmtB: options.taxableAmountB,
      taxblAmtC: options.taxableAmountC,
      taxblAmtD: options.taxableAmountD,
      taxRtA: options.taxRateA,
      taxRtB: options.taxRateB,
      taxRtC: options.taxRateC,
      taxRtD: options.taxRateD,
      taxAmtA: options.taxAmountA,
      taxAmtB: options.taxAmountB,
      taxAmtC: options.taxAmountC,
      taxAmtD: options.taxAmountD,
      totTaxblAmt: options.totalTaxableAmount,
      totTaxAmt: options.totalTaxAmount,
      totAmt: options.totalAmount,
      prchrAcptcYn: options.purchaseCode ? EbmYesOrNo.Yes : EbmYesOrNo.No,
      remark: options.remark,
      regrId: String(options.registrantId || this.user?.tin),
      regrNm: options.registrantName || this.user?.taxPayerName,
      modrId: String(options.modifierId || this.user?.tin),
      modrNm: options.modifierName || this.user?.taxPayerName,
      receipt,
      itemList,
    })
  }
}
