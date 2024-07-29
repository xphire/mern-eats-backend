import express from 'express'

import * as UserController from './user.controller'
import { jwtCheck, jwtParse } from '../../middleware/auth'

const router = express()


router
.post('/user', jwtCheck ,UserController.createUser)
.put('/user',jwtCheck,jwtParse, UserController.updateUser)
.get('/user',jwtCheck,jwtParse, UserController.fetchUser)


export default router