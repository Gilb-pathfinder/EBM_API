// F-56: Settings Routes (Admin)

import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const SettingsController = () => import('#controllers/admin/settings_controller')

router
  .group(() => {
    // F-56: Settings endpoints
    router.get('/admin/settings', [SettingsController, 'index']) // Get all settings
    router.get('/admin/settings/:key', [SettingsController, 'show']) // Get specific setting
    router.patch('/admin/settings/:key', [SettingsController, 'update']) // Update setting

    // F-56: SMTP configuration endpoints
    router.get('/admin/settings/smtp/config', [SettingsController, 'getSmtp'])
    router.patch('/admin/settings/smtp/config', [SettingsController, 'updateSmtp'])

    // F-56: Webhook configuration endpoints
    router.get('/admin/settings/webhook/config', [SettingsController, 'getWebhook'])
    router.patch('/admin/settings/webhook/config', [SettingsController, 'updateWebhook'])

    // F-56: Timezone endpoints
    router.get('/admin/settings/timezone', [SettingsController, 'getTimezone'])
    router.patch('/admin/settings/timezone', [SettingsController, 'updateTimezone'])
  })
  .middleware(middleware.auth({ guards: ['admin'] }))
