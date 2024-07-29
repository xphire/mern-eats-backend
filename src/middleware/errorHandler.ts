import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import {Request, Response, NextFunction , Error} from 'express'
import { ZodError } from 'zod'

declare module 'express'{

    interface Error{

         status? : number,
         statusCode? : number
    }


}


export default function (error : Error , _req : Request, res : Response, _next : NextFunction ) {


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


         const msgs = error.issues.map((x) => x.message)

         res.statusCode = 400

         return res.send(renderFailure(msgs))

    }


    if (error instanceof PrismaClientKnownRequestError && error.code === "P2002"){
        
        res.statusCode = 400

        return res.send(renderFailure(["user already exists"]))
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