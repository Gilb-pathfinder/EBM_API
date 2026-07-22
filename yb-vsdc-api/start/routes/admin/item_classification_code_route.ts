import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const ItemClassificationCodeController = () => import('#controllers/admins/classification_codes_controller')

router.group(() => {
  router.get('/sync', [ItemClassificationCodeController, 'sync'])
})
.prefix('/item/classification')
.middleware(middleware.auth({guards: ['admin', 'api']}))
