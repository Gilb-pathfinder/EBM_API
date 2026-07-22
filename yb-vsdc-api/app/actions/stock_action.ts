import { getNumberFromItemCode } from '#helpers/ebm_helper'
import Item from '#models/item'
import Stock from '#models/stock'
import User from '#models/user'
import { EbmStocksService } from '#services/ebm/ebm_stock_service'
import {
  EbmItemSave,
  EbmStock,
  InventoryItem,
  EbmItem,
  EbmPurchaseItem,
  EbmYesOrNo
} from '#types/ebm/ebm_service_type'
import {
  EbmApiResponseCode,
  EbmProductType,
  EbmRegistrationType,
  EbmStockInOutType,
  EbmPackagingUnit,
  EbmUnitOfQuantity
} from '#types/ebm/ebm_type'
import { saveItemValidator } from '#validators/ebm_item_validator'
import { saveStockMasterValidator, saveStockValidator } from '#validators/ebm_stock_validator'
import { Infer } from '@vinejs/vine/types'
import { DateTime } from 'luxon'

export class StockAction {
  static async syncItems(user: User) {

    const ebmData = {
      lastRequestDt: user.itemLastReqDt || '20180101000000',
    }

    const { result, data } = await new EbmStocksService(user).selectItems(ebmData)

    if (result.resultCd !== EbmApiResponseCode.ServerSucceeded && result.resultCd !== EbmApiResponseCode.NoSearchResult) {
      throw result.resultMsg || JSON.stringify(result)
    }

    if (result.resultCd === EbmApiResponseCode.ServerSucceeded && data.length > 0) {
      const newItemsCodes = new Map()

      for (const { code } of data) {
        newItemsCodes.set(getNumberFromItemCode(code), code)
      }

      const newCode = Math.max(...newItemsCodes.keys())

      const lastCode = user.lastItemCode ? getNumberFromItemCode(user.lastItemCode) : -1

      user.lastItemCode = newCode > lastCode ? newItemsCodes.get(newCode) : user.lastItemCode

      await user.related('items').updateOrCreateMany(data, 'code')
    }

    await user.merge({ itemLastReqDt: result.resultDt }).save()

    // Auto-sync stock items (Req #64)
    await this.syncStockItems(user)

    return Promise.resolve(data.length)
  }


  static async createItem(user: User, payload: Infer<typeof saveItemValidator>, itemCode?: string): Promise<Item> {
    const code = itemCode ? itemCode : user.generateItemCode(payload.code)

    const ebmItemData: EbmItemSave = {
      ...payload,
      typeCode: payload.typeCode as EbmProductType,
      groupPriceL1: payload.groupPriceOne,
      groupPriceL2: payload.groupPriceTwo,
      groupPriceL3: payload.groupPriceThree,
      groupPriceL4: payload.groupPriceFour,
      groupPriceL5: payload.groupPriceFive,
      code,
    }

    const res = await new EbmStocksService(user).saveStockItems(ebmItemData)

    const {
      tin,
      //@ts-ignore do not find group type becuase of ...payload in ebmItemData object creation
      groupPriceOne,
      //@ts-ignore do not find group type becuase of ...payload in ebmItemData object creation
      groupPriceTwo,
      //@ts-ignore do not find group type becuase of ...payload in ebmItemData object creation
      groupPriceThree,
      //@ts-ignore do not find group type becuase of ...payload in ebmItemData object creation
      groupPriceFour,
      //@ts-ignore do not find group type becuase of ...payload in ebmItemData object creation
      groupPriceFive,
      branchId,
      ...newItem
    } = ebmItemData

    if (res.resultCd === EbmApiResponseCode.ServerSucceeded) {
      user.lastItemCode = code

      // const ebmItemMasterData: InventoryItem = {
      //   tin: user.tin,
      //   registrantName: user.taxPayerName,
      //   registrantId: user.tin.toString(),
      //   modifierName: user.taxPayerName,
      //   modifierId: user.tin.toString(),
      //   branchId: user.branchId,
      //   itemCode: code,
      //   remainQuantity: 0,
      // }

      const [item] = await Promise.all([
        Item.create({
          userId: user.id,
          regristantName: user.taxPayerName,
          regristrantId: user.tin.toString(),
          modifierName: user.taxPayerName,
          modifierId: user.tin.toString(),
          rraModYn: EbmYesOrNo.No,
          ...newItem,
        }),

        // new EbmStocksService().saveStockMaster(ebmItemMasterData),
        user.save(),
      ])

      return Promise.resolve(item)
    }

    throw res.resultMsg
  }

  static async saveStockMaster(user: User, payload: Infer<typeof saveStockMasterValidator>, originalStoredAndReleaseNo: number) {
    const ebmItemData: InventoryItem = {
      ...payload,
    }

    const res = await new EbmStocksService(user).saveStockMaster(ebmItemData)

    if (res.resultCd === EbmApiResponseCode.ServerSucceeded) {
      const { tin, ...stockData } = ebmItemData
      const stock = await user.related('stockMasters').query().where({ itemCode: payload.itemCode }).first()

      if (stock) {
        return await stock.merge({ remainQuantity: stock.remainQuantity + stockData.remainQuantity }).save()
      }

      return await user.related('stockMasters').create({
        ...stockData,
        originalStoredAndReleaseNo
      })
    }

    throw new Error('Cannot create save master')
  }

