import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const UserCreationsController = () => import('#controllers/admins/user_creations_controller')

router.group(() => {
  router.post('/user/create', [UserCreationsController, 'create'])
  router.post('/user/update', [UserCreationsController, 'update'])
  router.get('/users', [UserCreationsController, 'list'])
  router.get('/users/:id', [UserCreationsController, 'find'])
  router.delete('/users', [UserCreationsController, 'deleteAll'])
  router.delete('/users/:id', [UserCreationsController, 'deleteOne'])
  // Art. 7.2 — TIN reprogramming (admin/service mode only)
  router.post('/user/reprogram-tin', [UserCreationsController, 'reprogram_tin'])

}).middleware(middleware.auth({guards: ['admin']}))
