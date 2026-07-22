import vine from '@vinejs/vine'
import { EbmYesOrNo } from '#types/ebm/ebm_service_type'

export const userBranchFindValidator = vine.compile(vine.object({
  dt: vine.string().fixedLength(14)
}))

export const saveBranchCustomerValidator = vine.compile(
  vine.object({
    branchId: vine.string().trim().fixedLength(2),
    customerPhoneNumber: vine
      .string()
      .trim()
      .fixedLength(10)
      .parse((v) => (typeof v === 'string' ? v.replace('+25', '') : v)),
    customerTin: vine.number().min(9),
    customerName: vine.string().maxLength(60),
    address: vine.string().maxLength(300).optional(),
    contact: vine.string().trim().maxLength(20).optional(),
    email: vine.string().trim().email().optional(),
    faxNumber: vine.string().trim().maxLength(20).optional(),
    used: vine.enum(EbmYesOrNo),
    remark: vine.string().trim().maxLength(1000).optional(),
  })
)

export const updateBranchCustomerValidator = vine.compile(
  vine.object({
    id: vine.string().uuid(),
    branchId: vine.string().trim().fixedLength(2),
    customerPhoneNumber: vine
      .string()
      .trim()
      .fixedLength(10)
      .parse((v) => (typeof v === 'string' ? v.replace('+25', '') : v)),
    customerTin: vine.number().min(9),
    customerName: vine.string().maxLength(60),
    address: vine.string().maxLength(300).optional(),
    contact: vine.string().trim().maxLength(20).optional(),
    email: vine.string().trim().email().optional(),
    faxNumber: vine.string().trim().maxLength(20).optional(),
    used: vine.enum(EbmYesOrNo),
    remark: vine.string().trim().maxLength(1000).optional(),
  })
)

export const saveBranchUserValidator = vine.compile(
  vine.object({
    branchId: vine.string().trim().minLength(1).maxLength(2),
    userName: vine.string().trim().maxLength(60),
    address: vine.string().trim().maxLength(200).optional(),
    contact: vine
      .string()
      .trim()
      .maxLength(20)
      .parse((v) => (typeof v === 'string' ? v.replace('+25', '') : v))
      .optional(),
    authorityCode: vine.string().trim().maxLength(100).optional(),
    remark: vine.string().trim().maxLength(2000).optional(),
    used: vine.enum(EbmYesOrNo),
  })
)

export const updateBranchUserValidator = vine.compile(
  vine.object({
    id: vine.string().uuid(),
    branchId: vine.string().trim().minLength(1).maxLength(2),
    userName: vine.string().trim().maxLength(60),
    address: vine.string().trim().maxLength(200).optional(),
    contact: vine
      .string()
      .trim()
      .maxLength(20)
      .parse((v) => (typeof v === 'string' ? v.replace('+25', '') : v))
      .optional(),
    authorityCode: vine.string().trim().maxLength(100).optional(),
    remark: vine.string().trim().maxLength(2000).optional(),
    used: vine.enum(EbmYesOrNo),
  })
)

export const saveBranchInsuranceValidator = vine.compile(
  vine.object({
    branchId: vine.string().trim().minLength(1).maxLength(2),
    insuranceName: vine.string().trim().maxLength(100),
    premiumRate: vine.number().positive().min(0).max(100),
    used: vine.enum(Object.values(EbmYesOrNo))
  })
)
