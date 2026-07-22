import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'


const ReportsController = () => import('#controllers/users/user_reports_controller')

router.group(() => {
  router.get('/report/daily', [ReportsController, 'daily'])
  router.get('/report/period', [ReportsController, 'period'])
  router.get('/report/purchases', [ReportsController, 'purchases'])
  router.get('/report/x', [ReportsController, 'x_report'])
  router.get('/report/z', [ReportsController, 'z_report']) // F-46: Z Report (End of Day)
  router.get('/report/plu', [ReportsController, 'plu_report'])
  router.get('/report/ej', [ReportsController, 'ej'])
  router.get('/report/stock', [ReportsController, 'stock_movement'])
  router.get('/report/closing-stock', [ReportsController, 'closing_stock'])

}).middleware(middleware.auth({guards: ['api']}))