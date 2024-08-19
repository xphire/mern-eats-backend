import express, {urlencoded} from 'express'
import orderWebhookRouter from './modules/orders/order.route.webhook'
import cors from 'cors'
import helmet from 'helmet'

const app = express()


//stripe needs access to the raw request in the webhook before we act on the request, this is for validation and security reasons by stripe
app.use("/stripe/api",orderWebhookRouter)

app.use(express.json())
app.use(urlencoded({extended: true}));
app.use(cors())
app.use(helmet())
app.use(helmet.hidePoweredBy())



export default app


