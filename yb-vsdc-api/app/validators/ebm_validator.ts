import {
  EbmCountryCode,
  EbmPackagingUnit,
  EbmProductType,
  EbmUnitOfQuantity,
} from '#types/ebm/ebm_type'
import vine from '@vinejs/vine'
import { listRequestValidatorObject } from './objects/list_request_object.js'

export const lastRequestDateValidatorObject = vine.object({
  year: vine.string().fixedLength(4).optional(),
  month: vine.string().fixedLength(2).optional().requiredIfExists('year'),
  day: vine.string().fixedLength(2).optional().requiredIfExists('month'),
  hour: vine.string().fixedLength(2).optional(),
  minute: vine.string().fixedLength(2).optional(),
  second: vine.string().fixedLength(2).optional(),
})

export const ebmItemClassificationCodeValidatorObject = vine.object({
  countryCode: vine.enum(Object.values(EbmCountryCode)),
  productType: vine.enum(Object.values(EbmProductType)),
  packingUnit: vine.enum(Object.values(EbmPackagingUnit)),
  quantityUnit: vine.enum(Object.values(EbmUnitOfQuantity)),
})

export const listRequestValidator = vine.compile(vine.object({
  ...listRequestValidatorObject
}))