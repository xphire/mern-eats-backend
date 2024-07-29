import { PrismaClient, Prisma, User } from "@prisma/client";
import { createUserSchema } from "./user.schema";
import { PrismaPromise } from "@prisma/client/runtime/library";


const prisma = new PrismaClient(
    {
        errorFormat : 'pretty'
    }
)

export function createUser(user : createUserSchema ) : PrismaPromise<User>{

      return prisma.user.create({
         data : {
            ...user
         }
      })
}