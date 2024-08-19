import { Request, Response, NextFunction } from "express"
import {  MenuItem, PrismaClient } from "@prisma/client";
import { createLineItems, createStripeSession } from "../../../utils";
import * as  OrderSchema from "./orders.schema"
import * as Sentry from "@sentry/node";
import Stripe from "stripe";
import config from "config";

const STRIPE = new Stripe(config.get("stripe_api_key") as string)
const FRONTEND_URL = config.get("frontend_url") as string
const STRIPE_ENDPOINT_SECRET = config.get("stripe_webhook_signing_secret") as string

const prisma = new PrismaClient(
    {
        errorFormat : 'pretty'
    }
)


export const createCheckoutSession = async (req : Request<object,object, OrderSchema.CheckOutSessionRequestSchema>, res : Response, next : NextFunction) => {
    

    try{

        const result  = OrderSchema.checkoutSessionRequest.parse(req.body)

        const restaurant = await prisma.restaurant.findFirst({
              
            where : {
                id : result.restaurantId
            }
        })


        if(!!restaurant === false){

            res.statusCode = 404

            res.send({status : "failed" , message: "No restaurant found"})
        }

        const lineItems = createLineItems(result, restaurant?.MenuItems as MenuItem[])

        const totalAmount = lineItems.reduce((total,current) => total + (current?.price_data?.unit_amount ?? 0) ,0)

        const newOrder = await  prisma.order.create({

            data : {
                restaurantId : result.restaurantId,
                userId : req.userId,
                status : "placed",
                deliveryDetails : result.deliveryDetails,
                totalAmount : totalAmount,
                cartItems : result.cartItems
            }
        })

        const session = await createStripeSession(
            STRIPE,
            FRONTEND_URL,
            lineItems,
            newOrder.id,
            restaurant?.deliveryPrice as number, 
            restaurant?.id as string
        )

        if(!session.url) throw new Error("Error creating stripe session")


        res.status(200).send({url : session.url})


    }catch(error){

        Sentry.captureException(error)
        next(error)

    }

}

export const stripeWebhookHandler = async (req : Request, res : Response, next: NextFunction) => {

       let event;

        try {

            const signature = req.headers["stripe-signature"]

            event = STRIPE.webhooks.constructEvent(req.body, signature as string,STRIPE_ENDPOINT_SECRET)


            if (event.type === "checkout.session.completed"){

                const order = await prisma.order.findFirst({
                    where :{
                        id : event.data.object.metadata?.orderId
                    }
                })
    
                if(!order){
                    return res.status(404).json({message : "Order not found"})
                }

                res.status(200).send()
    
                order.totalAmount = event.data.object.amount_total as number
                order.status = "paid"
                
                
                // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
                const {id, createdAt,updatedAt, ...rest} = order 
    
                await prisma.order.update({
                    data : rest,
                    where : {
                        id : id
                    }
                })

                return;
    
               
            }
            
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error : any) {

            if (error instanceof Stripe.errors.StripeError){
                
                 //stripe recommended sending back the below
                return res.status(400).send(`Webhook error: ${error.message}`) 
                  
            }

            Sentry.captureException(error)
            next(error)
           
            
        }

       
}