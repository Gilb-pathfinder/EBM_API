import vine from '@vinejs/vine'

export const periodReportValidator = vine.compile(
  vine.object({
    start: vine.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    end: vine.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    size: vine.string().optional(),
  })
)

export const closingStockValidator = vine.compile(
  vine.object({
    date: vine.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  })
)

export const purchaseReportValidator = vine.compile(
  vine.object({
    start: vine.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    end: vine.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    size: vine.string().optional(),
  })
)
