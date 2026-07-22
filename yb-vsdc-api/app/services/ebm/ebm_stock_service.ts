import { EbmService } from '#services/ebm/ebm_service'
import {
  EbmEndpoint,
  EbmImportItemsSelect,
  EbmItemSave,
  EbmItemSelect,
  EbmSelectStockItemsResponse,
  EbmStock,
  ImportDeclarationItem,
  InventoryItem,
} from '#types/ebm/ebm_service_type'
import { EbmApiResponseCode, EbmDefaultResponse } from '#types/ebm/ebm_type'

import Admin from '#models/admin'
import User from '#models/user'

export class EbmStocksService extends EbmService {
  constructor(user?: User | Admin) {
    super(user)
  }

  async saveStockItems(options: EbmItemSave) {
    const body = this.convertSaveItemOptionToEbmProps(options)
    const headers = {
      tin: options.tin,
      bhfId: options.branchId,
      dvcSrlNo: options.deviceSerialNo,
    }
    return this.postEbmData<EbmDefaultResponse>(EbmEndpoint.saveStockItems, body, headers)
  }

  async selectItems(option: EbmImportItemsSelect) {
    const res = await this.selectEbmData<{ data: { itemList: any[] } | null }>(EbmEndpoint.selectItems, {
      tin: option.tin,
      branchId: option.branchId,
      lastRequestDt: option.lastRequestDt,
    })

    if (res.resultCd === EbmApiResponseCode.ServerSucceeded || res.resultCd === EbmApiResponseCode.NoSearchResult) {
      return { result: res, data: res.data ? this.buildItemData(res.data.itemList) : [] }
    }

    throw res.resultMsg || JSON.stringify(res)
  }

  async selectImportItems(option: EbmImportItemsSelect) {
    const body = this.convertEbmSelectOptionToEbmProps(option)
    const headers = {
      tin: option.tin,
      bhfId: option.branchId,
    }
    return this.postEbmData<{ data: null | { itemList: ImportDeclarationItem[] } }>(
      EbmEndpoint.selectImportItems,
      body,
      headers
    )
  }

  async selectStockItems(option: EbmImportItemsSelect) {
    return this.selectEbmData<EbmSelectStockItemsResponse>(EbmEndpoint.selectStockItems, option)
  }

  async saveStock(option: EbmStock) {
    const body = this.convertSaveStockOptionToEbmProps(option)
    const headers = {
      tin: option.tin,
      bhfId: option.branchId,
      dvcSrlNo: option.deviceSerialNo,
    }
    return this.postEbmData<EbmDefaultResponse>(EbmEndpoint.saveStock, body, headers)
  }

  async saveStockMaster(option: InventoryItem) {
    const body = this.convertSaveStockMasterOptionToEbmProps(option)
    const headers = {
      tin: option.tin,
      bhfId: option.branchId,
      dvcSrlNo: option.deviceSerialNo,
    }
    return this.postEbmData<EbmDefaultResponse>(EbmEndpoint.saveStockMaster, body, headers)
  }

  private convertEbmSelectOptionToEbmProps(option: EbmItemSelect | EbmImportItemsSelect) {
    return JSON.stringify({
      tin: String(option.tin || this.user?.tin),
      bhfId: String(option.branchId || this.user?.branchId || '00'),
      lastReqDt: option.lastRequestDt,
    })
  }

