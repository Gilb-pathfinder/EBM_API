import User from "#models/user"
import { EbmApiResponseCode, EbmReceiptType, EbmRegistrationType, EbmStockInOutType, EbmTransactionProgress, EbmTransactionType } from "#types/ebm/ebm_type"
import PurchaseList from "#models/purchase_list"
import { EbmTransactionService } from "#services/ebm/ebm_transaction_service"
import { EbmItem, EbmPurchaseSave, EbmPurchaseItem, EbmYesOrNo, EbmStockItem } from "#types/ebm/ebm_service_type"
import { DateTime } from "luxon"
import { Infer } from "@vinejs/vine/types"
import { purchaseSaveValidator } from "#validators/ebm_transaction_validator"
import { parseItemCode } from "#helpers/ebm_helper"
import { StockAction } from "./stock_action.js"

export class PurchaseAction {
  static async sync(user: User) {
    let count = 0

    const response = await new EbmTransactionService(user).selectTrnsPurchaseSales({
      branchId: user.branchId,
      lastRequestDt: user.purchaseLastReqDt,
      tin: user.tin
    })

    if (response.resultCd == EbmApiResponseCode.ServerSucceeded && response.data) {

      const purchases = this.formatPurchaseListFromEbm(response.data.saleList, user, response.resultDt)

      // Skip purchases already stored to avoid duplicate pending records on re-sync
      const newPurchases = []
      for (const p of purchases) {
        const exists = await user
          .related('puchaseList')
          .query()
          .where('supplier_tin', p.supplierTin)
          .where('supplier_invoice_no', p.supplierInvoiceNo)
          .first()
        if (!exists) newPurchases.push(p)
      }

      count = newPurchases.length
      if (newPurchases.length > 0) await user.related('puchaseList').createMany(newPurchases)

    }

    if (response.resultCd === EbmApiResponseCode.NoSearchResult || response.resultCd === EbmApiResponseCode.ServerSucceeded) {

      await user.merge({ purchaseLastReqDt: response.resultDt }).save()
      return Promise.resolve(count)
    }

    throw response.resultMsg
  }

