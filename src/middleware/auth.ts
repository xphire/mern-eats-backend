import { auth } from "express-oauth2-jwt-bearer"
import config from 'config'
import { Request, Response , NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from 'jsonwebtoken'


declare global{

    namespace Express {

        interface Request {

            userId : string,
            auth0Id : string
        }
    }
}


const prisma = new PrismaClient(
    {
        errorFormat : 'pretty'
    }
)

export const jwtCheck = auth({
    audience: config.get("auth0_audience") || "",
    issuerBaseURL: config.get("auth0_issuer_base_url") || "",
    tokenSigningAlg: 'RS256'
});

//rewriting jwtcheck for proper error handling : did not work, request was stuck

// export const jwtCheck = async (req : Request , res : Response , next : NextFunction) => {

//       try { 

//         auth({
//                 audience: config.get("auth0_audience") || "",
//                  issuerBaseURL: config.get("auth0_issuer_base_url") || "",
//                  tokenSigningAlg: 'RS256'
//         });

//         next();
        
//       } catch (error) {
         
//         res.statusCode  = 401;
//         next(error)
//       }
// }


export const  jwtParse = async (req : Request , res : Response, next : NextFunction) => {

       const {authorization} = req.headers

       if (!authorization || !authorization.startsWith('Bearer')){

           throw new Error("unauthorized")
       }

       const token = authorization.split(" ")[1]

       try {

          const decoded = jwt.decode(token) as jwt.JwtPayload
          const auth0Id = decoded.sub

          const user = await prisma.user.findFirst({
             where : {
                auth0Id
             }
          })

          if (!user){

             return res.sendStatus(401)
          }

          req.auth0Id = auth0Id as string
          req.userId = user.id.toString()

          next()
        
       } catch(error) {
          
          next(error)

          

       }


}