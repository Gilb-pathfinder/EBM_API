import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const UserNoticesController = () => import('#controllers/users/users_notices_controller')

router
  .group(() => {
    router.get('/', [UserNoticesController, 'select'])
    router.get('/selectNotices/:branchId', [UserNoticesController, 'selectNotices'])
    router.post('/selectNotices/:branchId', [UserNoticesController, 'selectNotices'])
  })
  .prefix('/notices')
  .middleware(middleware.auth({ guards: ['api'] }))
