import Admin from '#models/admin'
import env from '#start/env'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await Admin.updateOrCreate(
      { email: env.get('ADMIN_EMAIL') },
      {
        fullName: env.get('ADMIN_FULL_NAME'),
        password: env.get('ADMIN_PASSWORD'),
        tin: env.get('ADMIN_TIN'),
        serialNo: env.get('ADMIN_SERIAL_NO'),
      }
    )
  }
}