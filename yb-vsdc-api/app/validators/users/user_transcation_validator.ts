import vine from '@vinejs/vine'

export const userTransactionListQsValidator = vine.compile(vine.object({
  page: vine.number().min(1).optional(),
  perPage: vine.number().min(1).max(50).optional()
}))


export const userTransactionFindQsValidator = vine.compile(vine.object({
  id: vine.string().optional(),
  invoiceNo: vine.number().optional(),
  ebmInternalData: vine.string().optional(),
  ebmReceiptSignature: vine.string().optional()
}))


