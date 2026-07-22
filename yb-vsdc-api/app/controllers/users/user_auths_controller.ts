import User from '#models/user'
import { userLoginValidator } from '#validators/users/user_validator'
import type { HttpContext } from '@adonisjs/core/http'

export default class UserAuthsController {
  async login({ request, response }: HttpContext) {
    const payload = await request.validateUsing(userLoginValidator)
    
    const user = await User.verifyCredentials(payload.email, payload.password)

      try {
        const token = await User.accessTokens.create(user)
  
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