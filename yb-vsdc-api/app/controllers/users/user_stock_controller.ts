import { DateTime } from 'luxon'
import { StockAction } from '#actions/stock_action'
import CatchEbmAndAllError from '#helpers/classes/catch_ebm_and_all_error'
import { getTaxAmountByType, getTaxRateByType } from '#helpers/ebm_helper'
import Item from '#models/item'
import ItemComposition from '#models/item_composition'
import Stock from '#models/stock'
import Branch from '#models/branch'
import StockMaster from '#models/stock_master'
import User from '#models/user'
import { EbmService } from '#services/ebm/ebm_service'
import { EbmItemService } from '#services/ebm/ebm_item_service'
import { EbmStocksService } from '#services/ebm/ebm_stock_service'
import {
  EbmItemClassificationCode,
  EbmItemSave,
  EbmItemCompositionSave,
  EbmStock,
  EbmStockItem,
  EbmStockWithItem, InventoryItem
} from '#types/ebm/ebm_service_type'
import { EbmYesOrNo } from '#types/ebm/ebm_service_type'
import {
  EbmApiResponseCode,
  EbmDefaultResponse, EbmProductType,
  EbmRegistrationType,
  EbmStockInOutType,
  EbmTaxType
} from '#types/ebm/ebm_type'
import {
  saveItemValidator,
  updateItemValidator,
  deleteItemValidator,
  saveItemCompositionValidator,
} from '#validators/ebm_item_validator'
import {
  saveStockMasterValidator,
  saveStockValidator,
  saveStockWithItemsValidator,
} from '#validators/ebm_stock_validator'
import { listRequestValidator } from '#validators/ebm_validator'
import type { HttpContext } from '@adonisjs/core/http'

export default class UserBranchesController extends CatchEbmAndAllError {
  //#region items
  async items_save({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(saveItemValidator)

    try {
      const user = auth.user as User

      const code = new EbmService().generateItemCode({
        itemCode: payload.code as EbmItemClassificationCode,
        lastItemCode: user?.lastItemCode,
      })

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

      const res = (await new EbmStocksService(user).saveStockItems(ebmItemData)) as EbmDefaultResponse

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
        deviceSerialNo,
        ...newItem
      } = ebmItemData

      if (res.resultCd === EbmApiResponseCode.ServerSucceeded) {
        user.lastItemCode = code

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
          user.save(),
        ])

        // Sync initial stock master (qty=0) to EBM; failure must not block item creation
        try {
          await new EbmStocksService(user).saveStockMaster({
            tin: user.tin,
            registrantName: user.taxPayerName,
            registrantId: user.tin.toString(),
            modifierName: user.taxPayerName,
            modifierId: user.tin.toString(),
            branchId: user.branchId,
            itemCode: code,
            remainQuantity: 0,
          })
        } catch (e) {
          console.error('saveStockMaster after item creation failed:', e)
        }

        return item
      }

