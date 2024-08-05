import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import {Request, Response , Error, NextFunction} from 'express'
import { ZodError } from 'zod'

declare module 'express'{

    interface Error{

         status? : number,
         statusCode? : number
    }


}


//lesson here : Error handler MUST have 4 parameters

export default function (error : Error , _req : Request, res : Response, next : NextFunction) {


    console.log({
        error : error,
        time : new Date().toLocaleString()
    })

   
    const statusCode = error.status || error.statusCode

    if (statusCode === 401){
         
        res.statusCode = 401
        return res.send(renderFailure(["unauthorized"]))

    } 


    if (error instanceof ZodError ){


         const errors = error.issues.map((x) => {

            return {
                  error : x.message,
                  field : x.path
            }
         })

         res.statusCode = 400

         return res.send({
             "status" : "failed",
             "errors" : errors
         })

         

    }


    if (error instanceof PrismaClientKnownRequestError && error.code === "P2002"){
        
        res.statusCode = 400

        return res.send(renderFailure(["entity already exists"]))
    }

     res.statusCode = 500

     return res.send(renderFailure(["something went wrong"]))


} 


function renderFailure(errors : string[]){
      
    return {

        status : "failed",
        errors : errors.map((x) => {return {error : x}})
    }

}