  static async saveStockItems(
    user: User,
    payload: Infer<typeof saveStockValidator>
  ) {

    user.lastStockNo = Number(user.lastStockNo) + 1

    const ebmItemData: EbmStock = {
      storedAndReleasedNo: user.lastStockNo,
      registrationType: EbmRegistrationType.Manual,
      ...payload,
      originalStoredAndReleaseNo: payload.originalStoredAndReleaseNo || user.lastStockNo
    }

    const res = await new EbmStocksService(user).saveStock(ebmItemData)

    if (res.resultCd === EbmApiResponseCode.ServerSucceeded) {
      const { tin, ...stockData } = ebmItemData

      const [stock] = await Promise.all([
        Stock.create({
          ...stockData,
          items: { data: stockData.items },
          userId: user.id,
          branchId: stockData.branchId ?? user.branchId,
          regristrantId: user.tin.toString(),
          regristrantName: user.taxPayerName,
          modifierId: user.tin.toString(),
          modifierName: user.taxPayerName,
        }),
        user.save(),
      ])

      return Promise.resolve({ stock, originalStoredAndReleaseNo: ebmItemData.originalStoredAndReleaseNo })
    }

    throw res.resultMsg
  }

  static async syncStockItems(user: User) {
    const ebmData = {
      lastRequestDt: user.stockLastReqDt || '20180101000000',
    }

    const res = await new EbmStocksService(user).selectStockItems(ebmData)

    if (res.resultCd !== EbmApiResponseCode.ServerSucceeded && res.resultCd !== EbmApiResponseCode.NoSearchResult) {
      throw res.resultMsg || JSON.stringify(res)
    }

    let itemsSynced = 0
    if (res.resultCd === EbmApiResponseCode.ServerSucceeded && res.data?.stockList) {
      const stockList = res.data.stockList
      for (const stock of stockList) {
        await user.related('stockMasters').updateOrCreate(
          { itemCode: stock.itemCd },
          {
            remainQuantity: stock.rsdQty,
            tin: user.tin.toString(),
            branchId: user.branchId,
            registrantId: user.tin.toString(),
            registrantName: user.taxPayerName,
            modifierId: user.tin.toString(),
            modifierName: user.taxPayerName,
            originalStoredAndReleaseNo: 0, // Placeholder for sync
          }
        )
      }
      itemsSynced = stockList.length
    }

    await user.merge({ stockLastReqDt: res.resultDt }).save()

    return Promise.resolve(itemsSynced)
  }

  static async decrementStock(user: User, items: EbmItem[]) {
    if (user.isTrainingMode) return

    const ebmStocksService = new EbmStocksService(user)

    for (const item of items) {
      const stock = await user.related('stockMasters').query().where({ itemCode: item.code }).first()
      if (stock) {
        const newQuantity = stock.remainQuantity - item.quantity
        await stock.merge({ remainQuantity: newQuantity }).save()

        // Sync balance with EBM
        const ebmItemMasterData: InventoryItem = {
          tin: user.tin,
          registrantName: user.taxPayerName,
          registrantId: user.tin.toString(),
          modifierName: user.taxPayerName,
          modifierId: user.tin.toString(),
          branchId: user.branchId,
          itemCode: item.code,
          remainQuantity: newQuantity,
        }
        await ebmStocksService.saveStockMaster(ebmItemMasterData)
      }
    }

    // Log movement to EBM (saveStock)
    const stockData: Infer<typeof saveStockValidator> = {
      items: items.map((i, index) => ({
        barcode: i.barcode,
        code: i.code,
        name: i.name,
        quantity: i.quantity,
        totalAmount: i.totalAmount,
        classificationCode: i.classificationCode,
        taxationType: i.taxTypeCode,
        taxAmount: i.taxAmount,
        sequenceNo: index + 1,
        packageNo: i.packageNo || 0,
        packageUnit: i.packagingUnitCode || EbmPackagingUnit.ExtraCountableItem,
        quantityUnit: i.quantityUnitCode || EbmUnitOfQuantity.PiecesItem,
        price: i.unitPrice,
        supplyPrice: i.totalAmount - i.taxAmount,
        discountAmount: 0,
        taxableAmount: i.totalAmount - i.taxAmount,
      })),
      occuredDt: DateTime.now().toFormat('yyyyMMdd'),
      storedAndReleasedType: EbmStockInOutType.OutgoingSale,
      totalAmount: items.reduce((a, b) => a + b.totalAmount, 0),
      totalItem: items.length,
      totalTaxableAmount: items.reduce((a, b) => a + (b.totalAmount - b.taxAmount), 0),
      totalTaxAmount: items.reduce((a, b) => a + b.taxAmount, 0),
    }
    await this.saveStockItems(user, stockData)
  }