      return response.badRequest(res)
    } catch (error) {
      if (error?.cause?.code === 'ECONNREFUSED') {
        return response.serviceUnavailable({ resultMsg: 'EBM server is not connected!' })
      }

      console.error(error)
      return response.badRequest(error)
    }
  }

  async items_list({ request, response, auth }: HttpContext) {
    const { page, perPage } = await request.validateUsing(listRequestValidator)

    try {
      const user = auth.user as User
      const itemAdded = await StockAction.syncItems(user)

      const itemsPaginated = await user.related('items')
        .query()
        .orderBy('name', 'asc')
        .paginate(page || 1, perPage || 10)

      const codes = itemsPaginated.all().map(i => i.code)
      const stocks = await StockMaster.query()
        .whereIn('item_code', codes)
        .where('branch_id', user.branchId)
        .orderBy('created_at', 'desc')

      const stockMap = new Map()
      stocks.forEach(s => {
        if (!stockMap.has(s.itemCode)) stockMap.set(s.itemCode, s.remainQuantity)
      })
      
      const itemsWithQty = itemsPaginated.all().map(item => {
        const json = item.toJSON()
        return {
          ...json,
          remainQuantity: stockMap.get(item.code) ?? 0
        }
      })

      return { 
        items: {
          meta: itemsPaginated.getMeta(),
          data: itemsWithQty
        }, 
        itemAdded 
      }
    } catch (error) {
      return this.catchErrors(response, error)
    }
  }

  async items_search({ request, response, auth }: HttpContext) {
    const { page, perPage, ...input } = request.qs()

    try {
      const user = auth.user as User
      const itemsPaginated = await Item.filter(input)
        .where('user_id', user.id)
        .orderBy('name', 'asc')
        .orderBy('created_at', 'desc')
        .paginate(page || 1, perPage || 20)

      const codes = itemsPaginated.all().map(i => i.code)
      const stocks = await StockMaster.query()
        .whereIn('item_code', codes)
        .where('branch_id', user.branchId)
        .orderBy('created_at', 'desc')

      const stockMap = new Map()
      stocks.forEach(s => {
        if (!stockMap.has(s.itemCode)) stockMap.set(s.itemCode, s.remainQuantity)
      })

      const itemsWithQty = itemsPaginated.all().map(item => {
        const json = item.toJSON()
        return {
          ...json,
          remainQuantity: stockMap.get(item.code) ?? 0
        }
      })

      return {
        items: {
          meta: itemsPaginated.getMeta(),
          data: itemsWithQty
        }
      }
    } catch (error) {
      if (error?.cause?.code === 'ECONNREFUSED') {
        return response.serviceUnavailable({ resultMsg: 'EBM server is not connected!' })
      }

      console.error(error)
      return response.badRequest(error)
    }
  }

  async items_find({ request, response, auth }: HttpContext) {
    try {
      const user = auth.user as User
      const item = await user
        .related('items')
        .query()
        .where({ id: request.param('id') || '' })
        .first()

      return { item }
    } catch (error) {
      if (error?.cause?.code === 'ECONNREFUSED') {
        return response.serviceUnavailable({ resultMsg: 'EBM server is not connected!' })
      }

      console.error(error)
      return response.badRequest(error)
    }
  }

  //#endregion items

  async items_update({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(updateItemValidator)

    try {
      const user = auth.user as User
      const updatedItems: Item[] = []

      const dbItems = await user.related('items').query().whereIn('id', payload.items.map((i) => i.id))
      const itemMap = new Map(dbItems.map((i) => [i.id, i]))

      for (const itemInput of payload.items) {
        const item = itemMap.get(itemInput.id)
        if (!item) return response.badRequest({ error: `Item not found: ${itemInput.id}` })

        // Build the full EBM update payload from existing item + overrides
        const ebmItemData: EbmItemSave = {
          code: item.code,
          classificationCode: item.classificationCode,
          typeCode: (itemInput.typeCode ?? item.typeCode) as EbmProductType,
          name: itemInput.name ?? item.name,
          standarName: item.standarName,
          originalNationCode: item.originalNationCode as any,
          packagingUnitCode: item.packagingUnitCode as any,
          quantityUnitCode: item.quantityUnitCode as any,
          taxTypeCode: (itemInput.taxTypeCode ?? item.taxTypeCode) as any,
          batchNo: item.batchNo,
          barcode: item.barcode,
          defaultUnitPrice: itemInput.defaultUnitPrice ?? item.defaultUnitPrice,
          insuranceApplicableYn: item.insuranceApplicableYn as any,
          useYn: (itemInput.useYn ?? item.useYn) as any,
          tin: user.tin,
          branchId: user.branchId,
          deviceSerialNo: user.serialNo,
        }

        const res = await new EbmStocksService(user).saveStockItems(ebmItemData) as EbmDefaultResponse

        if (res.resultCd === EbmApiResponseCode.ServerSucceeded) {
          // Update local record with changed fields
          item.merge({
            name: ebmItemData.name,
            defaultUnitPrice: ebmItemData.defaultUnitPrice,
            useYn: ebmItemData.useYn,
            taxTypeCode: ebmItemData.taxTypeCode,
            typeCode: ebmItemData.typeCode,
          })
          await item.save()
          updatedItems.push(item)
        } else {
          return response.badRequest({ ...res, itemId: itemInput.id })
        }
      }

      return { updated: updatedItems.length, items: updatedItems }
    } catch (error) {
      return this.catchErrors(response, error)
    }
  }

  async items_delete({ request, response, auth }: HttpContext) {
    const code = request.param('code')
    if (!code) return response.badRequest({ error: 'The code field must be defined' })

    try {
      const user = auth.user as User
      const item = await user.related('items').query().where('code', code).firstOrFail()

      // Deactivate on EBM by setting useYn = 'N'
      const ebmItemData: EbmItemSave = {
        code: item.code,
        classificationCode: item.classificationCode,
        typeCode: item.typeCode as EbmProductType,
        name: item.name,
        standarName: item.standarName,
        originalNationCode: item.originalNationCode as any,
        packagingUnitCode: item.packagingUnitCode as any,
        quantityUnitCode: item.quantityUnitCode as any,
        taxTypeCode: item.taxTypeCode as any,
        batchNo: item.batchNo,
        barcode: item.barcode,
        defaultUnitPrice: item.defaultUnitPrice,
        insuranceApplicableYn: item.insuranceApplicableYn as any,
        useYn: EbmYesOrNo.No,
        tin: user.tin,
        branchId: user.branchId,
        deviceSerialNo: user.serialNo,
      }

      const res = await new EbmStocksService(user).saveStockItems(ebmItemData) as EbmDefaultResponse

      if (res.resultCd === EbmApiResponseCode.ServerSucceeded) {
        item.useYn = EbmYesOrNo.No
        await item.save()
        return { deleted: true, item }
      }

      return response.badRequest(res)
    } catch (error) {
      return this.catchErrors(response, error)
    }
  }

  async items_composition_list({ request, response, auth }: HttpContext) {
    try {
      const user = auth.user as User
      const code = request.param('code')
      const compositions = await ItemComposition.query()
        .where('item_code', code)
        .where('user_id', user.id)
      return compositions
    } catch (error) {
      return this.catchErrors(response, error)
    }
  }

  async items_composition_save({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(saveItemCompositionValidator)

    try {
      const user = auth.user as User

      const ebmCompositionData: EbmItemCompositionSave = {
        tin: user.tin.toString(),
        bhfId: user.branchId,
        regrId: user.tin.toString(),
        regrNm: user.taxPayerName,
        modrId: user.tin.toString(),
        modrNm: user.taxPayerName,
        itemList: payload.compositions.map((c) => ({
          itemCd: payload.itemCode,
          cpstItemCd: c.itemCode,
          qty: c.quantity,
          prc: c.cost,
        })),
      }

      const res = (await new EbmItemService(user).saveItemComposition(
        ebmCompositionData
      )) as EbmDefaultResponse

      if (res.resultCd === EbmApiResponseCode.ServerSucceeded) {
        // Clear existing compositions for this item if any
        await ItemComposition.query().where('item_code', payload.itemCode).where('user_id', user.id).delete()

        // Save locally
        const localCompositions = payload.compositions.map((c) => ({
          itemCode: payload.itemCode,
          componentItemCode: c.itemCode,
          quantity: c.quantity,
          cost: c.cost,
          userId: user.id,
        }))

        await ItemComposition.createMany(localCompositions)

        return { success: true, message: 'Item composition saved successfully' }
      }

      return response.badRequest(res)
    } catch (error) {
      return this.catchErrors(response, error)
    }
  }

  //#region stocks
  async stocks_master_list({ request, auth }: HttpContext) {
    const { page, perPage } = await request.validateUsing(listRequestValidator)
    const user = auth.user as User
    const masters = await user.related('stockMasters').query()
      .orderBy('item_code', 'asc')
      .paginate(page || 1, perPage || 50)

    // Enrich with item names
    const codes = masters.all().map(m => m.itemCode)
    const items = await Item.query().whereIn('code', codes)
    const nameMap = new Map(items.map(i => [i.code, i.name]))

    return {
      meta: masters.getMeta(),
      data: masters.all().map(m => ({
        ...m.toJSON(),
        itemName: nameMap.get(m.itemCode) || m.itemCode,
      }))
    }
  }

  async stocks_list({ request, auth }: HttpContext) {
    const { page, perPage } = await request.validateUsing(listRequestValidator)
    const user = auth.user as User
    return await user.related('stockMovements').query()
      .orderBy('created_at', 'desc')
      .paginate(page || 1, perPage || 10)
  }

  async stocks_save({ request, response, auth }: HttpContext) {
    // We'll manually extract fields to support both strict and simplified payloads
    const body = request.all()

    try {
      const user = auth.user as User

      if (user.isTrainingMode) {
        return response.forbidden({ error: 'Stock movements are disabled in Training Mode. Disable training mode to record real stock changes.' })
      }

      const storedAndReleasedNo = Number(user.lastStockNo) + 1
      
      let ebmItems: any[] = []
      
      if (body.items) {
        ebmItems = body.items
      } else if (body.itemCd) {
        // Simplified payload: fetch item details from DB
        const dbItem = await user.related('items').query().where('code', body.itemCd).first()
        if (!dbItem) return response.badRequest({ resultMsg: `Item not found: ${body.itemCd}` })
        
        ebmItems = [{
          sequenceNo: 1,
          code: dbItem.code,
          classificationCode: dbItem.classificationCode,
          name: dbItem.name,
          barcode: dbItem.barcode,
          packageUnit: dbItem.packagingUnitCode,
          packageNo: 1,
          quantityUnit: dbItem.quantityUnitCode,
          quantity: Number(body.quantity),
          price: Number(body.unitCost || dbItem.defaultUnitPrice),
          supplyPrice: Number(body.quantity) * Number(body.unitCost || dbItem.defaultUnitPrice),
          discountAmount: 0,
          taxationType: dbItem.taxTypeCode,
          taxableAmount: Number(body.quantity) * Number(body.unitCost || dbItem.defaultUnitPrice),
          taxAmount: 0, // This should ideally be calculated but EBM will accept it if set correctly later
          totalAmount: Number(body.quantity) * Number(body.unitCost || dbItem.defaultUnitPrice),
        }]
      } else {
        return response.badRequest({ resultMsg: 'The items field must be defined' })
      }

      const ebmItemData: any = {
        storedAndReleasedNo,
        registrationType: EbmRegistrationType.Manual,
        storedAndReleasedType: body.storedAndReleasedType,
        occuredDt: body.occuredDt || DateTime.now().toFormat('yyyyMMdd'),
        originalStoredAndReleaseNo: body.originalStoredAndReleaseNo || 0,
        items: ebmItems,
        totalItem: ebmItems.length,
        totalAmount: ebmItems.reduce((acc, it) => acc + it.totalAmount, 0),
        totalTaxableAmount: ebmItems.reduce((acc, it) => acc + it.taxableAmount, 0),
        totalTaxAmount: 0,
        remark: body.remark || '',
        branchId: body.branchId || user.branchId,
      }

      const res = (await new EbmStocksService(user).saveStock(ebmItemData)) as EbmDefaultResponse

      if (res.resultCd === EbmApiResponseCode.ServerSucceeded) {
        user.lastStockNo = storedAndReleasedNo
        const { tin, ...stockData } = ebmItemData
        const [stock] = await Promise.all([
          await Stock.create({
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

        // Update local StockMaster quantity
        const isIncoming = Number(body.storedAndReleasedType) < 10
        const qty = Number(body.quantity)
        const itemCode = body.itemCd
        const stockMaster = await user.related('stockMasters').query().where({ itemCode }).first()
        if (stockMaster) {
          const newQty = isIncoming
            ? stockMaster.remainQuantity + qty
            : Math.max(0, stockMaster.remainQuantity - qty)
          await stockMaster.merge({ remainQuantity: newQty }).save()
        } else if (isIncoming) {
          await user.related('stockMasters').create({
            itemCode,
            remainQuantity: qty,
            branchId: user.branchId,
            registrantId: user.tin.toString(),
            registrantName: user.taxPayerName,
            modifierId: user.tin.toString(),
            modifierName: user.taxPayerName,
            originalStoredAndReleaseNo: storedAndReleasedNo,
          })
        }

        return stock
      }
      
      return response.badRequest(res)
    } catch (error) {
      if (error.name === 'HTTPError') {
        const errorJson = await error.response.json()
        console.log({ errorJson })
      }

      if (error?.cause?.code === 'ECONNREFUSED') {
        return response.serviceUnavailable({ resultMsg: 'EBM server is not connected!' })
      }

      console.error(error)
      return response.badRequest(error)
    }
  }

  async stocks_save_with_items({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(saveStockWithItemsValidator)

    try {
      const user = auth.user as User

      if (user.isTrainingMode) {
        return response.forbidden({ error: 'Stock movements are disabled in Training Mode. Disable training mode to record real stock changes.' })
      }

      // 2.12 — Return types (IncomingReturn=03, OutgoingReturn=12) must reference an original movement
      const returnTypes = [EbmStockInOutType.IncomingReturn, EbmStockInOutType.OutgoingReturn]
      if (returnTypes.includes(payload.storedAndReleasedType as EbmStockInOutType) && !payload.originalStoredAndReleaseNo) {
        return response.badRequest({
          error: `originalStoredAndReleaseNo is required for return movement type "${payload.storedAndReleasedType}".`,
        })
      }

      const storedAndReleasedNo = Number(user.lastStockNo) + 1

      const items = await this.convertItems(payload.items)
      const taxes = this.getTaxRatesAndAmounts(items)
      const ebmItemData: EbmStock = {
        ...payload,
        ...taxes,
        occuredDt: payload.occuredDt || DateTime.now().toFormat('yyyyMMdd'),
        storedAndReleasedNo,
        originalStoredAndReleaseNo: payload.originalStoredAndReleaseNo || storedAndReleasedNo,
        registrationType: EbmRegistrationType.Manual,
        items,
        totalItem: items.length,
      }

      const res = (await new EbmStocksService(user).saveStock(ebmItemData)) as EbmDefaultResponse

      if (res.resultCd === EbmApiResponseCode.ServerSucceeded) {
        const { tin, ...stockData } = ebmItemData
        const [stock] = await Promise.all([
          await Stock.create({
            ...stockData,
            items: { data: stockData.items },
            userId: user.id,
          }),
          user.save(),
        ])

        // Update local StockMaster quantity for each item in the batch
        const isIncoming = Number(payload.storedAndReleasedType) < 10
        for (const item of payload.items) {
          const stockMaster = await user.related('stockMasters').query().where({ itemCode: item.itemCd }).first()
          if (stockMaster) {
            const newQty = isIncoming
              ? stockMaster.remainQuantity + item.quantity
              : Math.max(0, stockMaster.remainQuantity - item.quantity)
            await stockMaster.merge({ remainQuantity: newQty }).save()
          } else if (isIncoming) {
            await user.related('stockMasters').create({
              itemCode: item.itemCd,
              remainQuantity: item.quantity,
              branchId: user.branchId,
              registrantId: user.tin.toString(),
              registrantName: user.taxPayerName,
              modifierId: user.tin.toString(),
              modifierName: user.taxPayerName,
              originalStoredAndReleaseNo: storedAndReleasedNo,
            })
          }
        }

        return stock
      }

      return response.badRequest(res)
    } catch (error) {
      if (error?.cause?.code === 'ECONNREFUSED') {
        return response.serviceUnavailable({ resultMsg: 'EBM server is not connected!' })
      }

      console.error(error)
      return response.badRequest(error)
    }
  }

  async stocks_master_save({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(saveStockMasterValidator)

    try {
      const user = auth.user as User

      if (user.isTrainingMode) {
        return response.forbidden({ error: 'Inventory Count is disabled in Training Mode. Disable training mode before performing stock reconciliation.' })
      }

      const ebmItemData: InventoryItem = {
        ...payload,
        tin: user.tin,
        stockTyCd: payload.stockTyCd ?? '3',
        registrantId: user.tin.toString(),
        registrantName: user.taxPayerName,
        modifierId: user.tin.toString(),
        modifierName: user.taxPayerName,
        deviceSerialNo: user.serialNo,
      }

      const res = (await new EbmStocksService(user).saveStockMaster(ebmItemData)) as EbmDefaultResponse

      if (res.resultCd === EbmApiResponseCode.ServerSucceeded) {
        return await user.related('stockMasters').updateOrCreate(
          { itemCode: payload.itemCode },
          {
            branchId: payload.branchId ?? user.branchId,
            remainQuantity: payload.remainQuantity,
            registrantId: user.tin.toString(),
            registrantName: user.taxPayerName,
            modifierId: user.tin.toString(),
            modifierName: user.taxPayerName,
          }
        )
      }

      return response.badRequest(res)
    } catch (error) {
      if (error?.cause?.code === 'ECONNREFUSED') {
        return response.serviceUnavailable({ resultMsg: 'EBM server is not connected!' })
      }

      console.error(error)
      return response.badRequest(error)
    }
  }

  async stocks_sync({ response, auth }: HttpContext) {
    try {
      const user = auth.user as User
      const stockAdded = await StockAction.syncStockItems(user)

      return { stockAdded }
    } catch (error) {
      return this.catchErrors(response, error)
    }
  }

  // F-20 §9.4 — Internal stock transfer between branches under the same TIN
  async stocks_transfer({ request, response, auth }: HttpContext) {
    try {
      const user = auth.user as User
      const { itemCode, quantity, toBranchId, remark } = request.only(['itemCode', 'quantity', 'toBranchId', 'remark'])

      if (!itemCode || !quantity || !toBranchId) {
        return response.badRequest({ error: 'itemCode, quantity and toBranchId are required' })
      }
      if (toBranchId === user.branchId) {
        return response.badRequest({ error: 'Source and destination branch must be different' })
      }

      // Verify destination branch shares the same TIN
      const destBranch = await Branch.query().where('tin', String(user.tin)).where('branch_id', toBranchId).first()
      if (!destBranch) {
        return response.badRequest({ error: 'Destination branch not found or belongs to a different TIN' })
      }

      // Check available stock at source
      const sourceMaster = await user.related('stockMasters').query().where('item_code', itemCode).first()
      if (!sourceMaster || sourceMaster.remainQuantity < Number(quantity)) {
        return response.badRequest({ error: `Insufficient stock. Available: ${sourceMaster?.remainQuantity ?? 0}` })
      }

      const transferRemark = remark || '02'

      // OUT from source branch
      const newSourceQty = sourceMaster.remainQuantity - Number(quantity)
      const outData: InventoryItem = {
        tin: user.tin, branchId: user.branchId, itemCode,
        remainQuantity: newSourceQty, stockTyCd: '3',
        registrantId: user.tin.toString(), registrantName: user.taxPayerName,
        modifierId: user.tin.toString(), modifierName: user.taxPayerName,
        deviceSerialNo: user.serialNo,
      }
      const outRes = await new EbmStocksService(user).saveStockMaster(outData) as EbmDefaultResponse
      if (outRes.resultCd !== EbmApiResponseCode.ServerSucceeded) {
        return response.badRequest({ error: `EBM OUT failed: ${outRes.resultMsg}` })
      }
      await sourceMaster.merge({ remainQuantity: newSourceQty }).save()

      // IN at destination branch
      const destMaster = await StockMaster.query()
        .where('item_code', itemCode).where('branch_id', toBranchId).first()
      const newDestQty = (destMaster?.remainQuantity ?? 0) + Number(quantity)

      const inData: InventoryItem = {
        tin: user.tin, branchId: toBranchId, itemCode,
        remainQuantity: newDestQty, stockTyCd: '3',
        registrantId: user.tin.toString(), registrantName: user.taxPayerName,
        modifierId: user.tin.toString(), modifierName: user.taxPayerName,
        deviceSerialNo: user.serialNo,
      }
      const inRes = await new EbmStocksService(user).saveStockMaster(inData) as EbmDefaultResponse
      if (inRes.resultCd !== EbmApiResponseCode.ServerSucceeded) {
        return response.badRequest({ error: `EBM IN failed: ${inRes.resultMsg}` })
      }

      if (destMaster) {
        await destMaster.merge({ remainQuantity: newDestQty }).save()
      } else {
        await StockMaster.create({
          itemCode, branchId: toBranchId, remainQuantity: newDestQty,
          tin: user.tin.toString(),
          registrantId: user.tin.toString(), registrantName: user.taxPayerName,
          modifierId: user.tin.toString(), modifierName: user.taxPayerName,
          originalStoredAndReleaseNo: 0,
        })
      }

      return {
        success: true,
        message: `Transferred ${quantity} units of ${itemCode} → branch ${toBranchId}`,
        sourceBranch: user.branchId, destBranch: toBranchId,
        itemCode, quantity: Number(quantity), remark: transferRemark,
      }
    } catch (error) {
      return this.catchErrors(response, error)
    }
  }

  // F-11 §5.2 — Pull items registered in EBM that are not yet in local DB
  // Uses delta sync via user.itemLastReqDt — only new/changed items since last sync
  async items_sync({ response, auth }: HttpContext) {
    try {
      const user = auth.user as User
      const itemsSynced = await StockAction.syncItems(user)
      return { itemsSynced }
    } catch (error) {
      return this.catchErrors(response, error)
    }
  }

  private async convertItems(items: EbmStockWithItem[]) {
    const convertedItems = items.map((item, index) => {
      const supplyPrice = item.price * item.quantity
      const taxableAmount = supplyPrice - item.discountAmount
      const rate = getTaxRateByType(item.taxationType)
      const taxAmount =
        rate > 0 ? (getTaxAmountByType(item.taxationType) * taxableAmount) / rate : 0

      const totalAmount = taxableAmount

      return {
        ...item,
        sequenceNo: index + 1,
        quantity: parseFloat(item.quantity.toFixed(2)),
        price: parseFloat(item.price.toFixed(2)),
        supplyPrice: parseFloat(supplyPrice.toFixed(2)),
        taxAmount: parseFloat(taxAmount.toFixed(2)),
        taxableAmount: parseFloat(taxableAmount.toFixed(2)),
        totalAmount: parseFloat(totalAmount.toFixed(2)),
      }
    })

    return Promise.resolve(convertedItems)
  }

  private getTaxRatesAndAmounts(items: EbmStockItem[]) {
    const caluclateTaxableAmount = (items: EbmStockItem[]) =>
      items.length <= 0
        ? parseFloat('0.00')
        : items.map((v) => v.taxableAmount).reduce((a, b) => a + b)

    const caluclateTaxAmount = (items: EbmStockItem[]) =>
      items.length <= 0 ? parseFloat('0.00') : items.map((v) => v.taxAmount).reduce((a, b) => a + b)

    const taxableAmountAItems = items.filter((item) => item.taxationType === EbmTaxType.A)
    const taxableAmountA = caluclateTaxableAmount(taxableAmountAItems)

    const taxAmountA = parseFloat('0.00')

    const taxableAmountBItems = items.filter((item) => item.taxationType === EbmTaxType.B)
    const taxableAmountB = caluclateTaxableAmount(taxableAmountBItems)
    const taxAmountB = caluclateTaxAmount(taxableAmountBItems)

    const taxableAmountCItems = items.filter((item) => item.taxationType === EbmTaxType.C)
    const taxableAmountC = caluclateTaxableAmount(taxableAmountCItems)
    const taxAmountC = caluclateTaxAmount(taxableAmountCItems)

    const taxableAmountDItems = items.filter((item) => item.taxationType === EbmTaxType.D)
    const taxableAmountD = caluclateTaxableAmount(taxableAmountDItems)
    const taxAmountD = caluclateTaxAmount(taxableAmountDItems)

    const totalTaxAmount = taxAmountA + taxAmountB + taxAmountC + taxAmountD

    const totalTaxableAmount = taxableAmountA + taxableAmountB + taxableAmountC + taxableAmountD

    return {
      totalTaxableAmount,
      totalTaxAmount,
      totalAmount: totalTaxableAmount,
    }
  }
  //#endregion
}
