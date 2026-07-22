import {
  EbmPackagingUnit,
  EbmStockInOutType,
  EbmTaxType,
  EbmUnitOfQuantity,
} from '#types/ebm/ebm_type'
import vine from '@vinejs/vine'

export const saveStockValidator = vine.compile(
  vine.object({
    tin: vine.number().optional(),
    deviceSerialNo: vine.string().optional(),
    branchId: vine.string().optional(),
    customerTin: vine.string().optional().requiredIfExists('customerBranchId'),
    customerName: vine.string().optional(),
    customerBranchId: vine.string().optional().requiredIfExists('customerTin'),
    storedAndReleasedType: vine.enum(Object.values(EbmStockInOutType)),
    occuredDt: vine.string().optional(),
    totalItem: vine.number().optional(),
    totalTaxableAmount: vine.number().optional(),
    totalTaxAmount: vine.number().optional(),
    totalAmount: vine.number().optional(),
    remark: vine.string().optional(),
    originalStoredAndReleaseNo: vine.number().optional(),
    items: vine.array(
      vine.object({
        sequenceNo: vine.number(),
        code: vine.string(),
        classificationCode: vine.string(),
        name: vine.string(),
        barcode: vine.string().optional(),
        packageUnit: vine.enum(Object.values(EbmPackagingUnit)),
        packageNo: vine.number(),
        quantityUnit: vine.enum(Object.values(EbmUnitOfQuantity)),
        quantity: vine.number(),
        itemExpireDt: vine.string().optional(),
        price: vine.number(),
        supplyPrice: vine.number(),
        discountAmount: vine.number(),
        taxationType: vine.enum(Object.values(EbmTaxType)),
        taxableAmount: vine.number(),
        taxAmount: vine.number(),
        totalAmount: vine.number(),
        expirationDate: vine.string().optional(),
      })
    ),
  })
)


export const saveStockWithItemsValidator = vine.compile(
  vine.object({
    tin: vine.number().optional(),
    deviceSerialNo: vine.string().optional(),
    branchId: vine.string(),
    customerTin: vine.string().optional().requiredIfExists('customerBranchId'),
    customerName: vine.string().optional(),
    customerBranchId: vine.string().optional().requiredIfExists('customerTin'),
    storedAndReleasedType: vine.enum(Object.values(EbmStockInOutType)),
    originalStoredAndReleaseNo: vine.number().exists({table: 'stocks', column: 'stored_and_released_no'}).optional(),
    occuredDt: vine.string().optional(),
    remark: vine.string().optional(),
    items: vine.array(
      vine.object({
        code: vine.string(),
        classificationCode: vine.string(),
        name: vine.string(),
        barcode: vine.string().optional(),
        packageUnit: vine.enum(Object.values(EbmPackagingUnit)),
        packageNo: vine.number(),
        quantityUnit: vine.enum(Object.values(EbmUnitOfQuantity)),
        quantity: vine.number(),
        itemExpireDt: vine.string().optional(),
        price: vine.number(),
        discountAmount: vine.number(),
        taxationType: vine.enum(Object.values(EbmTaxType)),
        expirationDate: vine.string().optional(),
      })
    ),
  })
)


export const saveStockMasterValidator = vine.compile(
  vine.object({
    tin: vine.number().optional(),
    deviceSerialNo: vine.string().optional(),
    branchId: vine.string(),
    itemCode: vine.string(),
    remainQuantity: vine.number(),
    // §9.1: 1=Opening Stock, 2=Purchase IN, 3=Manual Adjustment
    stockTyCd: vine.enum(['1', '2', '3']).optional(),
  })
)
