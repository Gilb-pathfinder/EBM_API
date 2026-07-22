import vine from '@vinejs/vine'

export const userLoginValidator = vine.compile(vine.object({
  email: vine.string().email(),
  password: vine.string()
}))

export const userEditValidator = vine.compile(vine.object({
  image: vine.file({extnames: ['png', 'PNG', 'jpg', 'JPG', 'jpeg', 'JPEG'], size: '2mb'}).optional().requiredIfMissing('imageLink'),
  imageLink: vine.string().optional().requiredIfMissing('image'),
  phoneNumberTwo: vine.string().optional(),
  mrc: vine.string().optional(),
  serialNo: vine.string().optional()
}))

export const userPurchaseCodeValidator = vine.compile(
  vine.object({
    buyerTel: vine.string().fixedLength(10),
    buyerTin: vine.string().fixedLength(9),
    sellerTin: vine.string().fixedLength(9)
  })
)

