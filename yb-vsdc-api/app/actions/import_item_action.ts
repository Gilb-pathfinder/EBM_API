import ImportItemList from "#models/import_item_list"
import User from "#models/user"
import { EbmApiResponseCode, EbmImportItemStatus } from "#types/ebm/ebm_type"
import { approveImportItemValidator, cancelImportItemValidator } from "#validators/ebm_item_validator"
import { Infer } from "@vinejs/vine/types"
import { StockAction } from "./stock_action.js"
import { EbmYesOrNo, UpdateImportItemOption } from "#types/ebm/ebm_service_type"
import { EbmItemService } from "#services/ebm/ebm_item_service"
import { EbmStocksService } from "#services/ebm/ebm_stock_service"
import { getTaxAmountByType, getTaxRateByType } from "#helpers/ebm_helper"
import { formatNumberBy2Decimals } from "#helpers/index"

export class ImportItemAction {
  static async sync(user: User) {
    let count = 0

    const response = await new EbmStocksService(user).selectImportItems({
      lastRequestDt: user.importLastReqDt,
    })


    if (response.resultCd == EbmApiResponseCode.ServerSucceeded && response.data) {
      const imports = this.formatImportFromEbm(response.data.itemList, user.id)

      console.log(imports)
      await user.related('importItemList').createMany(imports)

      count = imports.length
    }

    if (response.resultCd == EbmApiResponseCode.NoSearchResult || response.resultCd == EbmApiResponseCode.ServerSucceeded) {
      await user.merge({ importLastReqDt: response.resultDt }).save()
      return Promise.resolve(count)
    }

    throw response.resultMsg
  }

  static async approve(user: User, payload: Infer<typeof approveImportItemValidator>) {

    const importItem = await ImportItemList.findOrFail(payload.id)

    console.log('STATUS', importItem.statusCode)
    if (importItem.statusCode !== EbmImportItemStatus.Waiting) {
      throw { error: 'Cannot approve! this item is not in waiting mode.' }
    }

    let itemToImport = null

    const code = importItem.exportNationCode + payload.item.productType + payload.item.packingType + payload.item.quantityUnit
    const item = await user.related('items').query().whereLike('code', `${code}%`).first()

    if (item) {
      itemToImport = item
    } else if (payload.item) {
      itemToImport = await StockAction.createItem(user, {

        code: {
          countryCode: importItem.originNationCode,
          packingUnit: payload.item.packingType,
          productType: payload.item.productType,
          quantityUnit: payload.item.quantityUnit
        },
        quantityUnitCode: payload.item.quantityUnit,
        originalNationCode: importItem.originNationCode,
        packagingUnitCode: payload.item.packingType,
        useYn: EbmYesOrNo.Yes,
        defaultUnitPrice: 1,
        cisProductId: payload.cisProductId?.toString() || '',
        classificationCode: payload.item.classificationCode,
        insuranceApplicableYn: payload.item.insuranceApplicableYn,
        name: payload.item.name,
        taxTypeCode: payload.item.taxTypeCode,
        typeCode: payload.item.productType,
        barcode: payload.item.barcode
      })

    } else {
      throw { error: 'Cannot not approve this import without item' }
    }

    const ebmImportItemData: UpdateImportItemOption = {
      taskCode: ++user.lastImportTaskCode,
      declarationDate: importItem.declarationDate,
      itemSequence: importItem.itemSequence,
      hsCode: importItem.hsCode,
      itemClassificationCode: itemToImport.classificationCode,
      itemCode: itemToImport.code,
      importStatus: EbmImportItemStatus.Approved,
    }

    const response = await new EbmItemService(user).updateImportItem(ebmImportItemData)

    if (response.resultCd === EbmApiResponseCode.ServerSucceeded) {
      importItem.statusCode = EbmImportItemStatus.Approved

      const newImportItem = await
        user.related('importItems').create({
          itemName: importItem.itemName,
          branchId: user.branchId,
          declarationDate: importItem.declarationDate,
          hsCode: importItem.hsCode,
          itemClassificationCode: itemToImport.classificationCode,
          itemCode: itemToImport.code,
          itemSequence: 1,
          modifierId: user.tin.toString(),
          modifierName: user.taxPayerName,
          statusCode: ebmImportItemData.importStatus,
          taskCode: importItem.taskCode,
          tin: user.tin,
        })

      await StockAction.updateStockFromImport(user, [{
        code: itemToImport.code,
        quantity: importItem.quantity,
        sequenceNo: 1,
        classificationCode: itemToImport.classificationCode,
        name: itemToImport.name,
        packageUnit: itemToImport.packagingUnitCode,
        packageNo: importItem.packageQuantity,
        quantityUnit: itemToImport.quantityUnitCode,
        price: 1,
        supplyPrice: formatNumberBy2Decimals(1 * importItem.quantity),
        discountRate: 0,
        discountAmount: 0,
        taxationType: itemToImport.taxTypeCode,
        taxableAmount: formatNumberBy2Decimals(1 * importItem.quantity),
        taxAmount: formatNumberBy2Decimals(getTaxRateByType(itemToImport.taxTypeCode) > 0 ? (getTaxAmountByType(itemToImport.taxTypeCode) * formatNumberBy2Decimals(1 * importItem.quantity)) / getTaxRateByType(itemToImport.taxTypeCode) : 0),
        totalAmount: formatNumberBy2Decimals(1 * importItem.quantity),
      } as any])

      await Promise.all([
        importItem.merge({ isApproved: true }).save(),
        user.save()
      ])

      return Promise.resolve({
        ...newImportItem,
        quantity: importItem.quantity,
        buyingPrice: formatNumberBy2Decimals(importItem.invoiceForeignCurrencyAmount / importItem.invoiceForeignCurrencyExchangeRate),
        agentName: importItem.agentName,
        countryCode: importItem.exportNationCode,
        supplierName: importItem.supplierName
      })
    }



    throw response.resultMsg
  }

