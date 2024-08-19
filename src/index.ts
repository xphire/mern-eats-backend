import {Response} from 'express'
import config from 'config'
import app from './app'
import dbConnect from './database/connect';
import userRouter from './modules/users/user.route'
import restaurantRouter from './modules/restaurants/restaurant.route'
import orderRouter from './modules/orders/order.route'
import ErrorHandler from './middleware/errorHandler'
import {v2 as cloudinary} from 'cloudinary'
import * as Sentry from "@sentry/node";



const PORT = config.get("port") || 9500;


cloudinary.config({

    cloud_name : config.get("cloudinary_cloud_name"),
    api_key : config.get("cloudinary_api_key"),
    api_secret : config.get("cloudinary_api_secret")

})


//test route

app.get('/api/v1/ping', (_, res : Response) => {

       res.send('OK')
})


app.use('/api/v1/users',userRouter)

app.use('/api/v1/restaurants',restaurantRouter)

app.use('/api/v1/orders',orderRouter)


Sentry.setupExpressErrorHandler(app);


//global error handler


app.use(ErrorHandler)


app.listen(PORT, async () => {

    await dbConnect();

    console.log(

        {
            message :  `App is listening  on PORT : ${PORT}`,
            time : new Date().toLocaleString()
        }
    )
});