  static async confirmOrReject(user: User, { isConfirm, items, purchaseId }: Infer<typeof purchaseSaveValidator>) {
    const type = isConfirm ? EbmTransactionProgress.Approved : EbmTransactionProgress.Canceled
    const purchase = await PurchaseList.findOrFail(purchaseId)

    const invoiceNo = +user.lastPurchaseInvoiceNo + 1

    const isConfirmed = type === EbmTransactionProgress.Approved
    const isRejected = type === EbmTransactionProgress.Canceled
    const confirmationDate = isConfirmed ? DateTime.now() : undefined
    const cancelRequestDate = isRejected ? DateTime.now() : undefined
    const purchaseListToUpdate = [
      user.merge({ lastPurchaseInvoiceNo: invoiceNo }),
      purchase.merge({ isConfirmed, isRejected }),
    ]

    const data: EbmPurchaseSave = {
      tin: user.tin,
      branchId: user.branchId,
      items: await this.formatItemsToSave(user, purchase.items.data, isConfirmed, items),
      invoiceNo,
      originalInvoiceNo: purchase.supplierInvoiceNo,
      supplierBranchId: purchase.supplierBranchId,
      supplierInvoiceNo: purchase.supplierInvoiceNo,
      supplierTin: purchase.supplierTin,
      prcOrdCd: purchase.purchaseOrderCode || null,
      receiptTypeCode: EbmReceiptType.Purchase,
      paymentMethod: purchase.paymentMethod,
      purchaseStatusCode: type,
      purchaseTypeCode: EbmTransactionType.Normal,
      modifierId: user.tin.toString(),
      modifierName: user.taxPayerName,
      registrantId: user.tin.toString(),
      registrantName: user.taxPayerName,
      registrationTypeCode: EbmRegistrationType.Manual,
      purchaseDate: purchase.saleDate.toFormat('yyyyMMdd'),
      warehousingDate: null,
      taxableAmountA: purchase.taxableAmountA,
      taxableAmountB: purchase.taxableAmountB,
      taxableAmountC: purchase.taxableAmountC,
      taxableAmountD: purchase.taxableAmountD,
      taxRateA: purchase.taxRateA,
      taxRateB: purchase.taxRateB,
      taxRateC: purchase.taxRateC,
      taxRateD: purchase.taxRateD,
      taxAmountA: purchase.taxAmountA,
      taxAmountB: purchase.taxAmountB,
      taxAmountC: purchase.taxAmountC,
      taxAmountD: purchase.taxAmountD,
      totalTaxableAmount: purchase.totalTaxableAmount,
      totalTaxAmount: purchase.totalTaxAmount,
      totalAmount: purchase.totalAmount,
      remark: purchase.remark,
      totalItems: purchase.totalItems,
      // canceledDate: type == EbmTransactionProgress.Canceled ? DateTime.now().toFormat('yyyy-MM-ddHH:mm:ss') : undefined,
      canceledDate: undefined,
      confirmationDate: confirmationDate && confirmationDate.toFormat('yyyyMMddHHmmss'),
      cancelRequestDate: cancelRequestDate && cancelRequestDate.toFormat('yyyyMMddHHmmss'),
      refundDate: undefined,
      supplierName: purchase.supplierName,
      supplierSdcId: purchase.supplierSdcId,
      prcOrdCd: purchase.purchaseOrderCode || null
    }

    const response = await new EbmTransactionService(user).SavePurchase(data)

    if (response.resultCd == EbmApiResponseCode.ServerSucceeded) {

      if (!isConfirm) {
        await Promise.all(purchaseListToUpdate.map(p => p.save()))
        return { success: 'Purchase canceled successfully!' }
      }

      const itemsToUpdate = []
      const stockItems: EbmStockItem[] = []


      for (const itemPayload of items!!) {
        const itemToCreate = data.items!!.find(item => item.sequenceNo == itemPayload.sequenceNo)!!
        const parsedItemCode = parseItemCode(itemToCreate.code)!!
        const { supplierItemClassificationCode, supplierItemCode, supplierItemName, ...cleanedItem } = itemToCreate

        if (!itemPayload.itemId) {
          const item = await StockAction.createItem(user, {
            cisProductId: itemPayload.cisProductId || '',
            quantityUnitCode: parsedItemCode.quantityUnit,
            taxTypeCode: itemToCreate.taxationType,
            defaultUnitPrice: 1,
            insuranceApplicableYn: itemPayload.insuranceApplicableYn,
            useYn: EbmYesOrNo.Yes,
            packagingUnitCode: parsedItemCode.packingUnit,
            originalNationCode: parsedItemCode.countryCode,
            typeCode: parsedItemCode.productType,
            code: parsedItemCode,
            classificationCode: itemToCreate.classificationCode,
            name: itemToCreate.name,
            barcode: itemToCreate.barcode,
          }, itemToCreate.code)

          itemsToUpdate.push(item)
        }

        stockItems.push(cleanedItem)
      }

      // Sync stock with EBM and local DB for all items
      await StockAction.incrementStock(user, data.items.map(i => ({
        code: i.code,
        quantity: i.quantity,
      } as any)))

      await StockAction.saveStockItems(user, {
        items: stockItems,
        storedAndReleasedType: EbmStockInOutType.IncomingPurchase,
        totalTaxableAmount: purchase.totalTaxableAmount,
        occuredDt: DateTime.now().toFormat('yyyyMMdd'),
        totalAmount: purchase.totalAmount,
        totalItem: purchase.totalItems,
        totalTaxAmount: purchase.totalAmount
      })

      await Promise.all(purchaseListToUpdate.map(p => p.save()))

      return user.related('puchases').create({
        ...data,
        items: { data: data.items },
        confirmationDate,
        cancelRequestDate,
        canceledDate: undefined,
        purchaseDate: purchase.saleDate,
        warehousingDate: null,
        refundDate: null,
        resultDt: response.resultDt
      })
    }

    throw response.resultMsg
  }

