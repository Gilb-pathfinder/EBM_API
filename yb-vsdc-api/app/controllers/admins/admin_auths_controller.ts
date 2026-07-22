import Admin from '#models/admin'
import { adminLoginValidator } from '#validators/admin_validator'
import type { HttpContext } from '@adonisjs/core/http'

export default class AdminController {
  async login({ request, response }: HttpContext) {
    const payload = await request.validateUsing(adminLoginValidator)
    
    const admin = await Admin.verifyCredentials(payload.email, payload.password)

    try {

      const token = await Admin.accessTokens.create(admin)

      return {
        type: token.type,
        value: token.value!.release(),
        msg: 'Login Successfully',
      }
    } catch (error) {
      console.error(error)
      return response.notFound({ msg: 'Cannot Login' })
    }
  }
}
