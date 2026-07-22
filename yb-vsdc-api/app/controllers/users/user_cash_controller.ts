import User from '#models/user'
import { CashMovementType } from '#models/cash_movement'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import vine from '@vinejs/vine'

const cashMovementValidator = vine.compile(
  vine.object({
    amount: vine.number().min(0.01),
    description: vine.string().optional(),
  })
)

const listQueryValidator = vine.compile(
  vine.object({
    date: vine.string().optional(), // ISO date YYYY-MM-DD
  })
)

export default class UserCashController {
  // Art. 7.12 — Register cash deposit
  async deposit({ request, response, auth }: HttpContext) {
    try {
      const payload = await request.validateUsing(cashMovementValidator)
      const user = auth.user as User

      const movement = await user.related('cashMovements').create({
        movementType: CashMovementType.Deposit,
        amount: payload.amount,
        description: payload.description ?? null,
        occurredDt: DateTime.now().toFormat('yyyyMMddHHmmss'),
      })

      return movement
    } catch (error) {
      return response.badRequest({ error: error.message || 'Failed to register deposit' })
    }
  }

  // Art. 7.12 — Register cash withdrawal
  async withdrawal({ request, response, auth }: HttpContext) {
    try {
      const payload = await request.validateUsing(cashMovementValidator)
      const user = auth.user as User

      const movement = await user.related('cashMovements').create({
        movementType: CashMovementType.Withdrawal,
        amount: payload.amount,
        description: payload.description ?? null,
        occurredDt: DateTime.now().toFormat('yyyyMMddHHmmss'),
      })

      return movement
    } catch (error) {
      return response.badRequest({ error: error.message || 'Failed to register withdrawal' })
    }
  }

  // List cash movements for a day (defaults to today)
  async list({ request, auth }: HttpContext) {
    const { date } = await request.validateUsing(listQueryValidator)
    const user = auth.user as User

    const targetDate = date ? DateTime.fromISO(date) : DateTime.now()
    const startOfDay = targetDate.startOf('day')
    const endOfDay = targetDate.endOf('day')

    return await user.related('cashMovements').query()
      .andWhereBetween('created_at', [startOfDay.toSQL()!!, endOfDay.toSQL()!!])
      .orderBy('created_at', 'asc')
  }
}
