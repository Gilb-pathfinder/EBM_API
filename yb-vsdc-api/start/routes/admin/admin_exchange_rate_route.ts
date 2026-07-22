import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const ExchangeRatesController = () => import('#controllers/users/exchange_rates_controller')

router
  .group(() => {
    router.post('/exchange-rates', [ExchangeRatesController, 'save'])
    router.delete('/exchange-rates/:id', [ExchangeRatesController, 'deactivate'])
  })
  .prefix('/admin')
  .middleware(middleware.auth({ guards: ['admin'] }))
