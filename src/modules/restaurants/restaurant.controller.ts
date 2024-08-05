import { Request, Response, NextFunction, Express } from "express"
import { PrismaClient } from "@prisma/client";
import * as RestaurantSchema from './restaurant.schema'
import * as Sentry from "@sentry/node";
import cloudinary from 'cloudinary'
import { Buffer } from "buffer";




const prisma = new PrismaClient(
    {
        errorFormat : 'pretty'
    }
)

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


    //    const image = req.file as Express.Multer.File

    //    const base64Image  = Buffer.from(image.buffer).toString('base64')

    //    const dataURI = `data:${image.mimetype};base64,${base64Image}`

    //const uploadResponse = await cloudinary.v2.uploader.upload(dataURI)

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
                    imageUrl : imageUrl
                }
            })


            return res.status(200).send(updatedRestaurant)
        }
        else{

            const updatedRestaurant = await  prisma.restaurant.update({
                     
                where : {
                    userId : req.userId
                },
                data : {

                    ...body
                }

            })

            return res.status(200).send(updatedRestaurant)
        }


        
    } catch (error) {


        Sentry.captureException(error)
        next(error)
        
    }


}


const uploadImage = async (file : Express.Multer.File) => {


      const image = file 

       const base64Image  = Buffer.from(image.buffer).toString('base64')

       const dataURI = `data:${image.mimetype};base64,${base64Image}`

       const uploadResponse = await cloudinary.v2.uploader.upload(dataURI)

       return uploadResponse.url


}