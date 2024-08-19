import express from "express"
import { stripeWebhookHandler} from "./order.controller";

const router = express.Router()

router.use(express.raw({type : "*/*"}))

router.post("/checkout/webhook",stripeWebhookHandler)

export default router;