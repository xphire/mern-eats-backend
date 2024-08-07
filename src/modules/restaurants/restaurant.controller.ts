import { Request, Response, NextFunction, Express } from "express"
import { PrismaClient } from "@prisma/client";
import * as RestaurantSchema from './restaurant.schema'
import * as Sentry from "@sentry/node";
import { processSearchQuery, uploadImage } from "../../../utils";

const prisma = new PrismaClient(
    {
        errorFormat : 'pretty'
    }
)
type pagination =  {
    
    total : number
    page : number,
    pages : number,
    
}


type searchResult =   {

     data : object[],
     pagination : pagination
}

type response = searchResult



export async function createRestaurant (req : Request<object,object, RestaurantSchema.createRestaurantSchema> , res : Response , next : NextFunction) {
    

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

export async function getRestaurant(req : Request , res : Response , next : NextFunction){


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


export async function updateRestaurant (req : Request<object, object , RestaurantSchema.createRestaurantSchema> , res : Response , next : NextFunction){

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


export async function searchRestaurant (req : Request<RestaurantSchema.searchRestaurantSchema,object,object> , res : Response<response> , next : NextFunction ){

    try {


        RestaurantSchema.searchRestaurant.parse(req.params)

        const {city} = req.params

        const searchQuery = (req.query.searchQuery as string) || ""

        //const selectedCuisines = req.query.selectedCuisines as string || ""

        const sortOption = req.query.sortOption as string || "updatedAt"

        const page = parseInt(req.query.page as string) || 1

        const pageSize = 50;

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

       //if no search query

       if(!searchQuery){

         const restaurants = await prisma.restaurant.findMany({

            where : {
               city : {
                 equals : city,
                 mode : 'insensitive'
               }
            },
            skip : skip,
            take : pageSize,
            orderBy : [
                {
                   [sortOption] : 'desc'  
                }
            ]
            
         })

         const total = restaurants.length

         if(total === 0) return res.status(404).send({data : [], pagination : {total, page : 1 , pages : 1}})

         return res.status(200).send({data : restaurants,  pagination : {total, page , pages : Math.ceil(total/pageSize)}})

       } 

       //process searchquery

       const processedQuery = processSearchQuery(searchQuery);
       
       const restaurants = await prisma.restaurant.findMany({

           where : {
              city : {
                equals : city,
                mode : 'insensitive'
              },
              cuisines : {
                 hasSome : processedQuery
              }
           },
           skip : skip,
           take : pageSize,
           orderBy : [
              {
                [sortOption] : 'desc'  
              }
           ]})

         const total = restaurants.length

         if(total === 0) return res.status(404).send({data : [], pagination : {total, page : 1 , pages : 1}})

         return res.status(200).send({data : restaurants,  pagination : {total, page , pages : Math.ceil(total/pageSize)}});
        
    } catch (error) {

        Sentry.captureException(error)
        next(error)
        
    }
}


