import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'


const ReportsController = () => import('#controllers/users/user_receipts_controller')

router.group(() => {
  router.get('/receipt/:id', [ReportsController, 'receipt']).as('user.receipt')
  
}).middleware(middleware.auth({guards: ['api']}))

router.get('/test/receipt/design', [ReportsController, 'receipt_design_test'])