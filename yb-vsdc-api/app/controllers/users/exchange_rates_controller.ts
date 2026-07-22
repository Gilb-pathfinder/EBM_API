import ExchangeRate from '#models/exchange_rate'
import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'

const saveValidator = vine.compile(vine.object({
  currencyCode: vine.string().maxLength(3).toUpperCase(),
  currencyName: vine.string().maxLength(60),
  rateToRwf:    vine.number().positive(),
  effectiveDate: vine.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  isActive:     vine.boolean().optional(),
}))

export default class ExchangeRatesController {
  // GET /config/exchange-rates — all active rates (operators + admin)
  async index({}: HttpContext) {
    return ExchangeRate.query()
      .where('is_active', true)
      .orderBy('currency_code', 'asc')
      .orderBy('effective_date', 'desc')
  }

  // GET /config/exchange-rates/today — today's rates keyed by currency code
  async today({}: HttpContext) {
    const today = new Date().toISOString().slice(0, 10)
    const rates = await ExchangeRate.query()
      .where('is_active', true)
      .where('effective_date', '<=', today)
      .orderBy('effective_date', 'desc')

    // Deduplicate — keep most recent rate per currency
    const map: Record<string, ExchangeRate> = {}
    for (const r of rates) {
      if (!map[r.currencyCode]) map[r.currencyCode] = r
    }
    return Object.values(map)
  }

  // POST /admin/exchange-rates — admin creates/updates a rate
  async save({ request }: HttpContext) {
    const payload = await request.validateUsing(saveValidator)
    return ExchangeRate.updateOrCreate(
      { currencyCode: payload.currencyCode, effectiveDate: payload.effectiveDate },
      { ...payload, isActive: payload.isActive ?? true }
    )
  }

  // DELETE /admin/exchange-rates/:id — admin deactivates a rate
  async deactivate({ params, response }: HttpContext) {
    const rate = await ExchangeRate.findOrFail(params.id)
    rate.isActive = false
    await rate.save()
    return response.ok({ message: `Rate for ${rate.currencyCode} deactivated` })
  }
}
