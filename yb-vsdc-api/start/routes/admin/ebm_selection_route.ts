import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const EbmSelectionsController = () => import('#controllers/admins/ebm_selections_controller')

router.get('/admin/auth-debug', async ({ auth }) => {
  try {
    await auth.authenticateUsing(['admin'])
    return { message: 'Authenticated as admin', user: auth.user }
  } catch (e) {
    try {
      await auth.authenticateUsing(['api'])
      return { message: 'Authenticated as user (api)', user: auth.user }
    } catch (e2) {
      return { message: 'Failed to authenticate with both guards', adminError: e.message, apiError: e2.message }
    }
  }
})

router.group(() => {
  router.post('/ebm/branch/users', [EbmSelectionsController, 'selectBranchUsers'])
  router.post('/ebm/branch/insurances', [EbmSelectionsController, 'selectBranchInsurances'])
  router.post('/ebm/stock/items', [EbmSelectionsController, 'selectStockItems'])
})
  .prefix('/admin')
  .middleware(middleware.auth({ guards: ['admin'] }))
