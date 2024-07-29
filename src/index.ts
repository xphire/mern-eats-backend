import {Response} from 'express'
import config from 'config'
import app from './app'
import dbConnect from './database/connect';
import userRouter from './modules/users/user.route'
import errorHandler from './middleware/errorHandler'
import * as Sentry from "@sentry/node";



const PORT = config.get("port") || 9500;


//test route

app.get('/api/v1/ping', (_, res : Response) => {

       res.send('OK')
})


app.use('/api/v1/users',userRouter)


Sentry.setupExpressErrorHandler(app);


//global error handler


app.use(errorHandler)


app.listen(PORT, async () => {

    await dbConnect();

    console.log(

        {
            message :  `App is listening  on PORT : ${PORT}`,
            time : new Date().toLocaleString()
        }
    )
});




