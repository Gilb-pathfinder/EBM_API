import User from '#models/user'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    const email = 'merchant@test.com'
    const newPassword = 'merchant123'

    const user = await User.findBy('email', email)

    if (!user) {
      console.log(`User "${email}" not found.`)
      return
    }

    // Assign plain text — withAuthFinder beforeSave hook hashes it automatically
    user.password = newPassword
    await user.save()

    console.log(`Password reset for "${email}" → new password: ${newPassword}`)
  }
}
