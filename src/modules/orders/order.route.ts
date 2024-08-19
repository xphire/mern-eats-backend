import express from "express"
import { jwtCheck, jwtParse } from "../../middleware/auth";
import { createCheckoutSession} from "./order.controller";

const router = express.Router()

router.post("/order/checkout/create-checkout-session", jwtCheck,jwtParse,createCheckoutSession)


//router.post("/order/checkout/webhook", stripeWebhookHandler)

export default router;