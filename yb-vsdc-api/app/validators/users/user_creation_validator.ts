import vine from '@vinejs/vine'

export const userCreationStoreValidator = vine.compile(vine.object({
  fullName: vine.string(),
  email: vine.string().email(),
  password: vine.string(),
  tin: vine.number(),
  phoneNumber: vine.string().regex(/(07|08)[0-9]{8}/),
  phoneNumberTwo: vine.string().optional(),
  image: vine.file({extnames: ['png', 'PNG', 'jpg', 'JPG', 'jpeg', 'JPEG'], size: '2mb'}).optional(),
  imageLink: vine.string().optional(),
  mrc: vine.string(),
  serialNo: vine.string()
}))

export const userUpdateValidator = vine.compile(vine.object({
  tin: vine.number(),
  email: vine.string().email(),
  fullName: vine.string().optional(),
  password: vine.string().optional(),
  taxPayerName: vine.string().optional(),
  phoneNumber: vine.string().optional(),
  phoneNumberTwo: vine.string().optional(),
  province: vine.string().optional(),
  district: vine.string().optional(),
  sector: vine.string().optional(),
  address: vine.string().optional(),
  image: vine.file({extnames: ['png', 'PNG', 'jpg', 'JPG', 'jpeg', 'JPEG'], size: '2mb'}).optional(),
  imageLink: vine.string().optional(),
  mrc: vine.string().optional(),
  serialNo: vine.string().optional(),
  branchId: vine.string().fixedLength(2).optional(),
  newEmail: vine.string().email().optional(),
}))