/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import '#start/routes/admin/admin_route'
import '#start/routes/users/user_route'
import '#start/routes/openapi_route'

router.get('/', async () => {
  return {
    hello: 'world',
  }
})
