import vine from '@vinejs/vine'

export const ebmSelectionValidator = vine.compile(
  vine.object({
    tin: vine.number().optional(),
    branchId: vine.string().optional(),
    lastRequestDt: vine.string().optional(),
  })
)
