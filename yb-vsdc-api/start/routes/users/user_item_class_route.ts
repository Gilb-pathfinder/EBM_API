import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const UserItemClassController = () => import('#controllers/users/user_item_class_controller')

router
  .group(() => {
    router.get('/:branchId', [UserItemClassController, 'select'])
  })
  .prefix('/itemClass')
  .middleware(middleware.auth({ guards: ['api'] }))
