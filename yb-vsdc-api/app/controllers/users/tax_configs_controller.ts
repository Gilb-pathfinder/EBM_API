import TaxConfig from '#models/tax_config'
import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'

export default class TaxConfigsController {
  async index({}: HttpContext) {
    return await TaxConfig.query().orderBy('tax_type', 'asc')
  }

  async update({ request, params }: HttpContext) {
    const config = await TaxConfig.findOrFail(params.id)
    
    const validator = vine.compile(
      vine.object({
        rate: vine.number().optional(),
        divider: vine.number().optional(),
        isActive: vine.boolean().optional(),
      })
    )
    
    const payload = await request.validateUsing(validator)
    
    if (payload.rate !== undefined) config.rate = payload.rate
    if (payload.divider !== undefined) config.divider = payload.divider
    if (payload.isActive !== undefined) config.isActive = payload.isActive
    
    await config.save()
    return config
  }
}
