import vine from "@vinejs/vine";

export const listRequestValidatorObject = {
  page: vine.number().min(1).optional(),
  perPage: vine.number().min(1).max(100).optional()
}