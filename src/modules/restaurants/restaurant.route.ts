import express from 'express'
import multer from 'multer'
import { jwtCheck, jwtParse } from '../../middleware/auth'

import * as RestaurantController from './restaurant.controller'

const router = express.Router()

const storage = multer.memoryStorage()

const upload = multer({
    storage : storage,
    limits : {
        fileSize : 5 * 1024 * 1024, //5mb 

    }
})


//user restaurant routes
router
.route('/restaurant')
.all(jwtCheck,jwtParse)
.post(upload.single('imageFile'),RestaurantController.createRestaurant)
.get(RestaurantController.getRestaurant)
.put(upload.single('imageFile'),RestaurantController.updateRestaurant)


//search restaurant routes

router.get("/search/:city", RestaurantController.searchRestaurant)




export default router