  static async incrementStock(user: User, items: EbmItem[]) {
    if (user.isTrainingMode) return

    const ebmStocksService = new EbmStocksService(user)

    for (const item of items) {
      const stock = await user.related('stockMasters').query().where({ itemCode: item.code }).first()
      if (stock) {
        const newQuantity = stock.remainQuantity + item.quantity
        await stock.merge({ remainQuantity: newQuantity }).save()

        // Sync balance with EBM
        const ebmItemMasterData: InventoryItem = {
          tin: user.tin,
          registrantName: user.taxPayerName,
          registrantId: user.tin.toString(),
          modifierName: user.taxPayerName,
          modifierId: user.tin.toString(),
          branchId: user.branchId,
          itemCode: item.code,
          remainQuantity: newQuantity,
        }
        await ebmStocksService.saveStockMaster(ebmItemMasterData)
      }
    }

    // Log movement to EBM (saveStock)
    const stockData: Infer<typeof saveStockValidator> = {
      items: items.map((i, index) => ({
        barcode: i.barcode,
        code: i.code,
        name: i.name,
        quantity: i.quantity,
        totalAmount: i.totalAmount,
        classificationCode: i.classificationCode,
        taxationType: i.taxTypeCode,
        taxAmount: i.taxAmount,
        sequenceNo: index + 1,
        packageNo: i.packageNo || 0,
        packageUnit: i.packagingUnitCode || EbmPackagingUnit.ExtraCountableItem,
        quantityUnit: i.quantityUnitCode || EbmUnitOfQuantity.PiecesItem,
        price: i.unitPrice,
        supplyPrice: i.totalAmount - i.taxAmount,
        discountAmount: 0,
        taxableAmount: i.totalAmount - i.taxAmount,
      })),
      occuredDt: DateTime.now().toFormat('yyyyMMdd'),
      storedAndReleasedType: EbmStockInOutType.IncomingReturn,
      totalAmount: items.reduce((a, b) => a + b.totalAmount, 0),
      totalItem: items.length,
      totalTaxableAmount: items.reduce((a, b) => a + (b.totalAmount - b.taxAmount), 0),
      totalTaxAmount: items.reduce((a, b) => a + b.taxAmount, 0),
    }
    await this.saveStockItems(user, stockData)
  }

  static async updateStockFromImport(user: User, items: EbmPurchaseItem[]) {
    if (user.isTrainingMode) return

    const ebmStocksService = new EbmStocksService(user)

    for (const item of items) {
      const stock = await user.related('stockMasters').query().where({ itemCode: item.code }).first()
      
      let newQuantity = item.quantity
      if (stock) {
        newQuantity = stock.remainQuantity + item.quantity
        await stock.merge({ remainQuantity: newQuantity }).save()
      } else {
        await user.related('stockMasters').create({
          itemCode: item.code,
          remainQuantity: newQuantity,
          branchId: user.branchId,
          registrantId: user.tin.toString(),
          registrantName: user.taxPayerName,
          modifierId: user.tin.toString(),
          modifierName: user.taxPayerName,
          originalStoredAndReleaseNo: 0,
        })
      }

      // Sync balance with EBM
      const ebmItemMasterData: InventoryItem = {
        tin: user.tin,
        registrantName: user.taxPayerName,
        registrantId: user.tin.toString(),
        modifierName: user.taxPayerName,
        modifierId: user.tin.toString(),
        branchId: user.branchId,
        itemCode: item.code,
        remainQuantity: newQuantity,
      }
      await ebmStocksService.saveStockMaster(ebmItemMasterData)
    }

    // Log movement to EBM (saveStock)
    const stockData: Infer<typeof saveStockValidator> = {
      items: items.map((i, index) => ({
        barcode: '', 
        code: i.code,
        name: i.name,
        quantity: i.quantity,
        totalAmount: i.totalAmount,
        classificationCode: i.classificationCode,
        taxationType: i.taxationType,
        taxAmount: i.taxAmount,
        sequenceNo: index + 1,
        packageNo: i.packageNo || 0,
        packageUnit: i.packageUnit || EbmPackagingUnit.ExtraCountableItem,
        quantityUnit: i.quantityUnit || EbmUnitOfQuantity.PiecesItem,
        price: i.price,
        supplyPrice: i.totalAmount - i.taxAmount,
        discountAmount: 0,
        taxableAmount: i.totalAmount - i.taxAmount,
      })),
      occuredDt: DateTime.now().toFormat('yyyyMMdd'),
      storedAndReleasedType: EbmStockInOutType.IncomingImport,
      totalAmount: items.reduce((a, b) => a + b.totalAmount, 0),
      totalItem: items.length,
      totalTaxableAmount: items.reduce((a, b) => a + (b.totalAmount - b.taxAmount), 0),
      totalTaxAmount: items.reduce((a, b) => a + b.taxAmount, 0),
    }
    await this.saveStockItems(user, stockData)
  }
}
