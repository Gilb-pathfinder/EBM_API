import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const UserCashController = () => import('#controllers/users/user_cash_controller')

router.group(() => {
  router.post('/cash/deposit', [UserCashController, 'deposit'])
  router.post('/cash/withdrawal', [UserCashController, 'withdrawal'])
  router.get('/cash/list', [UserCashController, 'list'])
}).middleware(middleware.auth({ guards: ['api'] }))
