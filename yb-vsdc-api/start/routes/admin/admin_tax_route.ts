import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const TaxConfigsController = () => import('#controllers/users/tax_configs_controller')

router
  .group(() => {
    router.patch('/config/tax/:id', [TaxConfigsController, 'update'])
  })
  .middleware(middleware.auth({ guards: ['admin'] }))