  private convertSaveItemOptionToEbmProps(option: EbmItemSave) {
    return JSON.stringify({
      tin: String(option.tin || this.user?.tin),
      bhfId: String(option.branchId || this.user?.branchId || '00'),
      dvcId: String(option.deviceId || this.user?.deviceId),
      dvcSrlNo: String(option.deviceSerialNo || this.user?.serialNo),
      itemCd: option.code,
      itemClsCd: option.classificationCode,
      itemTyCd: option.typeCode,
      itemNm: option.name,
      itemStdNm: option.standarName,
      orgnNatCd: option.originalNationCode,
      pkgUnitCd: option.packagingUnitCode,
      qtyUnitCd: option.quantityUnitCode,
      taxTyCd: option.taxTypeCode,
      btchNo: option.batchNo,
      bcd: option.barcode,
      dftPrc: option.defaultUnitPrice,
      grpPrcL1: option.groupPriceL1,
      grpPrcL2: option.groupPriceL2,
      grpPrcL3: option.groupPriceL3,
      grpPrcL4: option.groupPriceL4,
      grpPrcL5: option.groupPriceL5,
      addInfo: option.additinalInfo,
      sftyQty: option.saftyQuantity,
      isrcAplcbYn: option.insuranceApplicableYn,
      useYn: option.useYn,
      regrNm: option.regristantName || this.user?.taxPayerName,
      regrId: String(option.regristrantId || this.user?.tin),
      modrNm: option.modifierName || this.user?.taxPayerName,
      modrId: String(option.modifierId || this.user?.tin)
    })
  }

  private convertSaveStockOptionToEbmProps(option: EbmStock) {
    const itemList = option.items.map((item) => {
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
        totDcAmt: item.discountAmount,
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
      dvcId: String(option.deviceId || this.user?.deviceId),
      dvcSrlNo: String(option.deviceSerialNo || this.user?.serialNo),
      sarNo: option.storedAndReleasedNo,
      orgSarNo: option.originalStoredAndReleaseNo,
      regTyCd: option.registrationType,
      custTin: option.customerTin ? String(option.customerTin) : null,
      custNm: option.customerName,
      custBhfId: option.customerBranchId,
      sarTyCd: option.storedAndReleasedType,
      ocrnDt: option.occuredDt,
      totItemCnt: option.totalItem,
      totTaxblAmt: option.totalTaxableAmount,
      totTaxAmt: option.totalTaxAmount,
      totAmt: option.totalAmount,
      remark: option.remark,
      regrId: String(option.regristrantId || this.user?.tin),
      regrNm: option.regristrantName || this.user?.taxPayerName,
      modrNm: option.modifierName || this.user?.taxPayerName,
      modrId: String(option.modifierId || this.user?.tin),
      itemList,
    })
  }

  private convertSaveStockMasterOptionToEbmProps(option: InventoryItem) {
    return JSON.stringify({
      tin:      String(option.tin || this.user?.tin),
      bhfId:    String(option.branchId || this.user?.branchId || '00'),
      dvcId:    String(option.deviceId || this.user?.deviceId),
      dvcSrlNo: String(option.deviceSerialNo || this.user?.serialNo),
      itemCd:   option.itemCode,
      rsdQty:   option.remainQuantity,
      // §9.1: 1=Opening Stock, 2=Purchase IN, 3=Manual Adjustment — default 3
      stockTyCd: option.stockTyCd ?? '3',
      regrId:   String(option.registrantId || this.user?.tin),
      regrNm:   option.registrantName || this.user?.taxPayerName,
      modrId:   String(option.modifierId || this.user?.tin),
      modrNm:   option.modifierName || this.user?.taxPayerName,
    })
  }

  private buildItemData(items: any[]) {
    return items.map((item) => {
      return {
        code: item.itemCd,
        classificationCode: item.itemClsCd,
        typeCode: item.itemTyCd,
        name: item.itemNm,
        standarName: item.itemStdNm,
        originalNationCode: item.orgnNatCd,
        packagingUnitCode: item.pkgUnitCd,
        quantityUnitCode: item.qtyUnitCd,
        taxTypeCode: item.taxTyCd,
        batchNo: item.btchNo,
        barcode: item.bcd,
        defaultUnitPrice: item.dftPrc,
        groupPriceL1: item.grpPrcL1,
        groupPriceL2: item.grpPrcL2,
        groupPriceL3: item.grpPrcL3,
        groupPriceL4: item.grpPrcL4,
        groupPriceL5: item.grpPrcL5,
        additinalInfo: item.addInfo,
        saftyQuantity: item.sftyQty,
        insuranceApplicableYn: item.isrcAplcbYn,
        useYn: item.useYn,
        rraModYn: item.rraModYn,
        regristantName: '',
        regristrantId: '',
        modifierName: '',
        modifierId: '',
        cisProductId: 'find-related-product'
      }
    })
  }
}