  static async cancel(user: User, payload: Infer<typeof cancelImportItemValidator>) {
    const importItem = await ImportItemList.findOrFail(payload.id)

    if (importItem.statusCode !== EbmImportItemStatus.Waiting) {
      throw { error: 'Cannot cancel! this item is not in waiting mode.' }
    }

    const ebmImportItemData: UpdateImportItemOption = {
      taskCode: ++user.lastImportTaskCode,
      declarationDate: importItem.declarationDate,
      itemSequence: importItem.itemSequence,
      hsCode: importItem.hsCode,
      itemClassificationCode: '123456',
      itemCode: 'RW1NTXU0000001',
      importStatus: EbmImportItemStatus.Approved,
      remark: payload.remark,
    }

    const response = await new EbmItemService(user).updateImportItem(ebmImportItemData)

    if (response.resultCd === EbmApiResponseCode.ServerSucceeded) {
      importItem.statusCode = EbmImportItemStatus.Cancelled

      await Promise.all([
        importItem.save(),
        importItem.merge({ isCanceled: true }).save(),
        user.save(),
      ])

      return Promise.resolve(importItem)
    }

    throw response.resultMsg
  }

  private static formatImportFromEbm(data: any[], userId: string) {
    return data.map((item) => {
      return {
        taskCode: item.taskCd,
        declarationDate: item.dclDe,
        itemSequence: item.itemSeq,
        declarationNumber: item.dclNo,
        hsCode: item.hsCd,
        itemName: item.itemNm,
        statusCode: item.imptItemsttsCd,
        originNationCode: item.orgnNatCd,
        exportNationCode: item.exptNatCd,
        packageQuantity: item.pkg,
        packageUnitCode: item.pkgUnitCd,
        quantity: item.qty,
        quantityUnitCode: item.qtyUnitCd,
        totalWeight: item.totWt,
        netWeight: item.netWt,
        supplierName: item.spplrNm,
        agentName: item.agntNm,
        invoiceForeignCurrencyAmount: item.invcFcurAmt,
        invoiceForeignCurrencyCode: item.invcFcurCd,
        invoiceForeignCurrencyExchangeRate: item.invcFcurExcrt,
        userId,
      }
    })
  }
}