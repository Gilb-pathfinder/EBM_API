import { EbmYesOrNo } from '#types/ebm/ebm_service_type'
import {
  EbmCountryCode,
  EbmPackagingUnit,
  EbmProductType,
  EbmTaxType,
  EbmUnitOfQuantity,
} from '#types/ebm/ebm_type'
import vine from '@vinejs/vine'
import { ebmItemClassificationCodeValidatorObject } from './ebm_validator.js'
import { listRequestValidatorObject } from '#validators/objects/list_request_object'

export const saveItemValidator = vine.compile(
  vine.object({
    code: ebmItemClassificationCodeValidatorObject,
    classificationCode: vine.string().trim(),
    typeCode: vine.enum(Object.values(EbmProductType)),
    name: vine.string().trim(),
    standarName: vine.string().optional(),
    originalNationCode: vine.enum(Object.values(EbmCountryCode)),
    packagingUnitCode: vine.enum(Object.values(EbmPackagingUnit)),
    quantityUnitCode: vine.enum(Object.values(EbmUnitOfQuantity)),
    taxTypeCode: vine.enum(Object.values(EbmTaxType)),
    batchNo: vine.string().maxLength(10).optional(),
    barcode: vine.string().optional(),
    defaultUnitPrice: vine.number(),
    groupPriceOne: vine.number().optional(),
    groupPriceTwo: vine.number().optional(),
    groupPriceThree: vine.number().optional(),
    groupPriceFour: vine.number().optional(),
    groupPriceFive: vine.number().optional(),
    additinalInfo: vine.string().maxLength(7).optional(),
    saftyQuantity: vine.number().optional(),
    insuranceApplicableYn: vine.enum(Object.values(EbmYesOrNo)),
    useYn: vine.enum(Object.values(EbmYesOrNo)),
    cisProductId: vine.string().trim(),
    tin: vine.number().optional(),
    branchId: vine.string().optional(),
    deviceSerialNo: vine.string().optional(),
  })
)

export const updateItemValidator = vine.compile(
  vine.object({
    items: vine.array(
      vine.object({
        id: vine.string(),
        name: vine.string().trim().optional(),
        typeCode: vine.enum(Object.values(EbmProductType)).optional(),
        taxTypeCode: vine.enum(Object.values(EbmTaxType)).optional(),
        defaultUnitPrice: vine.number().optional(),
        useYn: vine.enum(Object.values(EbmYesOrNo)).optional(),
        cisProductId: vine.string(),
      })
    ),
  })
)

export const selectItemValidatorQs = vine.compile(
  vine.object({
    dt: vine.string(),
  })
)

export const selectItemValidator = vine.compile(
  vine.object({
    branchId: vine.string(),
  })
)

export const approveImportItemValidator = vine.compile(
  vine.object({
    id: vine.string(),
    cisProductId: vine.number().optional(),
    item: vine.object({
      name: vine.string(),
      barcode: vine.string().optional(),
      quantityUnit: vine.enum(Object.values(EbmUnitOfQuantity)),
      packingType: vine.enum(Object.values(EbmPackagingUnit)),
      taxTypeCode: vine.enum(Object.values(EbmTaxType)),
      useYn: vine.enum(Object.values(EbmYesOrNo)),
      insuranceApplicableYn: vine.enum(Object.values(EbmYesOrNo)),
      productType: vine.enum(EbmProductType),
      classificationCode: vine.string(),
    }),
  })
)
export const cancelImportItemValidator = vine.compile(
  vine.object({
    id: vine.string(),
    remark: vine.string().optional()
  })
)

export const listItemClassficationCodeValidator = vine.compile(vine.object({
  q:       vine.string().optional(), // OR search: name or code
  name:    vine.string().optional(),
  code:    vine.string().optional(),
  taxType: vine.string().optional(),
  ...listRequestValidatorObject
}))

export const deleteItemValidator = vine.compile(
  vine.object({
    code: vine.string().trim(),
  })
)

export const saveItemCompositionValidator = vine.compile(
  vine.object({
    itemCode: vine.string().trim(),
    compositions: vine.array(
      vine.object({
        itemCode: vine.string().trim(),
        quantity: vine.number(),
        cost: vine.number(),
      })
    ),
  })
)