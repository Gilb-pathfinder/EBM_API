import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const UserQueueController = () => import('#controllers/users/user_queue_controller')

router.group(() => {
  router.get('/queue/status', [UserQueueController, 'status'])
  router.post('/queue/flush',  [UserQueueController, 'flush'])
}).middleware(middleware.auth())
