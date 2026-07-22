import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const AdminBranchesController = () => import('#controllers/admins/admin_branches_controller')
const AdminStatsController     = () => import('#controllers/admins/admin_stats_controller')

router
  .group(() => {
    router.get('/stats',          [AdminStatsController,   'index'])
    router.get('/branches',       [AdminBranchesController, 'list'])
    router.post('/branches',      [AdminBranchesController, 'create'])
    router.patch('/branches/:id', [AdminBranchesController, 'update'])
    router.delete('/branches/:id',[AdminBranchesController, 'deleteOne'])
  })
  .prefix('/admin')
  .middleware(middleware.auth({ guards: ['admin'] }))
