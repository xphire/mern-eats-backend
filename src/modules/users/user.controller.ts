import {Request, Response , NextFunction} from 'express'
import { PrismaClient } from "@prisma/client";
//import * as UserService from '../users/user.service'
import * as UserSchema from '../users/user.schema'
import * as Sentry from "@sentry/node";


const prisma = new PrismaClient(
    {
        errorFormat : 'pretty'
    }
)


export async function createUser(req : Request<object,object,UserSchema.createUserSchema>, res : Response, next : NextFunction){

      try {


          const body = req.body

          UserSchema.createUser.parse(body)

          const existingUser = await prisma.user.findFirst({
              where : {
                  email : body.email
              }
          })

          if (existingUser) return res.status(200).send(existingUser)
          
          const user = await prisma.user.create({

             data : body

          })

          return res.status(201).send(user)

        
      } catch (error) {
         
         Sentry.captureException(error)
         next(error)
        
      }

}

export async function updateUser(req : Request<object,object,UserSchema.updateUserSchema> , res : Response , next : NextFunction) {

     try {


        UserSchema.updateUser.parse(req.body)

        const {name , addressLine1, country, city} = req.body

        const user = await prisma.user.findFirst({

            where : {
               auth0Id : req.auth0Id
            }
        })

        if(!user) res.status(404).send({status : "failed", message : "user not found"})

       
        const updatedUser = await prisma.user.update({

            data : {
                name, addressLine1, country, city
            },
            where : {
                id : req.userId
            }
        })

        res.statusCode = 200

        return res.send(updatedUser)

        
     } catch (error) {

        Sentry.captureException(error)
        next(error)
        
     }
}

export async function fetchUser(req : Request , res : Response , next : NextFunction) {

    try {


        const user = await prisma.user.findFirst({

            where : {

                id : req.userId
            },
            include : {
                orders : false
            }
        })

        if (!user) res.status(404).send({status : "failed", message : "user not found"})


        res.statusCode = 200
        
        res.send(user)


       
    } catch (error) {

       Sentry.captureException(error)
       next(error)
       
    }
}