  private static async formatItemsToSave(user: User, items: EbmItem[], isConfirmed: boolean, itemsFromPayload?: Infer<typeof purchaseSaveValidator>['items']): Promise<EbmPurchaseItem[]> {

    if (!isConfirmed) {
      return items.map(item => {
        return {
          ...item,
          supplierItemClassificationCode: item.classificationCode,
          supplierItemCode: item.code,
          supplierItemName: item.name,
        }
      })
    }

    if (!itemsFromPayload || itemsFromPayload.length <= 0) {
      throw { error: `Cannot confirm purchase with empty items list` }
    }


    if (itemsFromPayload.length != items.length) {
      throw { error: `Items length does not match purchase items length` }
    }

    const isItemSequemceMatch = itemsFromPayload.map(i => i.sequenceNo).every(i => items.map(item => item.sequenceNo).includes(i))

    if (!isItemSequemceMatch) {
      throw { error: `Items sequence does not match purchase items sequences numbers` }
    }

    const tab: EbmPurchaseItem[] = []

    for (let i = 0; i < itemsFromPayload.length; i++) {
      const payloadItem = itemsFromPayload[i];
      const itemToSave = items.find(item => payloadItem.sequenceNo === item.sequenceNo)

      if (!itemToSave) throw { error: `items to save do not match purchase items (seq:[${payloadItem.sequenceNo}])` }

      if (payloadItem.itemId) {
        const oldItem = await user.related('items').query().where({ id: payloadItem.itemId }).firstOrFail()

        tab.push({
          ...payloadItem,
          ...itemToSave,
          supplierItemClassificationCode: itemToSave?.classificationCode,
          supplierItemCode: itemToSave?.code,
          supplierItemName: itemToSave?.name,
          code: oldItem.code,
          name: oldItem.name,
          barcode: oldItem.barcode
        })

        continue
      }

      const parsedCode = parseItemCode(itemToSave.code)

      if (!parsedCode) throw { error: `Cannot parse item(seq: ${itemToSave.sequenceNo})[name: ${itemToSave.name}] ` }
      const { increment, ...itemCode } = parsedCode

      const code = user.generateItemCode(itemCode)

      tab.push({
        ...itemToSave,
        ...payloadItem,
        supplierItemClassificationCode: itemToSave?.classificationCode,
        supplierItemCode: itemToSave?.code,
        supplierItemName: itemToSave?.name,
        code
      })
    }

    return tab
  }

  private static formatPurchaseListFromEbm(data: any, user: User, resultDt: string) {
    return data.map((sale: any) => ({
      tin: user.tin,
      branchId: user.branchId,
      supplierTin: sale.spplrTin,
      supplierName: sale.spplrNm,
      supplierBranchId: sale.spplrBhfId,
      supplierInvoiceNo: sale.spplrInvcNo,
      purchaseOrderCode: sale.prcOrdCd,
      supplierSdcId: sale.spplrSdcId,
      supplierMrcNo: sale.spplrMrcNo,
      receiptTypeCode: sale.rcptTyCd,
      paymentMethod: sale.pmtTyCd,
      confirmationDate: sale.cfmDt && DateTime.fromFormat(sale.cfmDt, 'yyyy-MM-dd HH:mm:ss'),
      saleDate: DateTime.fromFormat(sale.salesDt, 'yyyyMMdd'),
      stockReleaseDate: sale.stockRlsDt && DateTime.fromFormat(sale.stockRlsDt, 'yyyy-MM-dd HH:mm:ss'),
      totalItems: sale.totItemCnt,
      taxableAmountA: sale.taxblAmtA,
      taxableAmountB: sale.taxblAmtB,
      taxableAmountC: sale.taxblAmtC,
      taxableAmountD: sale.taxblAmtD,
      taxRateA: sale.taxRtA,
      taxRateB: sale.taxRtB,
      taxRateC: sale.taxRtC,
      taxRateD: sale.taxRtD,
      taxAmountA: sale.taxAmtA,
      taxAmountB: sale.taxAmtB,
      taxAmountC: sale.taxAmtC,
      taxAmountD: sale.taxAmtD,
      totalTaxableAmount: sale.totTaxblAmt,
      totalTaxAmount: sale.totTaxAmt,
      totalAmount: sale.totAmt,
      remark: sale.remark,
      resultDt,
      items: { data: this.formatItemsFromEbm(sale.itemList) }
    }))

  }

  private static formatItemsFromEbm(products: Record<string, any>[]) {
    return products.map((item: any) => ({
      sequenceNo: item.itemSeq,
      code: item.itemCd,
      classificationCode: item.itemClsCd,
      name: item.itemNm,
      barcode: item.bcd,
      packageUnit: item.pkgUnitCd,
      packageNo: item.pkg,
      quantityUnit: item.qtyUnitCd,
      quantity: item.qty,
      price: item.prc,
      supplyPrice: item.splyAmt,
      discountRate: item.dcRt,
      discountAmount: item.dcAmt,
      taxationType: item.taxTyCd,
      taxableAmount: item.taxblAmt,
      taxAmount: item.taxAmt,
      totalAmount: item.totAmt
    }))
  }
}