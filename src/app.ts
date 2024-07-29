import express, {urlencoded} from 'express'
import cors from 'cors'
import helmet from 'helmet'


const app = express()
app.use(express.json())
app.use(urlencoded({extended: true}));
app.use(cors())
app.use(helmet())
app.use(helmet.hidePoweredBy())



export default app


