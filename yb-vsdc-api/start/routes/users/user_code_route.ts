import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const UserCodesController = () => import('#controllers/users/users_codes_controller')

router
  .group(() => {
    router.get('/:branchId', [UserCodesController, 'select'])

    router.get('/item/classification/list', [UserCodesController, 'item_classification_list'])
  })
  .prefix('/codes')
  .middleware(middleware.auth({ guards: ['api'] }))
