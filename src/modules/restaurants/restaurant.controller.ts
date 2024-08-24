import { Request, Response, NextFunction, Express } from "express"
import {  PrismaClient } from "@prisma/client";
import * as RestaurantSchema from './restaurant.schema'
import * as Sentry from "@sentry/node";
import { queryProcessor, searchQueryBuilder, uploadImage } from "../../../utils";

const prisma = new PrismaClient(
    {
        errorFormat : 'pretty'
    }
)
export type pagination =  {
    
    total : number
    page : number,
    pages : number,
    
}

export type searchResult =   {

     data : object[],
     pagination : pagination
}

type response = searchResult



export async function createRestaurant (req : Request<object,object,RestaurantSchema.CreateRestaurantSchema> , res : Response , next : NextFunction) {
    

    try {


       const body = req.body

       RestaurantSchema.createRestaurant.parse(body)

       const existingRestaurant = await prisma.restaurant.findFirst({
             where : {
                 userId : req.userId
             }
       })

       if (existingRestaurant) {
            
           return res.status(409).send({status : "failed", error : "User already has a restaurant"})
       }

       const imageUrl = await uploadImage(req.file as Express.Multer.File)

       const restaurant = await prisma.restaurant.create({

           data : {
              ...body,
              deliveryPrice : parseFloat(String(body.deliveryPrice)),
              estimatedDeliveryTime : parseFloat(String(body.estimatedDeliveryTime)),
              MenuItems : body.MenuItems.map((x) => {return {name : x.name, price : parseFloat(String(x.price))}}),
              imageUrl : imageUrl,
              userId : req.userId
           }
       }) 


       return res.status(201).send(restaurant)


         
        
    } catch (error) {

        Sentry.captureException(error)
        next(error)
        
    }


}

export async function getUserRestaurant(req : Request , res : Response , next : NextFunction){


    try {

        const restaurant = await prisma.restaurant.findFirst({

            where : {
                userId : req.userId
            }
        })  
        
        if(!restaurant){

            res.statusCode = 404
            res.send({message : "Restaurant not found"})
        }


        res.status(200).send(restaurant)
        
    } catch (error) {

        Sentry.captureException(error)
        next(error)
        
    }


}


export async function updateRestaurant (req : Request<object, object , RestaurantSchema.CreateRestaurantSchema> , res : Response , next : NextFunction){

    try {


        const body = req.body

        RestaurantSchema.createRestaurant.parse(body)

        const restaurant = await prisma.restaurant.findFirst({
             
            where : {
                userId : req.userId
            }
        })

        if (!restaurant){

            res.status(400).send({status : "failed", message : "restaurant not found"})
        }


        if(req.file){

            const imageUrl = await uploadImage(req.file as Express.Multer.File)

            const updatedRestaurant = await prisma.restaurant.update({

                where : {
                    userId : req.userId
                },
                data : {

                    ...body,
                    imageUrl : imageUrl,
                    deliveryPrice : parseFloat(String(body.deliveryPrice)),
                    estimatedDeliveryTime : parseFloat(String(body.estimatedDeliveryTime)),
                    MenuItems : body.MenuItems.map((x) => {return {name : x.name, price : parseFloat(String(x.price))}}),
                }
            })


            return res.status(200).send(updatedRestaurant)
        }
        else{

            const updatedRestaurant = await prisma.restaurant.update({
                     
                where : {
                    userId : req.userId
                },
                data : {

                    ...body, 
                    deliveryPrice : parseFloat(String(body.deliveryPrice)),
                    estimatedDeliveryTime : parseFloat(String(body.estimatedDeliveryTime)),
                    MenuItems : body.MenuItems.map((x) => {return {name : x.name, price : parseFloat(String(x.price))}}),
                }

            })

            return res.status(200).send(updatedRestaurant)
        }


        
    } catch (error) {


        Sentry.captureException(error)
        next(error)
        
    }


}


export async function searchRestaurant (req : Request<RestaurantSchema.SearchRestaurantParamSchema,object,object,RestaurantSchema.SearchRestaurantQuerySchema> , res : Response<response> , next : NextFunction ){

    try {

        //console.log(req.query)

        RestaurantSchema.searchRestaurantSchema.parse(req)

        const {city} = req.params

        const sortOption = req.query.sortOption as string || "updatedAt"

        const page = parseInt(req.query.page as unknown as string) || 1

        const pageSize = 5;

        const skip = pageSize * (page - 1)

        const cityCount = await prisma.restaurant.count({

           where : {
              city : {
                equals : city,
                mode : 'insensitive'
              },
           }
        })

       if (cityCount === 0){

        const total = 0
           
        return res.status(404).send({data : [], pagination : {total, page : 1 , pages : 1}})
       }

       const processedQuery = queryProcessor(req.query, city);

       const query = searchQueryBuilder(processedQuery)
       
       const restaurants = await prisma.restaurant.findMany({

           where : query,
           skip : skip,
           take : pageSize,
           orderBy : [
              {
                [sortOption] : 'asc'  
              }
           ]})

         const total = await prisma.restaurant.count({
             where : query
         })

         if(total === 0) return res.status(404).send({data : [], pagination : {total, page : 1 , pages : 1}})

         return res.status(200).send({data : restaurants,  pagination : {total, page , pages : Math.ceil(total/pageSize)}});
        
    } catch (error) {

        Sentry.captureException(error)
        next(error)
        
    }
}


export async function getRestaurantById (req : Request<RestaurantSchema.GetRestaurantSchema,object,object> , res : Response , next : NextFunction){

     try {
          
        RestaurantSchema.getRestaurantSchema.parse(req.params)

        const {id} = req.params

        const restaurant = await prisma.restaurant.findFirst({

            where:{
                id : id
            },
            include : {
                orders : false
            }
        })

        if(!restaurant) return res.status(404).send({message : "Restaurant not found"})

        res.status(200).send(restaurant)
        
     } catch (error) {


        Sentry.captureException(error)
        next(error)
        
     }
}

export async function getRestaurantOrders (req : Request , res : Response , next : NextFunction){

    try {

        const  restaurant = await prisma.restaurant.findFirst({

            where : {
                userId : req.userId
            }
            
        })

        if (!restaurant) return res.status(404).send({status: "failed", message: "Restaurant not found"})

        // console.log("restaurant ID",restaurant.id)

        // console.log("User ID",req.userId)

        
        const orders = await prisma.order.findMany({
            where : {
                restaurantId : restaurant.id
            }
        })

        
        return res.status(200).send(orders)

        
    } catch (error) {

        Sentry.captureException(error)
        next(error)
        
    }
}

export async function updateOrderStatus(req: Request, res : Response , next : NextFunction){

    try {

        const {orderId} = req.params
        const {status} = req.body

        const order = await prisma.order.findFirst({
            where : {
                id : orderId
            }
        })

        if (!order) return res.status(404).send({status: "failed", message: "order not found"})

        const restaurant = await prisma.restaurant.findFirst({
            where : {
                id : order.restaurantId
            }
        })

        if(restaurant?.userId !== req.userId) return res.status(403).send({status: "failed", message: "unauthorized"})

        const updatedOrder = await prisma.order.update({

            data : {
                status : status
            },
            where : {
                id : orderId
            }
        })

        return res.status(200).send(updatedOrder)
        
    } catch (error) {

        Sentry.captureException(error)
        next(error)
        
    }
}
