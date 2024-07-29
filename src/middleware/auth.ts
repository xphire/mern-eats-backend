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

export const  jwtParse = async (req : Request , res : Response, next : NextFunction) => {

       const {authorization} = req.headers

       if (!authorization || !authorization.startsWith('Bearer')){

          return res.sendStatus(401)
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
        
       } catch (error) {

          return res.sendStatus(401)

       }


}